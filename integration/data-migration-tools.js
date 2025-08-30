/**
 * DATA MIGRATION TOOLS - One-time setup utilities
 * Handles initial data migration and system setup
 */

const DataUnifier = require('../backend/utils/data-unifier');
const fs = require('fs-extra');
const path = require('path');

class DataMigrationTools {
    constructor() {
        this.dataUnifier = new DataUnifier();
    }

    /**
     * Complete system setup
     */
    async setupSystem() {
        try {
            console.log('\nStarting Contractor Intelligence Hub V4 Setup...');
            console.log('╔═══════════════════════════════════════════════════════╗');
            console.log('║              SYSTEM INITIALIZATION                    ║');
            console.log('╚═══════════════════════════════════════════════════════╝\n');

            // Step 1: Verify data sources exist
            console.log('Step 1: Verifying data sources...');
            const sourcesValid = await this.verifyDataSources();
            
            if (!sourcesValid) {
                console.log('❌ Setup failed: Data sources not available');
                return false;
            }

            // Step 2: Create directory structure
            console.log('Step 2: Creating directory structure...');
            await this.createDirectoryStructure();

            // Step 3: Run initial data unification
            console.log('Step 3: Running initial data unification...');
            const unificationResult = await this.dataUnifier.unifyData();
            
            if (!unificationResult.success) {
                console.log('❌ Data unification failed:', unificationResult.error);
                return false;
            }

            // Step 4: Generate initial metrics report
            console.log('Step 4: Generating metrics report...');
            await this.generateSetupReport(unificationResult);

            console.log('\n✅ Setup completed successfully!');
            console.log('╔═══════════════════════════════════════════════════════╗');
            console.log('║              SETUP COMPLETE                           ║');
            console.log('║                                                       ║');
            console.log(`║  Total Contractors: ${unificationResult.metrics.total_contractors.toString().padEnd(10)} Ready: ${unificationResult.metrics.with_campaigns.toString().padEnd(10)}   ║`);
            console.log(`║  Completion 80+: ${unificationResult.metrics.completion_80_plus.toString().padEnd(13)} UI Mode: ${unificationResult.metrics.ui_scale_mode.padEnd(8)} ║`);
            console.log('║                                                       ║');
            console.log('║  Ready to start: npm start                        ║');
            console.log('╚═══════════════════════════════════════════════════════╝\n');

            return true;

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            return false;
        }
    }

    /**
     * Verify that data sources are available
     */
    async verifyDataSources() {
        const csvPath = '/Users/manuayala/Documents/LAGOS/01_BUSINESS_ACTIVE/outreach_app/NORMALIZER/01_PROCESSED/CONTRACTORS - Master_Sheet.csv';
        const jsonPath = '/Users/manuayala/Documents/LAGOS/FOCUS_INTEL_SYSTEM/MASTER_CAMPAIGN_DATABASE.json';

        const csvExists = await fs.pathExists(csvPath);
        const jsonExists = await fs.pathExists(jsonPath);

        console.log(`   Master Sheet CSV: ${csvExists ? 'Found' : 'Not found'}`);
        console.log(`   Campaign Database: ${jsonExists ? 'Found' : 'Not found'}`);

        if (csvExists && jsonExists) {
            // Check file sizes
            const csvStats = await fs.stat(csvPath);
            const jsonStats = await fs.stat(jsonPath);
            
            console.log(`   CSV Size: ${(csvStats.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   JSON Size: ${(jsonStats.size / 1024 / 1024).toFixed(2)} MB`);
        }

        return csvExists && jsonExists;
    }

    /**
     * Create necessary directory structure
     */
    async createDirectoryStructure() {
        const directories = [
            'data',
            'data/sync',
            'data/sync/backups',
            'logs'
        ];

        for (const dir of directories) {
            const fullPath = path.join(__dirname, '..', dir);
            await fs.ensureDir(fullPath);
            console.log(`   Created: ${dir}`);
        }
    }

