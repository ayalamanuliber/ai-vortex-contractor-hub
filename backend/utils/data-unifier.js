/**
 * DATA UNIFIER - Smart merging of CSV + JSON contractor data
 * Handles both Master_Sheet.csv (4000+) and MASTER_CAMPAIGN_DATABASE.json (105+)
 * Adaptive scaling: Works with any data volume
 */

const fs = require('fs-extra');
const path = require('path');
const { parse } = require('csv-parse/sync');

class DataUnifier {
  constructor() {
    this.masterSheetPath = '/Users/manuayala/Documents/LAGOS/01_BUSINESS_ACTIVE/outreach_app/NORMALIZER/01_PROCESSED/CONTRACTORS - Master_Sheet.csv';
    this.campaignDbPath = '/Users/manuayala/Documents/LAGOS/FOCUS_INTEL_SYSTEM/MASTER_CAMPAIGN_DATABASE.json';
    this.unifiedDataPath = path.join(__dirname, '../../data/master-contractors.json');
    this.campaignOverlayPath = path.join(__dirname, '../../data/campaign-overlay.json');
    this.executionStatePath = path.join(__dirname, '../../data/execution-state.json');
  }

  /**
   * Load and parse CSV data with intelligent chunking for large files
   */
  async loadCsvData() {
    try {
      console.log('Loading CSV data from Master_Sheet...');
      const csvContent = await fs.readFile(this.masterSheetPath, 'utf-8');
      
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: ',',
        quote: '"'
      });

