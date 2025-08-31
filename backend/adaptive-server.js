/**
 * ADAPTIVE SERVER - Express backend for Contractor Intelligence Hub V4
 * Scales with data volume and provides comprehensive API for operations
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

// Import utilities
const DataUnifier = require('./utils/data-unifier');
const CompletionCalculator = require('./utils/completion-calculator');
const ExportEngine = require('./utils/export-engine');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize utilities
const dataUnifier = new DataUnifier();
const completionCalculator = new CompletionCalculator();
const exportEngine = new ExportEngine();

// Global data cache for performance
let contractorsCache = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * 🚨 INTERFACE ONLY MODE - Always return empty data
 */
async function ensureFreshData(req, res, next) {
  try {
    // 🚨 DISABLED: All real data loading
    // const now = Date.now();
    // if (!contractorsCache || !lastCacheUpdate || (now - lastCacheUpdate) > CACHE_DURATION) {
    //   const data = await dataUnifier.loadUnifiedData();
    //   ... real data loading code disabled
    // }
    
    // 🚨 INTERFACE ONLY: Always return empty contractor data
    console.log('🚨 INTERFACE MODE: Providing empty data for UI display');
    contractorsCache = {
      contractors: [], // Empty array - no contractor data
      metrics: {
        total_contractors: 0,
        data_density: 'INTERFACE_ONLY',
        ui_scale_mode: 'DETAILED'
      },
      database_info: {
        unified_at: new Date().toISOString(),
        status: 'INTERFACE_ONLY_MODE'
      }
    };
    lastCacheUpdate = Date.now();
    
    next();
  } catch (error) {
    console.error('❌ Interface mode error:', error.message);
    res.status(500).json({ 
      error: 'Interface mode failed', 
      message: error.message
    });
  }
}

// =============================================================================
// API ROUTES
// =============================================================================

/**
 * Dashboard overview data
 */
app.get('/api/dashboard', ensureFreshData, async (req, res) => {
  try {
    const contractors = contractorsCache.contractors;
    const metrics = contractorsCache.metrics;
    
    // Generate today's actionable tasks
    const todayActions = {
      ready_to_send: contractors.filter(c => 
        c.has_campaign && c.campaign_status === 'READY'
      ).length,
      needs_enrichment: contractors.filter(c => 
        c.data_completion_score < 80 && c.data_completion_score > 50
      ).length,
      follow_ups_due: contractors.filter(c => 
        c.next_followup_date && new Date(c.next_followup_date) <= new Date()
      ).length,
      high_priority: contractors.filter(c => 
        c.outreach_priority === 'HIGH' && !c.has_campaign
      ).length
    };

    // Pipeline status
    const pipeline = {
      queue: contractors.filter(c => !c.has_campaign && c.data_completion_score >= 70).length,
      ready: contractors.filter(c => c.has_campaign && c.campaign_status === 'READY').length,
      sent: contractors.filter(c => c.campaign_status === 'SENT').length,
      complete: contractors.filter(c => c.campaign_status === 'COMPLETE').length
    };

    // Calculate completion analytics
    const completionAnalytics = completionCalculator.generateCompletionAnalytics(contractors);

    res.json({
      overview: {
        total_contractors: contractors.length,
        data_density: metrics.data_density,
        ui_scale_mode: metrics.ui_scale_mode,
        last_updated: contractorsCache.database_info.unified_at
      },
      today_actions: todayActions,
      pipeline,
      metrics,
      completion_analytics: completionAnalytics,
      performance: {
        cache_age: Math.round((Date.now() - lastCacheUpdate) / 1000),
        response_optimized: contractors.length > 1000 ? 'COMPRESSED' : 'FULL'
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(500).json({ error: 'Dashboard data failed', message: error.message });
  }
});

/**
 * Get contractors with streaming-capable filtering and pagination
 * PERFORMANCE FIX: Process data in chunks to prevent browser crashes
 */
app.get('/api/contractors', ensureFreshData, async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Get ALL contractors for proper filtering and sorting
    let contractors = [...contractorsCache.contractors];
    const originalCount = contractors.length;
    
    // Apply filters efficiently
    const filters = req.query;
    
    if (filters.has_campaign !== undefined) {
      const hasCampaign = filters.has_campaign === 'true';
      contractors = contractors.filter(c => c.has_campaign === hasCampaign);
    }
    
    if (filters.min_completion) {
      contractors = contractors.filter(c => c.data_completion_score >= parseInt(filters.min_completion));
    }
    
    if (filters.category) {
      contractors = contractors.filter(c => 
        c.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    
    if (filters.state) {
      contractors = contractors.filter(c => c.state_code === filters.state.toUpperCase());
    }
    
    if (filters.business_health) {
      contractors = contractors.filter(c => c.business_health === filters.business_health);
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      contractors = contractors.filter(c => 
        c.company_name.toLowerCase().includes(search) ||
        c.primary_email.toLowerCase().includes(search) ||
        c.city.toLowerCase().includes(search) ||
        c.business_id.includes(search)
      );
    }

    // Sorting (still need to sort ALL results for proper pagination)
    const sortBy = filters.sort_by || 'data_completion_score';
    const sortOrder = filters.sort_order || 'desc';
    
    contractors.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    });

    // STREAMING PAGINATION: Dynamically adjust page size based on performance
    const page = parseInt(filters.page) || 1;
    let requestedLimit = parseInt(filters.limit) || 20;
    
    // PERFORMANCE PROTECTION: Auto-adjust limit based on data size and filters
    let adaptiveLimit = 20; // Default safe size
    
    if (contractors.length > 2000) {
      adaptiveLimit = 15; // Smaller pages for huge datasets
    } else if (contractors.length > 1000) {
      adaptiveLimit = 18; // Medium pages for large datasets
    } else if (contractors.length > 500) {
      adaptiveLimit = 25; // Larger pages for medium datasets
    } else {
      adaptiveLimit = 30; // Max pages for small datasets
    }
    
    // Never exceed the adaptive limit
    const limit = Math.min(adaptiveLimit, requestedLimit);
    const offset = (page - 1) * limit;
    
    // Get the page slice
    const paginatedContractors = contractors.slice(offset, offset + limit);
    
    const processingTime = Date.now() - startTime;
    
    // PERFORMANCE WARNING: Log slow operations
    if (processingTime > 1000) {
      console.warn(`SLOW QUERY: ${processingTime}ms for ${contractors.length} records`);
    }
    
    res.json({
      contractors: paginatedContractors,
      pagination: {
        current_page: page,
        per_page: limit,
        total_records: contractors.length,
        total_pages: Math.ceil(contractors.length / limit),
        adaptive_limit: adaptiveLimit,
        performance_adjusted: limit !== requestedLimit
      },
      filters_applied: filters,
      performance: {
        filtered_count: contractors.length,
        original_count: originalCount,
        processing_time_ms: processingTime,
        performance_tier: processingTime < 500 ? 'FAST' : processingTime < 1000 ? 'MEDIUM' : 'SLOW',
        recommended_page_size: adaptiveLimit
      },
      meta: {
        dataset_size: originalCount > 2000 ? 'LARGE' : originalCount > 500 ? 'MEDIUM' : 'SMALL',
        browser_safety: 'PROTECTED'
      }
    });

  } catch (error) {
    console.error('Contractors fetch error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch contractors', 
      message: error.message,
      performance_hint: 'Try reducing filters or page size'
    });
  }
});

