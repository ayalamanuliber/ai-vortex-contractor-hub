"""
SYNC SYSTEM - 3 LAYER BIDIRECTIONAL DATA MANAGEMENT
Handles intelligent merging between Master, Working, and Temporal layers
"""

import json
import pandas as pd
import os
import shutil
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class ThreeLayerSync:
    def __init__(self):
        """Initialize 3-layer sync system with proper paths"""
        
        # LAYER 1: MASTER FILES (Your manual edits)
        self.master_paths = {
            'csv': '/Users/manuayala/Documents/LAGOS/01_BUSINESS_ACTIVE/outreach_app/NORMALIZER/01_PROCESSED/CONTRACTORS - Master_Sheet.csv',
            'json_enhanced': '/Users/manuayala/Documents/LAGOS/01_BUSINESS_ACTIVE/outreach_app/NORMALIZER/01_PROCESSED/CONTRACTORS_5_LAYERS_ENHANCED.json',
            'json_campaigns': '/Users/manuayala/Documents/LAGOS/02_CAMPAIGN_GENERATOR/data/MASTER_CAMPAIGN_DATABASE.json'
        }
        
        # LAYER 2: WORKING FILES (System operational)
        self.working_paths = {
            'csv': '/Users/manuayala/Documents/LAGOS/03_CONTRACTOR_INTELLIGENCE_HUB/contractor-intelligence-hub-v4/public/data/contractors_original.csv',
            'json_campaigns': '/Users/manuayala/Documents/LAGOS/02_CAMPAIGN_GENERATOR/scripts/MASTER_CAMPAIGN_DATABASE.json',
            'json_app': '/Users/manuayala/Documents/LAGOS/03_CONTRACTOR_INTELLIGENCE_HUB/contractor-intelligence-hub-v4/public/data/campaigns.json'
        }
        
        # LAYER 3: TEMPORAL MERGE (Intelligence consolidated)
        self.temporal_paths = {
            'csv': '/Users/manuayala/Documents/LAGOS/02_CAMPAIGN_GENERATOR/scripts/temp/merged_contractors.csv',
            'json_campaigns': '/Users/manuayala/Documents/LAGOS/02_CAMPAIGN_GENERATOR/scripts/temp/merged_campaigns.json',
            'conflicts': '/Users/manuayala/Documents/LAGOS/02_CAMPAIGN_GENERATOR/scripts/temp/merge_conflicts.json'
        }
        
        # Backup directory
        self.backup_dir = '/Users/manuayala/Documents/LAGOS/02_CAMPAIGN_GENERATOR/scripts/backups'
        
        # Create temp and backup directories
        os.makedirs(os.path.dirname(self.temporal_paths['csv']), exist_ok=True)
        os.makedirs(self.backup_dir, exist_ok=True)
    
    def backup_all_files(self) -> str:
        """Create timestamped backup of all files before sync"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_session_dir = os.path.join(self.backup_dir, f"sync_{timestamp}")
        os.makedirs(backup_session_dir, exist_ok=True)
        
        # Backup all existing files
        all_paths = {**self.master_paths, **self.working_paths}
        
        for file_type, file_path in all_paths.items():
            if os.path.exists(file_path):
                backup_name = f"{file_type}_{os.path.basename(file_path)}"
                backup_path = os.path.join(backup_session_dir, backup_name)
                shutil.copy2(file_path, backup_path)
                logger.info(f"Backed up {file_type}: {backup_path}")
        
        return backup_session_dir
    
    def merge_json_campaigns(self) -> Dict:
        """
        Intelligent merge of campaign JSON files
        
        Logic:
        - Master JSON: Base campaigns (your approved campaigns)
        - Working JSON: Generated campaigns + app states  
        - Merge: All campaigns with latest states preserved
        """
        master_campaigns = {}
        working_campaigns = {}
        
        # Load master campaigns
        if os.path.exists(self.master_paths['json_campaigns']):
            with open(self.master_paths['json_campaigns'], 'r', encoding='utf-8') as f:
                master_data = json.load(f)
                master_campaigns = master_data.get('contractors', {})
        
        # Load working campaigns (from scripts/)
        if os.path.exists(self.working_paths['json_campaigns']):
            with open(self.working_paths['json_campaigns'], 'r', encoding='utf-8') as f:
                working_data = json.load(f)
                working_campaigns = working_data.get('contractors', {})
        
        # Merge logic
        merged_campaigns = {}
        conflicts = []
        
        # Start with all master campaigns
        for contractor_id, master_campaign in master_campaigns.items():
            merged_campaigns[contractor_id] = master_campaign.copy()
        
        # Add/update with working campaigns
        for contractor_id, working_campaign in working_campaigns.items():
            if contractor_id in merged_campaigns:
                # MERGE STRATEGY: Preserve campaign content, update states
                merged = merged_campaigns[contractor_id].copy()
                
                # Update processing status from working
                if 'processing_status' in working_campaign:
                    merged['processing_status'] = working_campaign['processing_status']
                
                # Update timestamps if newer
                if 'timestamp' in working_campaign:
                    merged['timestamp'] = working_campaign['timestamp']
                
                # Add any new campaign_data from working
                if 'campaign_data' in working_campaign:
                    if 'campaign_data' not in merged:
                        merged['campaign_data'] = working_campaign['campaign_data']
                    else:
                        # Merge campaign_data intelligently
                        merged_campaign_data = merged['campaign_data'].copy()
                        
                        # Add new email sequences if any
                        if 'email_sequences' in working_campaign['campaign_data']:
                            merged_campaign_data['email_sequences'] = working_campaign['campaign_data']['email_sequences']
                        
                        # Update contact timing if specified
                        if 'contact_timing' in working_campaign['campaign_data']:
                            merged_campaign_data['contact_timing'] = working_campaign['campaign_data']['contact_timing']
                        
                        merged['campaign_data'] = merged_campaign_data
                
                merged_campaigns[contractor_id] = merged
                
            else:
                # New campaign from working - add directly
                merged_campaigns[contractor_id] = working_campaign.copy()
        
        # Create final merged structure
        merged_data = {
            "database_info": {
                "generated_date": datetime.now().isoformat(),
                "total_contractors": len(merged_campaigns),
                "system_version": "FOCUS-INTEL V2.0 - 3LAYER SYNC",
                "last_updated": datetime.now().isoformat(),
                "merge_source": "intelligent_3layer_merge"
            },
            "contractors": merged_campaigns
        }
        
        # Save merged campaigns
        with open(self.temporal_paths['json_campaigns'], 'w', encoding='utf-8') as f:
            json.dump(merged_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Merged {len(merged_campaigns)} campaigns successfully")
        return merged_data
    
    def merge_csv_contractors(self) -> pd.DataFrame:
        """
        Intelligent merge of contractor CSV files
        
        Logic:
        - Master CSV: Your manual edits (completion_score, owner_names, etc.)
        - Working CSV: System tracking (focus_intel_status, dates, costs)
        - Merge: All data combined with intelligent conflict resolution
        """
        master_df = None
        working_df = None
        
        # Load master CSV
        if os.path.exists(self.master_paths['csv']):
            master_df = pd.read_csv(self.master_paths['csv'])
            logger.info(f"Loaded master CSV: {len(master_df)} rows")
        
        # Load working CSV (if exists)
        working_csv_path = self.working_paths['csv']
        if os.path.exists(working_csv_path):
            working_df = pd.read_csv(working_csv_path)
            logger.info(f"Loaded working CSV: {len(working_df)} rows")
        
        if master_df is None and working_df is None:
            logger.error("No CSV files found to merge")
            return pd.DataFrame()
        
        if master_df is None:
            return working_df
        if working_df is None:
            return master_df
        
        # Merge strategy
        # Key column: business_id (handle float/string conversion)
        
        # Normalize business_id in both dataframes
        master_df['business_id_norm'] = master_df['business_id'].apply(self._normalize_id)
        working_df['business_id_norm'] = working_df['business_id'].apply(self._normalize_id)
        
        # Merge on normalized ID
        merged_df = master_df.merge(
            working_df, 
            on='business_id_norm', 
            how='outer',
            suffixes=('_master', '_working')
        )
        
        # Intelligent column resolution
        final_columns = {}
        
        for col in merged_df.columns:
            if col.endswith('_master') or col.endswith('_working'):
                base_col = col.replace('_master', '').replace('_working', '')
                master_col = f"{base_col}_master"
                working_col = f"{base_col}_working"
                
                # Resolution strategy by column type
                if base_col in ['focus_intel_status', 'focus_intel_date', 'focus_intel_cost', 'focus_intel_insights']:
                    # Working wins for tracking fields
                    final_columns[base_col] = merged_df[working_col].fillna(merged_df[master_col])
                elif base_col in ['completion_score', 'owner_names', 'company_name', 'nombre']:
                    # Master wins for business data (including 'nombre' - user editable data)
                    final_columns[base_col] = merged_df[master_col].fillna(merged_df[working_col])
                else:
                    # General case: most recent non-null value
                    final_columns[base_col] = merged_df[working_col].fillna(merged_df[master_col])
        
        # Create final merged dataframe
        result_df = pd.DataFrame()
        
        # Add business_id (use master format preference)
        if 'business_id_master' in merged_df.columns:
            result_df['business_id'] = merged_df['business_id_master'].fillna(merged_df['business_id_working'])
        
        # Add all merged columns
        for col_name, col_data in final_columns.items():
            if col_name != 'business_id':  # Already added
                result_df[col_name] = col_data
        
        # Drop temporary normalization column
        if 'business_id_norm' in result_df.columns:
            result_df.drop('business_id_norm', axis=1, inplace=True)
        
        # Save merged CSV
        result_df.to_csv(self.temporal_paths['csv'], index=False)
        
        logger.info(f"Merged CSV saved: {len(result_df)} rows with {len(result_df.columns)} columns")
        return result_df
    
    def _normalize_id(self, id_value) -> str:
        """Normalize business_id to consistent string format"""
        if pd.isna(id_value):
            return ""
        
        try:
            # Convert float to int to string (removes .0)
            if isinstance(id_value, float):
                return str(int(id_value))
            return str(id_value).strip()
        except:
            return str(id_value).strip()
    
    def full_sync(self) -> Dict:
        """
        Perform complete 3-layer sync
        
        Returns status report
        """
        logger.info("=== STARTING 3-LAYER FULL SYNC ===")
        
        # 1. Create backup
        backup_dir = self.backup_all_files()
        
        # 2. Merge JSON campaigns
        merged_campaigns = self.merge_json_campaigns()
        
        # 3. Merge CSV contractors  
        merged_csv = self.merge_csv_contractors()
        
        # 4. Generate sync report
        sync_report = {
            "sync_timestamp": datetime.now().isoformat(),
            "backup_location": backup_dir,
            "campaigns_merged": len(merged_campaigns.get('contractors', {})),
            "csv_rows_merged": len(merged_csv),
            "temporal_files": {
                "campaigns": self.temporal_paths['json_campaigns'],
                "csv": self.temporal_paths['csv']
            },
            "status": "completed"
        }
        
        # Save sync report
        report_path = os.path.join(os.path.dirname(self.temporal_paths['csv']), 'sync_report.json')
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(sync_report, f, indent=2)
        
        logger.info("=== 3-LAYER SYNC COMPLETED ===")
        return sync_report
    
    def update_working_from_temporal(self):
        """Copy merged temporal files back to working locations"""
        
        # Update working campaign JSON
        if os.path.exists(self.temporal_paths['json_campaigns']):
            shutil.copy2(
                self.temporal_paths['json_campaigns'], 
                self.working_paths['json_campaigns']
            )
            logger.info("Updated working campaigns from temporal")
        
        # Update working CSV
        if os.path.exists(self.temporal_paths['csv']):
            shutil.copy2(
                self.temporal_paths['csv'],
                self.working_paths['csv']
            )
            logger.info("Updated working CSV from temporal")
    
    def promote_temporal_to_master(self, file_type: str):
        """
        Promote temporal merged file to master
        Use this when you want to adopt the merged version as your new master
        
        file_type: 'csv' or 'json_campaigns'
        """
        if file_type not in self.temporal_paths:
            logger.error(f"Invalid file type: {file_type}")
            return False
        
        temporal_file = self.temporal_paths[file_type]
        master_file = self.master_paths[file_type] if file_type != 'json_campaigns' else self.master_paths['json_campaigns']
        
        if not os.path.exists(temporal_file):
            logger.error(f"Temporal file not found: {temporal_file}")
            return False
        
        # Create backup of current master
        if os.path.exists(master_file):
            backup_name = f"{os.path.basename(master_file)}.pre_promote.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            backup_path = os.path.join(self.backup_dir, backup_name)
            shutil.copy2(master_file, backup_path)
            logger.info(f"Backed up current master: {backup_path}")
        
        # Promote temporal to master
        shutil.copy2(temporal_file, master_file)
        logger.info(f"Promoted temporal {file_type} to master")
        return True
    
    def update_nombre_field(self, contractor_id: str, nombre_value: str) -> bool:
        """Update the nombre field for a specific contractor in both master and working CSVs"""
        try:
            # Create backup first
            backup_timestamp = self.backup_all_files()
            logger.info(f"Created backup: {backup_timestamp}")
            
            # Update master CSV
            success_master = self._update_nombre_in_csv(self.master_paths['csv'], contractor_id, nombre_value)
            if not success_master:
                logger.error("Failed to update master CSV")
                return False
                
            # Update working CSV
            success_working = self._update_nombre_in_csv(self.working_paths['csv'], contractor_id, nombre_value)
            if not success_working:
                logger.error("Failed to update working CSV")
                return False
            
            logger.info(f"Successfully updated nombre field for contractor {contractor_id} to '{nombre_value}'")
            return True
            
        except Exception as e:
            logger.error(f"Error updating nombre field: {e}")
            return False
    
    def _update_nombre_in_csv(self, csv_path: str, contractor_id: str, nombre_value: str) -> bool:
        """Helper function to update nombre field in a specific CSV file"""
        try:
            if not os.path.exists(csv_path):
                logger.error(f"CSV file not found: {csv_path}")
                return False
                
            # Read CSV
            df = pd.read_csv(csv_path)
            logger.info(f"Loaded CSV with {len(df)} rows from {csv_path}")
            
            # Find contractor by ID (handle both string and numeric IDs)
            contractor_mask = (df['business_id'].astype(str) == str(contractor_id)) | (df['business_id'] == int(contractor_id) if contractor_id.isdigit() else False)
            
            if not contractor_mask.any():
                logger.error(f"Contractor ID {contractor_id} not found in {csv_path}")
                return False
            
            # Update nombre field
            if 'nombre' not in df.columns:
                logger.error(f"nombre column not found in {csv_path}")
                return False
                
            df.loc[contractor_mask, 'nombre'] = nombre_value
            logger.info(f"Updated nombre field for contractor {contractor_id}")
            
            # Save CSV
            df.to_csv(csv_path, index=False)
            logger.info(f"Saved updated CSV to {csv_path}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating CSV {csv_path}: {e}")
            return False
    
    def sync_master_to_working(self) -> bool:
        """Sync changes from Master CSV to Working CSV (for manual CSV edits)"""
        try:
            # Create backup first
            backup_timestamp = self.backup_all_files()
            logger.info(f"Created backup: {backup_timestamp}")
            
            # Read Master CSV (source of truth)
            if not os.path.exists(self.master_paths['csv']):
                logger.error(f"Master CSV not found: {self.master_paths['csv']}")
                return False
                
            master_df = pd.read_csv(self.master_paths['csv'])
            logger.info(f"Loaded Master CSV with {len(master_df)} rows")
            
            # Copy Master to Working location
            master_df.to_csv(self.working_paths['csv'], index=False)
            logger.info(f"Synced Master to Working CSV: {self.working_paths['csv']}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error syncing Master to Working: {e}")
            return False
    
    def sync_campaigns(self) -> bool:
        """Sync campaign JSON files with smart merge strategy"""
        try:
            # Create backup first
            backup_timestamp = self.backup_all_files()
            logger.info(f"Created backup: {backup_timestamp}")
            
            # Read Master campaigns JSON
            if not os.path.exists(self.master_paths['json_campaigns']):
                logger.warning(f"Master campaigns JSON not found: {self.master_paths['json_campaigns']}")
                return True  # Not an error if file doesn't exist yet
            
            with open(self.master_paths['json_campaigns'], 'r') as f:
                master_campaigns = json.load(f)
            logger.info(f"Loaded Master campaigns JSON")
            
            # Smart merge with existing working campaigns (preserve email sequences, sent dates, etc.)
            if os.path.exists(self.working_paths['json_campaigns']):
                with open(self.working_paths['json_campaigns'], 'r') as f:
                    working_campaigns = json.load(f)
                
                # Merge strategy: Master wins for campaign_data, Working wins for execution status
                merged = self._merge_campaign_data(master_campaigns, working_campaigns)
            else:
                merged = master_campaigns
            
            # Write to working locations
            with open(self.working_paths['json_campaigns'], 'w') as f:
                json.dump(merged, f, indent=2)
            
            with open(self.working_paths['json_app'], 'w') as f:
                json.dump(merged, f, indent=2)
            
            logger.info(f"Synced campaigns to working locations")
            return True
            
        except Exception as e:
            logger.error(f"Error syncing campaigns: {e}")
            return False
    
    def _merge_campaign_data(self, master: dict, working: dict) -> dict:
        """Smart merge strategy for campaign data"""
        merged = master.copy()
        
        # Preserve execution status from working copy
        if 'contractors' in working:
            for contractor_id, working_data in working['contractors'].items():
                if contractor_id in merged.get('contractors', {}):
                    # Preserve sent dates, email status, etc.
                    master_data = merged['contractors'][contractor_id]
                    if 'campaign_data' in working_data and 'email_sequences' in working_data['campaign_data']:
                        # Preserve email sequence status from working copy
                        if 'campaign_data' not in master_data:
                            master_data['campaign_data'] = {}
                        if 'email_sequences' not in master_data['campaign_data']:
                            master_data['campaign_data']['email_sequences'] = working_data['campaign_data']['email_sequences']
                        else:
                            # Merge email sequences: master content + working status
                            master_sequences = master_data['campaign_data']['email_sequences']
                            working_sequences = working_data['campaign_data']['email_sequences']
                            
                            for i, master_seq in enumerate(master_sequences):
                                if i < len(working_sequences):
                                    working_seq = working_sequences[i]
                                    # Preserve status fields from working
                                    for field in ['status', 'sent_date', 'opened_date', 'responded_date']:
                                        if field in working_seq:
                                            master_seq[field] = working_seq[field]
        
        return merged
    
    def show_status(self) -> None:
        """Show current system status"""
        print("=" * 60)
        print("🗂️  FILE STATUS:")
        print("=" * 60)
        
        for layer_name, paths in [
            ("MASTER FILES", self.master_paths),
            ("WORKING FILES", self.working_paths), 
            ("TEMPORAL FILES", self.temporal_paths)
        ]:
            print(f"\n📁 {layer_name}:")
            for file_type, path in paths.items():
                exists = "✅" if os.path.exists(path) else "❌"
                size = ""
                if os.path.exists(path):
                    size_bytes = os.path.getsize(path)
                    if size_bytes > 1024*1024:
                        size = f"({size_bytes/(1024*1024):.1f} MB)"
                    elif size_bytes > 1024:
                        size = f"({size_bytes/1024:.1f} KB)"
                    else:
                        size = f"({size_bytes} bytes)"
                
                print(f"  {exists} {file_type}: {size}")
                if len(path) > 80:
                    print(f"      ...{path[-70:]}")
                else:
                    print(f"      {path}")
        
        # Show recent backups
        print(f"\n📦 RECENT BACKUPS:")
        backup_dirs = []
        if os.path.exists(self.backup_dir):
            backup_dirs = sorted([d for d in os.listdir(self.backup_dir) if d.startswith('sync_')], reverse=True)[:5]
        
        if backup_dirs:
            for backup in backup_dirs:
                backup_path = os.path.join(self.backup_dir, backup)
                backup_time = backup.replace('sync_', '').replace('_', ' ')
                print(f"  📦 {backup_time}")
        else:
            print("  📦 No backups found")
        
        # Show contractors with nombres
        print(f"\n👥 CONTRACTORS WITH NOMBRES:")
        try:
            if os.path.exists(self.working_paths['csv']):
                df = pd.read_csv(self.working_paths['csv'])
                contractors_with_nombres = df[df['nombre'].notna() & (df['nombre'] != '')]
                print(f"  📊 Total: {len(contractors_with_nombres)} contractors")
                
                if len(contractors_with_nombres) > 0:
                    for idx, row in contractors_with_nombres.head(10).iterrows():
                        print(f"  👤 ID:{row['business_id']:>4} | {row['L1_company_name']:<30} | \"{row['nombre']}\"")
                    
                    if len(contractors_with_nombres) > 10:
                        print(f"  ... and {len(contractors_with_nombres) - 10} more")
            else:
                print("  ❌ Working CSV not found")
        except Exception as e:
            print(f"  ❌ Error reading contractors: {e}")
        
        print("=" * 60)


if __name__ == "__main__":
    import sys
    
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    sync = ThreeLayerSync()
    
    # Check for command-line arguments
    if len(sys.argv) >= 4 and sys.argv[1] == "--update-nombre":
        # Handle update-nombre command
        contractor_id = sys.argv[2]
        nombre_value = sys.argv[3]
        
        print(f"🔄 Updating nombre field for contractor {contractor_id} to '{nombre_value}'")
        success = sync.update_nombre_field(contractor_id, nombre_value)
        
        if success:
            print("✅ Successfully updated nombre field in both master and working CSVs")
            sys.exit(0)
        else:
            print("❌ Failed to update nombre field")
            sys.exit(1)
    
    elif len(sys.argv) >= 2 and sys.argv[1] == "--sync-master-to-working":
        # Handle master → working sync
        print("🔄 Syncing changes from Master CSV to Working CSV...")
        success = sync.sync_master_to_working()
        
        if success:
            print("✅ Successfully synced Master to Working CSV")
            sys.exit(0)
        else:
            print("❌ Failed to sync Master to Working")
            sys.exit(1)
    
    elif len(sys.argv) >= 2 and sys.argv[1] == "--sync-campaigns":
        # Handle campaigns JSON sync
        print("🔄 Syncing campaigns JSON files...")
        success = sync.sync_campaigns()
        
        if success:
            print("✅ Successfully synced campaign JSON files")
            sys.exit(0)
        else:
            print("❌ Failed to sync campaign JSON files")
            sys.exit(1)
    
    elif len(sys.argv) >= 2 and sys.argv[1] == "--full-sync":
        # Handle full system sync
        print("🔄 Performing full system sync (CSV + JSON)...")
        report = sync.full_sync()
        
        print("📊 Full Sync Report:")
        print(json.dumps(report, indent=2))
        
        if report.get('success', False):
            print("✅ Full sync completed successfully")
            sys.exit(0)
        else:
            print("❌ Full sync failed")
            sys.exit(1)
    
    elif len(sys.argv) >= 2 and sys.argv[1] == "--status":
        # Show system status
        print("📊 System Status:")
        sync.show_status()
        sys.exit(0)
    else:
        # Default behavior: test the sync system
        print("🚀 Testing 3-Layer Sync System")
        print("=" * 50)
        
        # Perform full sync
        report = sync.full_sync()
        
        print("📊 Sync Report:")
        print(json.dumps(report, indent=2))
        
        print("✅ Files available in temporal layer:")
        for file_type, path in sync.temporal_paths.items():
            exists = "✅" if os.path.exists(path) else "❌"
            print(f"  {file_type}: {exists} {path}")