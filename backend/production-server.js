const express = require('express');
const fs = require('fs').promises;
const csv = require('csv-parser');
const { createReadStream } = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// Data paths
const CSV_PATH = '/Users/manuayala/Documents/LAGOS/01_BUSINESS_ACTIVE/outreach_app/NORMALIZER/01_PROCESSED/CONTRACTORS - Master_Sheet.csv';
const CAMPAIGN_JSON_PATH = '/Users/manuayala/Documents/LAGOS/FOCUS_INTEL_SYSTEM/MASTER_CAMPAIGN_DATABASE.json';

// In-memory cache for performance
let contractorsCache = null;
let campaignsCache = null;
let lastLoadTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Data loading functions
async function loadCampaignsData() {
    try {
        console.log('Loading campaigns data...');
        const data = await fs.readFile(CAMPAIGN_JSON_PATH, 'utf8');
        const campaigns = JSON.parse(data);
        console.log(`Loaded ${Object.keys(campaigns.contractors || {}).length} campaigns`);
        return campaigns;
    } catch (error) {
        console.error('Error loading campaigns:', error);
        return { contractors: {} };
    }
}

async function loadContractorsData() {
    return new Promise((resolve, reject) => {
        const contractors = [];
        let lineCount = 0;
        
        console.log('Loading contractors CSV...');
        createReadStream(CSV_PATH)
            .pipe(csv())
            .on('data', (row) => {
                lineCount++;
                
                // Skip malformed rows
                if (!row.business_id || !row.L1_company_name) return;
                
                try {
                    const contractor = {
                        business_id: row.business_id,
                        company_name: row.L1_company_name,
                        category: row.L1_category || 'Unknown',
                        email: row.L1_primary_email || '',
                        phone: row.L1_phone || '',
                        website: row.L1_website || '',
                        address: row.L1_address_full || '',
                        city: row.L1_city || '',
                        state: row.L1_state_code || '',
                        completion_score: parseInt(row.data_completion_score) || 0,
                        google_rating: parseFloat(row.L1_google_rating) || 0,
                        reviews_count: parseInt(row.L1_google_reviews_count) || 0,
                        business_status: row.L1_business_status || 'UNKNOWN',
                        sophistication_score: parseInt(row.L2_sophistication_score) || 0,
                        trust_score: parseFloat(row.L2_trust_score) || 0,
                        targeting_flags: row.L2_targeting_flags || '',
                        industry_psychology: row.L3_industry_psychology_triggers || '',
                        outreach_priority: row.L1_targeting_outreach_priority || 'MEDIUM'
                    };
                    
                    contractors.push(contractor);
                } catch (err) {
                    console.warn(`Skipping malformed row ${lineCount}:`, err.message);
                }
            })
            .on('end', () => {
                console.log(`Loaded ${contractors.length} contractors from CSV`);
                resolve(contractors);
            })
            .on('error', (error) => {
                console.error('CSV parsing error:', error);
                reject(error);
            });
    });
}

async function getUnifiedData(forceRefresh = false) {
    const now = Date.now();
    
    if (!forceRefresh && contractorsCache && lastLoadTime && (now - lastLoadTime) < CACHE_DURATION) {
        console.log('Using cached data');
        return { contractors: contractorsCache, campaigns: campaignsCache };
    }
    
    console.log('Refreshing data cache...');
    try {
        const [contractors, campaigns] = await Promise.all([
            loadContractorsData(),
            loadCampaignsData()
        ]);
        
        // Merge campaign data with contractors
        const unifiedContractors = contractors.map(contractor => {
            const campaignData = campaigns.contractors?.[contractor.business_id];
            return {
                ...contractor,
                has_campaign: !!campaignData,
                campaign_data: campaignData || null,
                campaign_status: campaignData ? 'READY' : 'NO_CAMPAIGN'
            };
        });
        
        contractorsCache = unifiedContractors;
        campaignsCache = campaigns;
        lastLoadTime = now;
        
        console.log(`Data refreshed: ${unifiedContractors.length} contractors with campaigns merged`);
        return { contractors: unifiedContractors, campaigns };
        
    } catch (error) {
        console.error('Error loading unified data:', error);
        throw error;
    }
}

// API Routes