/**
 * Get single contractor details
 */
app.get('/api/contractors/:id', ensureFreshData, async (req, res) => {
  try {
    const contractor = contractorsCache.contractors.find(c => 
      c.business_id === req.params.id
    );
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    // Generate fresh completion analysis
    const completionData = completionCalculator.calculateScore(contractor);
    
    res.json({
      contractor: {
        ...contractor,
        ...completionData
      }
    });

  } catch (error) {
    console.error('Contractor fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch contractor', message: error.message });
  }
});

/**
 * Update contractor data
 */
app.put('/api/contractors/:id', ensureFreshData, async (req, res) => {
  try {
    const contractorIndex = contractorsCache.contractors.findIndex(c => 
      c.business_id === req.params.id
    );
    
    if (contractorIndex === -1) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    const currentContractor = contractorsCache.contractors[contractorIndex];
    const updates = req.body;

    // Update contractor using completion calculator
    const updateResult = completionCalculator.updateContractorScore(currentContractor, updates);
    
    // Update in cache
    contractorsCache.contractors[contractorIndex] = updateResult.contractor;
    
    // Save to unified data file
    await fs.writeJson(dataUnifier.unifiedDataPath, contractorsCache, { spaces: 2 });
    
    res.json({
      success: true,
      contractor: updateResult.contractor,
      changes: {
        score_change: updateResult.score_change,
        tier_change: updateResult.tier_change,
        improvement_impact: updateResult.improvement_impact
      }
    });

  } catch (error) {
    console.error('Contractor update error:', error.message);
    res.status(500).json({ error: 'Failed to update contractor', message: error.message });
  }
});

/**
 * Get campaign data for contractor
 */
app.get('/api/contractors/:id/campaign', ensureFreshData, async (req, res) => {
  try {
    const contractor = contractorsCache.contractors.find(c => 
      c.business_id === req.params.id
    );
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    if (!contractor.has_campaign) {
      return res.status(404).json({ error: 'No campaign found for this contractor' });
    }

    res.json({
      campaign: contractor.campaign_data,
      status: contractor.campaign_status,
      execution: {
        emails_sent: contractor.emails_sent,
        last_contact_date: contractor.last_contact_date,
        next_followup_date: contractor.next_followup_date
      }
    });

  } catch (error) {
    console.error('Campaign fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch campaign', message: error.message });
  }
});

