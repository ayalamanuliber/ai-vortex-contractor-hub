/**
 * EXPORT ENGINE - CSV generation and bidirectional sync
 * Handles export of enhanced data back to CSV format
 * Supports both full exports and incremental updates
 */

const fs = require('fs-extra');
const path = require('path');
const { stringify } = require('csv-stringify/sync');

class ExportEngine {
  constructor() {
    this.exportPath = path.join(__dirname, '../../data/sync/export-ready.csv');
    this.syncTimestampPath = path.join(__dirname, '../../data/sync/last-sync-timestamp.json');
    this.backupPath = path.join(__dirname, '../../data/sync/backups');
  }

  /**
   * Map unified contractor data back to CSV format
   */
  mapToCSVFormat(contractor) {
    return {
      // Core identifiers
      business_id: contractor.business_id || '',
      schema_version: '4.0.0',
      processing_timestamp: new Date().toISOString(),
      data_completion_score: contractor.data_completion_score || 0,
      
      // Basic business data (L1)
      L1_company_name: contractor.company_name || '',
      L1_category: contractor.category || '',
      L1_primary_email: contractor.primary_email || '',
      L1_phone: contractor.phone || '',
      L1_website: contractor.website || '',
      L1_address_full: contractor.address_full || '',
      L1_city: contractor.city || '',
      L1_state_code: contractor.state_code || '',
      L1_postal_code: contractor.postal_code || '',
      
      // Google/Reviews data
      L1_google_rating: contractor.google_rating || 0,
      L1_google_reviews_count: contractor.google_reviews_count || 0,
      L1_targeting_business_health: contractor.business_health || 'UNKNOWN',
      L1_targeting_outreach_priority: contractor.outreach_priority || 'MEDIUM',
      
      // Intelligence layers (L2-L5)
      L2_sophistication_score: contractor.sophistication_score || 0,
      L2_email_quality: contractor.email_quality || 'UNKNOWN',
      L2_trust_score: contractor.trust_score || 0,
      
      L3_sophistication_intelligence_tier: contractor.sophistication_tier || 'Growing',
      
      L5_targeting_pricing_psychology: contractor.pricing_psychology || 'value',
      L5_outreach_primary_angle: contractor.primary_angle || 'general',
      L5_outreach_conversion_probability: contractor.conversion_probability || 'medium',
      
      // Campaign data overlay
      has_focus_intel_campaign: contractor.has_campaign ? 'TRUE' : 'FALSE',
      campaign_status: contractor.campaign_status || 'NO_CAMPAIGN',
      emails_sent: contractor.emails_sent || 0,
      last_contact_date: contractor.last_contact_date || '',
      next_followup_date: contractor.next_followup_date || '',
      
      // Enhancement tracking
      completion_tier: contractor.completion_tier || 'POOR',
      score_change_last_update: this.getLastScoreChange(contractor),
      fields_enhanced_count: this.getEnhancedFieldsCount(contractor),
      
      // Timestamps
      hub_created_at: contractor.created_at || '',
      hub_updated_at: contractor.updated_at || '',
      
      // Raw data preservation (if needed)
      raw_json_backup: contractor.preserve_raw ? JSON.stringify(contractor.raw_csv_data || {}) : ''
    };
  }

  /**
   * Get last score change from history
   */
  getLastScoreChange(contractor) {
    if (!contractor.score_history || contractor.score_history.length === 0) return 0;
    const latest = contractor.score_history[contractor.score_history.length - 1];
    return latest.change || 0;
  }

  /**
   * Count enhanced fields
   */
  getEnhancedFieldsCount(contractor) {
    if (!contractor.score_history || contractor.score_history.length === 0) return 0;
    const allUpdates = contractor.score_history.flatMap(h => h.fields_updated || []);
    return [...new Set(allUpdates)].length;
  }