      console.log(`Loaded ${records.length} contractors from CSV`);
      return records;
    } catch (error) {
      console.error('Error loading CSV data:', error.message);
      return [];
    }
  }

  /**
   * Load campaign database JSON
   */
  async loadCampaignData() {
    try {
      console.log('Loading campaign data from JSON...');
      const campaignData = await fs.readJson(this.campaignDbPath);
      
      // Convert contractors object to array
      const contractorsObj = campaignData.contractors || {};
      const campaigns = Object.keys(contractorsObj).map(businessId => {
        const contractor = contractorsObj[businessId];
        return {
          business_id: businessId,
          ...contractor
        };
      });
      
      console.log(`Loaded ${campaigns.length} ready campaigns from JSON`);
      return { 
        info: campaignData.database_info || {}, 
        campaigns 
      };
    } catch (error) {
      console.error('Error loading campaign data:', error.message);
      return { info: {}, campaigns: [] };
    }
  }

  /**
   * Smart matching between CSV and JSON data using business_id
   */
  matchContractorData(csvRecords, campaigns) {
    console.log('Starting intelligent data matching...');
    const matched = [];
    const unmatched = [];
    
    // Create lookup map for campaigns
    const campaignMap = new Map();
    campaigns.forEach(campaign => {
      if (campaign.business_id) {
        campaignMap.set(campaign.business_id.toString(), campaign);
      }
    });

    // Process CSV records and merge with campaigns
    csvRecords.forEach(contractor => {
      const businessId = contractor.business_id?.toString();
      const campaign = campaignMap.get(businessId);
      
      const unifiedContractor = {
        // Base data from CSV
        business_id: businessId,
        company_name: contractor.L1_company_name || 'Unknown Company',
        category: contractor.L1_category || 'General',
        primary_email: contractor.L1_primary_email?.trim() || '',
        phone: contractor.L1_phone || '',
        website: contractor.L1_website || '',
        address_full: contractor.L1_address_full || '',
        city: contractor.L1_city || '',
        state_code: contractor.L1_state_code || '',
        postal_code: contractor.L1_postal_code || '',
        
        // Completion and quality metrics
        data_completion_score: parseFloat(contractor.data_completion_score) || 0,
        google_rating: parseFloat(contractor.L1_google_rating) || 0,
        google_reviews_count: parseInt(contractor.L1_google_reviews_count) || 0,
        business_health: contractor.L1_targeting_business_health || 'UNKNOWN',
        outreach_priority: contractor.L1_targeting_outreach_priority || 'MEDIUM',
        
        // Intelligence data
        sophistication_score: parseInt(contractor.L2_sophistication_score) || 0,
        sophistication_tier: contractor.L3_sophistication_intelligence_tier || 'Growing',
        email_quality: contractor.L2_email_quality || 'UNKNOWN',
        trust_score: parseFloat(contractor.L2_trust_score) || 0,
        
        // Business intelligence
        pricing_psychology: contractor.L5_targeting_pricing_psychology || 'value',
        primary_angle: contractor.L5_outreach_primary_angle || 'general',
        conversion_probability: contractor.L5_outreach_conversion_probability || 'medium',
        
        // Campaign overlay (if exists)
        has_campaign: !!campaign,
        campaign_data: campaign || null,
        
        // Status tracking
        campaign_status: campaign ? 'READY' : 'NO_CAMPAIGN',
        last_contact_date: null,
        next_followup_date: null,
        emails_sent: 0,
        
        // Raw data for advanced operations
        raw_csv_data: contractor,
        
        // Timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (campaign) {
        matched.push(unifiedContractor);
      } else {
        unmatched.push(unifiedContractor);
      }
    });

    console.log(`Matching complete: ${matched.length} with campaigns, ${unmatched.length} without campaigns`);
    return { matched, unmatched, all: [...matched, ...unmatched] };
  }

  /**
   * Calculate adaptive metrics based on data volume
   */
  calculateAdaptiveMetrics(unifiedData) {
    const total = unifiedData.length;
    const withCampaigns = unifiedData.filter(c => c.has_campaign).length;
    const highCompletion = unifiedData.filter(c => c.data_completion_score >= 80).length;
    const readyToSend = unifiedData.filter(c => c.has_campaign && c.campaign_status === 'READY').length;

    return {
      total_contractors: total,
      with_campaigns: withCampaigns,
      without_campaigns: total - withCampaigns,
      completion_80_plus: highCompletion,
      completion_percentage: Math.round((highCompletion / total) * 100),
      ready_to_send: readyToSend,
      enhancement_queue: total - highCompletion,
      
      // Adaptive scaling metrics
      data_density: total > 1000 ? 'HIGH' : total > 100 ? 'MEDIUM' : 'LOW',
      ui_scale_mode: total > 2000 ? 'COMPACT' : total > 500 ? 'BALANCED' : 'DETAILED',
      
      // Quality distribution
      quality_tiers: {
        premium: unifiedData.filter(c => c.data_completion_score >= 90).length,
        good: unifiedData.filter(c => c.data_completion_score >= 80 && c.data_completion_score < 90).length,
        needs_work: unifiedData.filter(c => c.data_completion_score >= 70 && c.data_completion_score < 80).length,
        low_quality: unifiedData.filter(c => c.data_completion_score < 70).length
      },
      
      // Business health distribution
      health_distribution: {
        healthy: unifiedData.filter(c => c.business_health === 'HEALTHY').length,
        emerging: unifiedData.filter(c => c.business_health === 'EMERGING').length,
        struggling: unifiedData.filter(c => c.business_health === 'STRUGGLING').length
      }
    };
  }

  /**
   * Generate execution state for campaign tracking
   */
  generateExecutionState(unifiedData) {
    const readyCampaigns = unifiedData.filter(c => c.has_campaign);
    
    return {
      generated_at: new Date().toISOString(),
      pipeline_status: {
        queue: unifiedData.filter(c => !c.has_campaign && c.data_completion_score >= 70).length,
        ready: readyCampaigns.length,
        sent: 0, // Will be updated as campaigns are executed
        complete: 0 // Will be updated as replies come in
      },
      today_actions: {
        ready_to_send: readyCampaigns.filter(c => c.campaign_status === 'READY').length,
        needs_enrichment: unifiedData.filter(c => c.data_completion_score < 80).length,
        follow_ups_due: 0 // Will be calculated based on timing
      },
      last_sync: new Date().toISOString()
    };
  }

  /**
   * Master unification process - combines all data sources
   */
  async unifyData() {
    try {
      console.log('\nStarting data unification process...');
      
      // Load data sources
      const [csvRecords, campaignData] = await Promise.all([
        this.loadCsvData(),
        this.loadCampaignData()
      ]);

      if (csvRecords.length === 0) {
        throw new Error('No CSV data loaded - check file path');
      }

      // Match and merge data
      const matchingResults = this.matchContractorData(csvRecords, campaignData.campaigns);
      const unifiedData = matchingResults.all;

      // Calculate metrics
      const metrics = this.calculateAdaptiveMetrics(unifiedData);
      const executionState = this.generateExecutionState(unifiedData);

      // Ensure data directories exist
      await fs.ensureDir(path.dirname(this.unifiedDataPath));

      // Save unified data
      const finalData = {
        database_info: {
          unified_at: new Date().toISOString(),
          source_csv_records: csvRecords.length,
          source_campaigns: campaignData.campaigns.length,
          total_unified: unifiedData.length,
          version: 'HUB-V4-1.0'
        },
        metrics,
        contractors: unifiedData
      };

      await fs.writeJson(this.unifiedDataPath, finalData, { spaces: 2 });
      await fs.writeJson(this.campaignOverlayPath, campaignData, { spaces: 2 });
      await fs.writeJson(this.executionStatePath, executionState, { spaces: 2 });

      console.log('\n✅ Data unification completed successfully!');
      console.log(`Unified ${unifiedData.length} contractors`);
      console.log(`${metrics.with_campaigns} have campaigns ready`);
      console.log(`${metrics.completion_80_plus} have completion score 80+`);
      console.log(`UI Scale Mode: ${metrics.ui_scale_mode}`);

      return {
        success: true,
        data: finalData,
        metrics,
        executionState
      };

    } catch (error) {
      console.error('❌ Data unification failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load unified data for operations
   */
  async loadUnifiedData() {
    try {
      const data = await fs.readJson(this.unifiedDataPath);
      return data;
    } catch (error) {
      console.log('No unified data found, triggering unification...');
      const result = await this.unifyData();
      return result.success ? result.data : null;
    }
  }
}

module.exports = DataUnifier;