// Dashboard overview
app.get('/api/dashboard', async (req, res) => {
    try {
        const { contractors, campaigns } = await getUnifiedData();
        
        const stats = {
            total_contractors: contractors.length,
            ready_campaigns: contractors.filter(c => c.has_campaign).length,
            completion_80_plus: contractors.filter(c => c.completion_score >= 80).length,
            sent_this_week: Math.floor(Math.random() * 50), // Placeholder - would track in real system
            average_completion: Math.round(contractors.reduce((sum, c) => sum + c.completion_score, 0) / contractors.length),
            by_trade: contractors.reduce((acc, c) => {
                acc[c.category] = (acc[c.category] || 0) + 1;
                return acc;
            }, {}),
            by_priority: contractors.reduce((acc, c) => {
                acc[c.outreach_priority] = (acc[c.outreach_priority] || 0) + 1;
                return acc;
            }, {})
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

// Contractors list with pagination and filtering
app.get('/api/contractors', async (req, res) => {
    try {
        const { contractors } = await getUnifiedData();
        
        // Parse query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50); // Max 50 per page
        const search = req.query.search?.toLowerCase() || '';
        const trade = req.query.trade || '';
        const completion = req.query.completion || '';
        const campaign_status = req.query.campaign_status || '';
        const priority = req.query.priority || '';
        
        // Apply filters
        let filtered = contractors;
        
        if (search) {
            filtered = filtered.filter(c => 
                c.company_name.toLowerCase().includes(search) ||
                c.email.toLowerCase().includes(search) ||
                c.city.toLowerCase().includes(search)
            );
        }
        
        if (trade && trade !== 'All Trades') {
            filtered = filtered.filter(c => c.category === trade);
        }
        
        if (completion) {
            switch (completion) {
                case '90-100%':
                    filtered = filtered.filter(c => c.completion_score >= 90);
                    break;
                case '80-89%':
                    filtered = filtered.filter(c => c.completion_score >= 80 && c.completion_score < 90);
                    break;
                case '70-79%':
                    filtered = filtered.filter(c => c.completion_score >= 70 && c.completion_score < 80);
                    break;
            }
        }
        
        if (campaign_status) {
            switch (campaign_status) {
                case 'Has Campaign':
                    filtered = filtered.filter(c => c.has_campaign);
                    break;
                case 'No Campaign':
                    filtered = filtered.filter(c => !c.has_campaign);
                    break;
            }
        }
        
        if (priority && priority !== 'All Priority') {
            filtered = filtered.filter(c => c.outreach_priority === priority);
        }
        
        // Sort by completion score (highest first) then by company name
        filtered.sort((a, b) => {
            if (b.completion_score !== a.completion_score) {
                return b.completion_score - a.completion_score;
            }
            return a.company_name.localeCompare(b.company_name);
        });
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedContractors = filtered.slice(startIndex, endIndex);
        
        // Response
        res.json({
            contractors: paginatedContractors,
            pagination: {
                current_page: page,
                per_page: limit,
                total_items: filtered.length,
                total_pages: Math.ceil(filtered.length / limit),
                has_next: endIndex < filtered.length,
                has_prev: startIndex > 0
            },
            filters_applied: {
                search: search || null,
                trade: trade || null,
                completion: completion || null,
                campaign_status: campaign_status || null,
                priority: priority || null
            }
        });
        
    } catch (error) {
        console.error('Contractors API error:', error);
        res.status(500).json({ error: 'Failed to load contractors' });
    }
});

// Get single contractor with campaign details
app.get('/api/contractors/:id', async (req, res) => {
    try {
        const { contractors, campaigns } = await getUnifiedData();
        const contractor = contractors.find(c => c.business_id === req.params.id);
        
        if (!contractor) {
            return res.status(404).json({ error: 'Contractor not found' });
        }
        
        res.json(contractor);
    } catch (error) {
        console.error('Single contractor error:', error);
        res.status(500).json({ error: 'Failed to load contractor' });
    }
});

// Get campaign details for copy-paste
app.get('/api/contractors/:id/campaign', async (req, res) => {
    try {
        const { campaigns } = await getUnifiedData();
        const campaignData = campaigns.contractors?.[req.params.id];
        
        if (!campaignData) {
            return res.status(404).json({ error: 'No campaign found for this contractor' });
        }
        
        res.json(campaignData);
    } catch (error) {
        console.error('Campaign details error:', error);
        res.status(500).json({ error: 'Failed to load campaign details' });
    }
});

// Get available filter options
app.get('/api/filters', async (req, res) => {
    try {
        const { contractors } = await getUnifiedData();
        
        const trades = [...new Set(contractors.map(c => c.category))].sort();
        const priorities = [...new Set(contractors.map(c => c.outreach_priority))].sort();
        const states = [...new Set(contractors.map(c => c.state).filter(s => s))].sort();
        
        res.json({
            trades,
            priorities,
            states,
            completion_ranges: ['90-100%', '80-89%', '70-79%', '60-69%', 'Below 60%'],
            campaign_statuses: ['Has Campaign', 'No Campaign', 'In Progress']
        });
    } catch (error) {
        console.error('Filters error:', error);
        res.status(500).json({ error: 'Failed to load filter options' });
    }
});

// Force data refresh
app.post('/api/data/refresh', async (req, res) => {
    try {
        console.log('Force refreshing data...');
        await getUnifiedData(true);
        res.json({ success: true, message: 'Data refreshed successfully' });
    } catch (error) {
        console.error('Force refresh error:', error);
        res.status(500).json({ error: 'Failed to refresh data' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        cache_status: contractorsCache ? 'loaded' : 'empty',
        last_load: lastLoadTime ? new Date(lastLoadTime).toISOString() : null,
        cached_contractors: contractorsCache ? contractorsCache.length : 0
    });
});

// Serve the main UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/simple.html'));
});

// Start server
app.listen(PORT, async () => {
    console.log(`Production Contractor Intelligence Hub V4 server running on port ${PORT}`);
    console.log('Loading initial data...');
    
    try {
        await getUnifiedData();
        console.log('✅ Initial data loaded successfully');
        console.log(`📊 Ready to serve ${contractorsCache.length} contractors with real-time performance`);
        console.log(`🌐 Access the dashboard at: http://localhost:${PORT}`);
    } catch (error) {
        console.error('❌ Failed to load initial data:', error);
        console.log('Server running but data loading failed. Check data source paths.');
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
});