    /**
     * Generate setup report
     */
    async generateSetupReport(unificationResult) {
        const report = {
            setup_timestamp: new Date().toISOString(),
            system_version: 'HUB-V4-1.0',
            data_sources: {
                csv_records: unificationResult.data.database_info.source_csv_records,
                campaign_records: unificationResult.data.database_info.source_campaigns,
                unified_total: unificationResult.data.database_info.total_unified
            },
            metrics: unificationResult.metrics,
            performance: {
                ui_scale_mode: unificationResult.metrics.ui_scale_mode,
                data_density: unificationResult.metrics.data_density,
                recommended_page_size: this.getRecommendedPageSize(unificationResult.metrics.total_contractors)
            },
            next_steps: [
                'Start server with: npm start',
                'Access dashboard at: http://localhost:3000',
                'Review completion analytics',
                'Begin data enhancement process'
            ]
        };

        const reportPath = path.join(__dirname, '..', 'data', 'setup-report.json');
        await fs.writeJson(reportPath, report, { spaces: 2 });
        
        console.log(`   Setup report saved to: ${reportPath}`);
        return report;
    }

    /**
     * Get recommended page size based on data volume
     */
    getRecommendedPageSize(totalContractors) {
        if (totalContractors > 2000) return 100;
        if (totalContractors > 500) return 50;
        return 25;
    }

    /**
     * Validate data integrity
     */
    async validateDataIntegrity() {
        try {
            console.log('\nRunning data integrity validation...');
            
            const unifiedData = await fs.readJson(path.join(__dirname, '..', 'data', 'master-contractors.json'));
            const contractors = unifiedData.contractors;
            
            const validation = {
                total_records: contractors.length,
                valid_business_ids: 0,
                valid_emails: 0,
                valid_completion_scores: 0,
                has_campaigns: 0,
                missing_critical_data: 0,
                issues: []
            };

            contractors.forEach((contractor, index) => {
                // Validate business ID
                if (contractor.business_id) {
                    validation.valid_business_ids++;
                } else {
                    validation.issues.push(`Record ${index}: Missing business_id`);
                }

                // Validate email
                if (contractor.primary_email && contractor.primary_email.includes('@')) {
                    validation.valid_emails++;
                }

                // Validate completion score
                if (contractor.data_completion_score >= 0 && contractor.data_completion_score <= 100) {
                    validation.valid_completion_scores++;
                }

                // Count campaigns
                if (contractor.has_campaign) {
                    validation.has_campaigns++;
                }

                // Check critical data
                if (!contractor.company_name || contractor.company_name === 'Unknown Company') {
                    validation.missing_critical_data++;
                }
            });

            const validationPath = path.join(__dirname, '..', 'data', 'validation-report.json');
            await fs.writeJson(validationPath, validation, { spaces: 2 });

            console.log('   ✅ Validation completed');
            console.log(`   Valid records: ${validation.valid_business_ids}/${validation.total_records}`);
            console.log(`   Valid emails: ${validation.valid_emails}/${validation.total_records}`);
            console.log(`   Has campaigns: ${validation.has_campaigns}/${validation.total_records}`);
            
            if (validation.issues.length > 0) {
                console.log(`   ⚠️  Issues found: ${validation.issues.length}`);
            }

            return validation;

        } catch (error) {
            console.error('❌ Validation failed:', error.message);
            return null;
        }
    }

    /**
     * Create sample export for testing
     */
    async createSampleExport() {
        try {
            console.log('Creating sample export...');
            
            const ExportEngine = require('../backend/utils/export-engine');
            const exportEngine = new ExportEngine();
            
            const unifiedData = await fs.readJson(path.join(__dirname, '..', 'data', 'master-contractors.json'));
            
            // Create sample of 100 contractors
            const sampleContractors = unifiedData.contractors.slice(0, 100);
            
            const exportResult = await exportEngine.generateCSVExport(sampleContractors, {
                sample: true,
                record_count: sampleContractors.length
            });

            if (exportResult.success) {
                console.log(`   ✅ Sample export created: ${exportResult.records_exported} records`);
                console.log(`   File: ${exportResult.file_path}`);
            } else {
                console.log(`   ❌ Sample export failed: ${exportResult.error}`);
            }

            return exportResult;

        } catch (error) {
            console.error('❌ Sample export error:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    const migrationTools = new DataMigrationTools();
    
    migrationTools.setupSystem().then(success => {
        if (success) {
            console.log('System is ready to use!');
            process.exit(0);
        } else {
            console.log('Setup failed. Please check the logs and try again.');
            process.exit(1);
        }
    }).catch(error => {
        console.error('Unexpected error during setup:', error);
        process.exit(1);
    });
}

module.exports = DataMigrationTools;