  /**
   * Generate enhanced CSV export
   */
  async generateCSVExport(contractors, options = {}) {
    try {
      console.log(`Generating CSV export for ${contractors.length} contractors...`);

      // Filter contractors based on options
      let exportContractors = contractors;
      
      if (options.only_enhanced) {
        exportContractors = contractors.filter(c => 
          c.updated_at !== c.created_at || 
          (c.score_history && c.score_history.length > 0)
        );
        console.log(`Filtered to ${exportContractors.length} enhanced contractors`);
      }

      if (options.min_completion_score) {
        exportContractors = exportContractors.filter(c => 
          c.data_completion_score >= options.min_completion_score
        );
        console.log(`Filtered to ${exportContractors.length} with score >= ${options.min_completion_score}`);
      }

      // Map to CSV format
      const csvData = exportContractors.map(contractor => this.mapToCSVFormat(contractor));

      // Generate CSV string
      const csvString = stringify(csvData, {
        header: true,
        delimiter: ',',
        quoted: true,
        quoted_empty: true
      });

      // Ensure export directory exists
      await fs.ensureDir(path.dirname(this.exportPath));

      // Create backup if file exists
      if (await fs.pathExists(this.exportPath)) {
        await this.createBackup();
      }

      // Write new export
      await fs.writeFile(this.exportPath, csvString, 'utf-8');

      // Update sync timestamp
      const syncInfo = {
        exported_at: new Date().toISOString(),
        total_contractors: exportContractors.length,
        export_type: options.only_enhanced ? 'ENHANCED_ONLY' : 'FULL_EXPORT',
        filters_applied: {
          only_enhanced: !!options.only_enhanced,
          min_completion_score: options.min_completion_score || null
        },
        file_path: this.exportPath,
        file_size_bytes: csvString.length
      };

      await fs.writeJson(this.syncTimestampPath, syncInfo, { spaces: 2 });

      console.log(`✅ CSV export completed successfully`);
      console.log(`File: ${this.exportPath}`);
      console.log(`Records: ${exportContractors.length}`);
      console.log(`Size: ${Math.round(csvString.length / 1024)} KB`);

      return {
        success: true,
        file_path: this.exportPath,
        records_exported: exportContractors.length,
        file_size: csvString.length,
        sync_info: syncInfo
      };

    } catch (error) {
      console.error('❌ CSV export failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create backup of existing export
   */
  async createBackup() {
    try {
      await fs.ensureDir(this.backupPath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupPath, `export-backup-${timestamp}.csv`);
      await fs.copy(this.exportPath, backupFile);
      console.log(`Created backup: ${backupFile}`);
    } catch (error) {
      console.warn('⚠️ Failed to create backup:', error.message);
    }
  }

  /**
   * Generate differential export (only changed records)
   */
  async generateDifferentialExport(contractors, lastSyncDate) {
    const changedContractors = contractors.filter(contractor => {
      const updatedAt = new Date(contractor.updated_at || contractor.created_at);
      const syncDate = new Date(lastSyncDate);
      return updatedAt > syncDate;
    });

    console.log(`Found ${changedContractors.length} contractors changed since ${lastSyncDate}`);

    return this.generateCSVExport(changedContractors, { 
      differential: true 
    });
  }

  /**
   * Generate campaign-ready export (only contractors with campaigns)
   */
  async generateCampaignReadyExport(contractors) {
    const campaignReady = contractors.filter(c => 
      c.has_campaign && 
      c.campaign_status === 'READY' && 
      c.data_completion_score >= 80
    );

    console.log(`Found ${campaignReady.length} campaign-ready contractors`);

    return this.generateCSVExport(campaignReady, { 
      campaign_ready: true,
      only_enhanced: false 
    });
  }

  /**
   * Generate enhancement opportunity export
   */
  async generateEnhancementOpportunityExport(contractors) {
    const needsEnhancement = contractors.filter(c => 
      c.data_completion_score < 80 && 
      c.data_completion_score > 50 && // Exclude very poor quality
      !c.has_campaign // Focus on those without campaigns
    );

    console.log(`Found ${needsEnhancement.length} enhancement opportunities`);

    // Sort by completion score descending (best candidates first)
    needsEnhancement.sort((a, b) => b.data_completion_score - a.data_completion_score);

    return this.generateCSVExport(needsEnhancement, { 
      enhancement_opportunity: true 
    });
  }

  /**
   * Get sync status and statistics
   */
  async getSyncStatus() {
    try {
      const syncInfo = await fs.readJson(this.syncTimestampPath);
      const exportExists = await fs.pathExists(this.exportPath);
      
      return {
        last_sync: syncInfo,
        export_file_exists: exportExists,
        export_file_path: this.exportPath
      };
    } catch (error) {
      return {
        last_sync: null,
        export_file_exists: false,
        export_file_path: this.exportPath
      };
    }
  }

  /**
   * Generate export statistics
   */
  generateExportStats(contractors) {
    const stats = {
      total: contractors.length,
      with_campaigns: contractors.filter(c => c.has_campaign).length,
      campaign_ready: contractors.filter(c => c.has_campaign && c.campaign_status === 'READY').length,
      enhanced_records: contractors.filter(c => c.updated_at !== c.created_at).length,
      completion_tiers: {
        premium: contractors.filter(c => c.data_completion_score >= 90).length,
        ready: contractors.filter(c => c.data_completion_score >= 80 && c.data_completion_score < 90).length,
        good: contractors.filter(c => c.data_completion_score >= 70 && c.data_completion_score < 80).length,
        needs_work: contractors.filter(c => c.data_completion_score >= 50 && c.data_completion_score < 70).length,
        poor: contractors.filter(c => c.data_completion_score < 50).length
      }
    };

    stats.enhancement_opportunities = stats.completion_tiers.good + stats.completion_tiers.needs_work;
    
    return stats;
  }
}

module.exports = ExportEngine;