/**
 * Update campaign execution status
 */
app.post('/api/contractors/:id/campaign/update', ensureFreshData, async (req, res) => {
  try {
    const contractorIndex = contractorsCache.contractors.findIndex(c => 
      c.business_id === req.params.id
    );
    
    if (contractorIndex === -1) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    const contractor = contractorsCache.contractors[contractorIndex];
    const { action, email_sequence, notes } = req.body;

    // Update based on action
    if (action === 'mark_sent') {
      contractor.emails_sent = (contractor.emails_sent || 0) + 1;
      contractor.last_contact_date = new Date().toISOString();
      contractor.campaign_status = contractor.emails_sent >= 3 ? 'COMPLETE' : 'SENT';
      
      // Calculate next followup (business logic can be enhanced)
      if (contractor.emails_sent < 3) {
        const followupDate = new Date();
        followupDate.setDate(followupDate.getDate() + (email_sequence === 1 ? 3 : 7));
        contractor.next_followup_date = followupDate.toISOString();
      }
    }

    contractor.updated_at = new Date().toISOString();

    // Save changes
    await fs.writeJson(dataUnifier.unifiedDataPath, contractorsCache, { spaces: 2 });
    
    res.json({
      success: true,
      contractor,
      action_taken: action
    });

  } catch (error) {
    console.error('Campaign update error:', error.message);
    res.status(500).json({ error: 'Failed to update campaign', message: error.message });
  }
});

/**
 * Trigger data unification
 */
app.post('/api/data/unify', async (req, res) => {
  try {
    console.log('Starting manual data unification...');
    const result = await dataUnifier.unifyData();
    
    if (result.success) {
      // Clear cache to force refresh
      contractorsCache = null;
      lastCacheUpdate = null;
      
      res.json({
        success: true,
        message: 'Data unification completed successfully',
        metrics: result.metrics
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Unification error:', error.message);
    res.status(500).json({ error: 'Unification failed', message: error.message });
  }
});

/**
 * Export data to CSV
 */
app.post('/api/export/csv', ensureFreshData, async (req, res) => {
  try {
    const options = req.body;
    const contractors = contractorsCache.contractors;
    
    const exportResult = await exportEngine.generateCSVExport(contractors, options);
    
    if (exportResult.success) {
      res.json({
        success: true,
        message: 'CSV export completed successfully',
        export_info: exportResult
      });
    } else {
      res.status(500).json({
        success: false,
        error: exportResult.error
      });
    }

  } catch (error) {
    console.error('Export error:', error.message);
    res.status(500).json({ error: 'Export failed', message: error.message });
  }
});

/**
 * Get export status
 */
app.get('/api/export/status', async (req, res) => {
  try {
    const status = await exportEngine.getSyncStatus();
    const stats = contractorsCache ? 
      exportEngine.generateExportStats(contractorsCache.contractors) : null;
    
    res.json({
      sync_status: status,
      export_stats: stats
    });

  } catch (error) {
    console.error('Export status error:', error.message);
    res.status(500).json({ error: 'Failed to get export status', message: error.message });
  }
});

// =============================================================================
// MIDDLEWARE FOR PERFORMANCE TRACKING
// =============================================================================

app.use((req, res, next) => {
  req.start_time = Date.now();
  next();
});

// =============================================================================
// SERVE MAIN APPLICATION
// =============================================================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/operations-hub.html'));
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

async function startServer() {
  try {
    console.log('\nStarting Contractor Intelligence Hub V4 - INTERFACE ONLY MODE...');
    
    // 🚨 DISABLED: Real data initialization
    // console.log('Initializing data unification...');
    // const initResult = await dataUnifier.unifyData();
    
    // 🚨 INTERFACE ONLY: Fake success result for clean startup
    const initResult = {
      success: true,
      metrics: {
        total_contractors: 0,
        ui_scale_mode: 'INTERFACE_ONLY'
      }
    };
    
    console.log(`✅ Interface mode ready: No contractor data loaded (interface only)`);

    app.listen(PORT, () => {
      console.log('\nCONTRACTOR INTELLIGENCE HUB V4 - INTERFACE ONLY MODE READY');
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log(`║  Server: http://localhost:${PORT}                     ║`);
      console.log(`║  Data: 0 contractors (interface only)                 ║`);
      console.log(`║  UI: Interface mode - all components visible          ║`);
      console.log('║  Status: Data loading disabled for development        ║');
      console.log('╚══════════════════════════════════════════════════════════╝');
      console.log('\nThe Doc is ready - interface only mode active!\n');
      console.log('To re-enable data loading:');
      console.log('1. Comment out the disabled sections in operations.js');
      console.log('2. Comment out the disabled sections in adaptive-server.js');
      console.log('3. Restart the server\n');
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server gracefully...');
  process.exit(0);
});

startServer();