import Papa from 'papaparse';
import type { Contractor, Campaign, MergedContractor, CampaignsDatabase } from '@/lib/types';

class ContractorServiceClass {
  private csvData: Map<string, Contractor> = new Map();
  private campaignData: Map<string, Campaign> = new Map();
  private mergedData: Map<string, MergedContractor> = new Map();
  private indexes = {
    byState: new Map<string, Set<string>>(),
    byCompletionScore: new Map<number, Set<string>>(),
    byCampaignStatus: new Map<string, Set<string>>(),
    byCategory: new Map<string, Set<string>>(),
  };
  
  private isLoading = false;
  private loadedChunks = new Set<number>();
  private CHUNK_SIZE = 100;

  // Clear all caches - force reload
  clearCache(): void {
    this.csvData.clear();
    this.campaignData.clear();
    this.mergedData.clear();
    this.indexes.byState.clear();
    this.indexes.byCompletionScore.clear();
    this.indexes.byCampaignStatus.clear();
    this.indexes.byCategory.clear();
    this.loadedChunks.clear();
    this.isLoading = false;
  }

  // Normalize IDs for matching between CSV and JSON
  private normalizeId(id: string | number): string {
    const cleaned = String(id).replace(/^0+/, '').trim();
    // Remove trailing underscore and suffix (like "_C")
    return cleaned.replace(/_[A-Z]*$/, '');
  }

  // Load initial data chunk (first 100 records)
  async loadInitialData(): Promise<MergedContractor[]> {
    if (this.isLoading) return Array.from(this.mergedData.values());
    
    // Clear cache to ensure fresh data
    this.clearCache();
    console.log('🩺 EMERGENCY FIX: Cache cleared, loading fresh data...');
    this.isLoading = true;

    try {
      // Load CSV chunk
      const csvChunk = await this.loadCSVChunk(0, this.CHUNK_SIZE);
      
      // Load all campaign data (smaller JSON file)
      const campaignsResponse = await fetch('/api/campaigns');
      const campaignsData: CampaignsDatabase = await campaignsResponse.json();
      
      // Process campaigns
      Object.entries(campaignsData.contractors || {}).forEach(([key, campaign]: [string, any]) => {
        const businessId = this.normalizeId(
          campaign.campaign_data?.business_id || 
          campaign.business_id || 
          key
        );
        this.campaignData.set(businessId, campaign);
      });

      // Merge data
      this.mergeData();
      
      this.isLoading = false;
      return Array.from(this.mergedData.values()).slice(0, this.CHUNK_SIZE);
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.isLoading = false;
      return [];
    }
  }

  // Load CSV chunk from API
  private async loadCSVChunk(start: number, limit: number): Promise<void> {
    const chunkId = Math.floor(start / this.CHUNK_SIZE);
    if (this.loadedChunks.has(chunkId)) return;

    try {
      const response = await fetch(`/api/contractors?start=${start}&limit=${limit}`);
      const data = await response.json();
      
      data.contractors.forEach((contractor: any) => {
        const id = this.normalizeId(contractor['business_id'] || contractor.id);
        
        // Simple direct conversion - NO parsing, use raw field names
        const directContractor = {
          id,
          businessName: contractor['L1_company_name'] || 'Unknown Business',
          category: contractor['L1_category'] || 'General Contractor', 
          email: contractor['L1_primary_email'] || '',
          phone: contractor['L1_phone'] || '',
          website: contractor['L1_website'] || '',
          address: contractor['L1_address_full'] || '',
          city: contractor['L1_city'] || '',
          state: contractor['L1_state_code'] || '',
          zipCode: contractor['L1_postal_code'] || '',
          
          // DIRECT completion score - NO parsing
          completionScore: contractor['data_completion_score'] || 0,
          healthScore: 50,
          trustScore: 50,
          googleRating: contractor['L1_google_rating'] || 0,
          reviewsCount: contractor['L1_google_reviews_count'] || 0,
          
          intelligence: {
            websiteSpeed: { mobile: 50, desktop: 50 },
            reviewsRecency: 'UNKNOWN' as 'ACTIVE' | 'MODERATE' | 'INACTIVE' | 'UNKNOWN',
            daysSinceLatest: 0,
            platformDetection: 'Unknown',
            domainAge: 0,
            businessHours: 'Mon-Fri 8AM-5PM',
          },
          
          businessHealth: 'NEEDS_ATTENTION' as 'HEALTHY' | 'EMERGING' | 'NEEDS_ATTENTION',
          sophisticationTier: 'Amateur' as 'Professional' | 'Growing' | 'Amateur', 
          emailQuality: 'UNKNOWN' as 'PROFESSIONAL_DOMAIN' | 'PERSONAL_DOMAIN' | 'UNKNOWN',
          name: '',
          lastName: '',
        };
        
        // Debug
        if (id === '3993') {
          console.log('DIRECT 3993:', {
            rawScore: contractor['data_completion_score'],
            finalScore: directContractor.completionScore
          });
        }
        
        this.csvData.set(id, directContractor);
      });
      this.loadedChunks.add(chunkId);
    } catch (error) {
      console.error(`Error loading CSV chunk ${chunkId}:`, error);
    }
  }

  // Parse contractor data from CSV row
  private parseContractorFromCSV(row: any): Contractor {
    const id = this.normalizeId(row['business_id'] || row.id);
    
    // Better parsing for completion score
    const rawScore = row['data_completion_score'];
    let completionScore = 0;
    
    if (rawScore !== null && rawScore !== undefined && rawScore !== '') {
      const parsed = parseFloat(String(rawScore));
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        completionScore = Math.round(parsed);
      }
    }
    
    // Debug for problematic contractor 3993
    if (id === '3993' || row['business_id'] === '3993' || row['business_id'] === 3993) {
      console.log(`✅ CSV CONTRACTOR 3993 - PARSED:`, {
        originalBusinessId: row['business_id'],
        normalizedId: id,
        data_completion_score: row['data_completion_score'],
        finalScore: completionScore
      });
    }
    
    // Create contractor object
    const contractorData = {
      id,
      businessName: row['L1_company_name'] || 'Unknown Business',
      category: row['L1_category'] || 'General Contractor',
      email: row['L1_primary_email'] || 'contact@example.com',
      phone: row['L1_phone'] || '(555) 000-0000',
      website: row['L1_website'] || '',
      address: row['L1_address_full'] || 'Unknown Location',
      city: row['L1_city'] || '',
      state: row['L1_state_code'] || 'Unknown',
      zipCode: row['L1_postal_code'] || '',
      
      // Scores - using data_completion_score and other L2/L3 fields  
      completionScore: completionScore,
      healthScore: this.calculateHealthScore(row, completionScore),
      trustScore: Math.round(parseFloat(row['L2_trust_score']) * 100) || 0,
      googleRating: parseFloat(row['L1_google_rating']) || 0,
      reviewsCount: parseInt(row['L1_google_reviews_count']) || 0,
      
      // Intelligence data
      intelligence: {
        websiteSpeed: {
          mobile: parseInt(row['L1_psi_mobile_performance']) || 0,
          desktop: parseInt(row['L1_psi_desktop_performance']) || 0,
        },
        reviewsRecency: row['L2_reviews_recency_bucket'] || 'UNKNOWN',
        daysSinceLatest: parseInt(row['L1_days_since_latest_review']) || 0,
        platformDetection: row['L1_builder_platform'] || 'Unknown',
        domainAge: parseFloat(row['L1_whois_domain_age_years']) || 0,
        businessHours: row['L1_weekday_hours'] || 'Mon-Fri 8AM-5PM',
      },
      
      // Classifications - using L1 targeting fields
      businessHealth: row['L1_targeting_business_health'] || 'NEEDS_ATTENTION',
      sophisticationTier: row['L3_sophistication_intelligence_tier'] || 'Amateur',
      emailQuality: row['L2_email_quality'] || 'UNKNOWN',
      
      // Editable fields (will add later)
      name: '',
      lastName: '',
    };
    
    
    return contractorData;
  }

  // Merge CSV and Campaign data
  private mergeData(): void {
    // Start with CSV data
    this.csvData.forEach((contractor, id) => {
      const campaign = this.campaignData.get(id);
      
      const merged: MergedContractor = {
        ...contractor,
        hasCampaign: Boolean(campaign?.campaign_data?.email_sequences && campaign.campaign_data.email_sequences.length > 0),
        hasFocusGroup: Boolean(campaign?.focus_group_generated),
        campaignData: campaign ? this.formatCampaignData(campaign) : null,
        cost: campaign?.cost || 0,
        sessionDuration: campaign?.duration_minutes || 0,
        tokensUsed: campaign?.tokens || 0,
        emailSequences: campaign?.campaign_data?.email_sequences?.length || 0,
        notes: [],
      };
      
      // Debug for 3993
      if (id === '3993') {
        console.log(`✅ MERGED CONTRACTOR 3993:`, {
          completionScore: merged.completionScore,
          hasCampaign: merged.hasCampaign,
          businessName: merged.businessName
        });
      }
      
      this.mergedData.set(id, merged);
      this.updateIndexes(id, merged);
    });

    // Add campaigns without CSV match
    this.campaignData.forEach((campaign, id) => {
      if (!this.mergedData.has(id)) {
        const merged: MergedContractor = this.createContractorFromCampaign(campaign);
        this.mergedData.set(id, merged);
        this.updateIndexes(id, merged);
      } else {
        // Debug: Campaign trying to overwrite existing CSV data
        if (id === '3993') {
          console.log(`🛡️ PROTECTED 3993 - Campaign blocked from overwriting CSV:`, {
            existingScore: this.mergedData.get(id)?.completionScore,
            campaignWouldSet: 0
          });
        }
      }
    });
  }

  // Format campaign data for easier use
  private formatCampaignData(campaign: Campaign): any {
    return {
      businessId: campaign.campaign_data?.business_id || campaign.business_id,
      companyName: campaign.campaign_data?.company_name || campaign.company_name,
      contactTiming: campaign.campaign_data?.contact_timing,
      emailSequences: (campaign.campaign_data?.email_sequences || []).map((seq: any) => ({
        ...seq,
        status: seq.status || 'pending',
        sentDate: seq.sent_date || null,
        openedDate: seq.opened_date || null,
        respondedDate: seq.responded_date || null,
      })),
      messagingPreferences: campaign.campaign_data?.messaging_preferences,
    };
  }

  // Calculate health score from various metrics
  private calculateHealthScore(row: any, completionScore?: number): number {
    const completion = completionScore || parseInt(String(row['data_completion_score'])) || 0;
    const googleRating = parseFloat(row['L1_google_rating']) || 0;
    const reviewsCount = parseInt(row['L1_google_reviews_count']) || 0;
    const sophisticationScore = parseInt(row['L2_sophistication_score']) || 0;
    
    // Weighted calculation
    let healthScore = 0;
    healthScore += completion * 0.4;  // Data completeness 40%
    healthScore += (googleRating * 20) * 0.3;  // Google rating 30%
    healthScore += Math.min(reviewsCount * 2, 20) * 0.2;  // Reviews count 20%
    healthScore += sophisticationScore * 0.1;  // Sophistication 10%
    
    return Math.round(Math.min(healthScore, 100));
  }

  // Helper functions for data classification
  private categorizeReviewsRecency(days: string | number): 'ACTIVE' | 'MODERATE' | 'INACTIVE' | 'UNKNOWN' {
    if (!days || days === 'N/A') return 'UNKNOWN';
    const d = typeof days === 'string' ? parseInt(days) : days;
    if (d <= 30) return 'ACTIVE';
    if (d <= 90) return 'MODERATE';
    return 'INACTIVE';
  }

  private determineCategory(businessName: string): string {
    const name = (businessName || '').toLowerCase();
    if (name.includes('roof')) return 'Roofing';
    if (name.includes('electric')) return 'Electrical';
    if (name.includes('plumb')) return 'Plumbing';
    if (name.includes('hvac')) return 'HVAC';
    if (name.includes('paint')) return 'Painting';
    if (name.includes('floor')) return 'Flooring';
    return 'General Contractor';
  }

  private extractState(address: string): string {
    if (!address) return 'Unknown';
    const stateMatch = address.match(/\b([A-Z]{2})\b/);
    return stateMatch ? stateMatch[1] : 'Unknown';
  }

  private classifyBusinessHealth(score: number): 'HEALTHY' | 'EMERGING' | 'STRUGGLING' | 'NEEDS_ATTENTION' {
    if (score >= 90) return 'HEALTHY';
    if (score >= 70) return 'EMERGING';
    if (score >= 50) return 'STRUGGLING';
    return 'NEEDS_ATTENTION';
  }

  private classifySophistication(score: number): 'Professional' | 'Growing' | 'Amateur' | 'Established' {
    if (score >= 80) return 'Professional';
    if (score >= 60) return 'Growing';
    if (score >= 40) return 'Established';
    return 'Amateur';
  }

  private classifyEmailQuality(email: string): 'PROFESSIONAL_DOMAIN' | 'PERSONAL_DOMAIN' | 'UNKNOWN' {
    if (!email) return 'UNKNOWN';
    if (email.includes('gmail') || email.includes('yahoo') || email.includes('hotmail')) {
      return 'PERSONAL_DOMAIN';
    }
    return 'PROFESSIONAL_DOMAIN';
  }

  // Update search indexes
  private updateIndexes(id: string, contractor: MergedContractor): void {
    // Index by state
    const state = contractor.state || 'Unknown';
    if (!this.indexes.byState.has(state)) {
      this.indexes.byState.set(state, new Set());
    }
    this.indexes.byState.get(state)!.add(id);

    // Index by completion score range
    const scoreRange = Math.floor(contractor.completionScore / 10) * 10;
    if (!this.indexes.byCompletionScore.has(scoreRange)) {
      this.indexes.byCompletionScore.set(scoreRange, new Set());
    }
    this.indexes.byCompletionScore.get(scoreRange)!.add(id);

    // Index by campaign status
    const campaignStatus = contractor.hasCampaign ? 'active' : 'none';
    if (!this.indexes.byCampaignStatus.has(campaignStatus)) {
      this.indexes.byCampaignStatus.set(campaignStatus, new Set());
    }
    this.indexes.byCampaignStatus.get(campaignStatus)!.add(id);

    // Index by category
    if (!this.indexes.byCategory.has(contractor.category)) {
      this.indexes.byCategory.set(contractor.category, new Set());
    }
    this.indexes.byCategory.get(contractor.category)!.add(id);
  }

  // Create contractor from campaign data (when no CSV match)
  private createContractorFromCampaign(campaign: Campaign): MergedContractor {
    const businessId = this.normalizeId(
      campaign.campaign_data?.business_id || 
      campaign.business_id || 
      ''
    );
    return {
      id: businessId,
      businessName: campaign.campaign_data?.company_name || campaign.company_name || 'Unknown',
      category: campaign.trade || 'General Contractor',
      email: 'contact@example.com',
      phone: '(555) 000-0000',
      website: '',
      address: campaign.location || 'Unknown',
      city: '',
      state: this.extractState(campaign.location || ''),
      zipCode: '',
      completionScore: 0,
      healthScore: 0,
      trustScore: 0,
      googleRating: 0,
      reviewsCount: 0,
      intelligence: {
        websiteSpeed: { mobile: 0, desktop: 0 },
        reviewsRecency: 'UNKNOWN',
        daysSinceLatest: 0,
        platformDetection: 'Unknown',
        domainAge: 0,
        businessHours: 'Unknown',
      },
      businessHealth: 'NEEDS_ATTENTION',
      sophisticationTier: 'Amateur',
      emailQuality: 'UNKNOWN',
      hasCampaign: true,
      hasFocusGroup: Boolean(campaign.focus_group_generated),
      campaignData: this.formatCampaignData(campaign),
      cost: campaign.cost || 0,
      sessionDuration: campaign.duration_minutes || 0,
      tokensUsed: campaign.tokens || 0,
      emailSequences: campaign.campaign_data?.email_sequences?.length || 0,
      notes: [],
      
      // Editable fields (empty for campaign-only contractors)
      name: '',
      lastName: '',
    };
  }

  // Search contractors with filters using indexes
  async searchContractors(filters: string[]): Promise<MergedContractor[]> {
    if (!filters || filters.length === 0) {
      return Array.from(this.mergedData.values());
    }

    let resultIds: Set<string> | null = null;

    for (const filter of filters) {
      let filterIds = new Set<string>();

      switch (filter) {
        // Completion score filters
        case 'completion-85-100':
          for (const [range, ids] of this.indexes.byCompletionScore) {
            if (range >= 85) {
              ids.forEach((id: string) => filterIds.add(id));
            }
          }
          break;
        case 'completion-70-84':
          for (const [range, ids] of this.indexes.byCompletionScore) {
            if (range >= 70 && range < 85) {
              ids.forEach((id: string) => filterIds.add(id));
            }
          }
          break;
        
        // State filters
        case 'idaho':
          this.indexes.byState.get('ID')?.forEach(id => filterIds.add(id));
          break;
        case 'kansas':
          this.indexes.byState.get('KS')?.forEach(id => filterIds.add(id));
          break;
        case 'colorado':
          this.indexes.byState.get('CO')?.forEach(id => filterIds.add(id));
          break;
        case 'texas':
          this.indexes.byState.get('TX')?.forEach(id => filterIds.add(id));
          break;
        
        // Category filters
        case 'roofing':
          this.indexes.byCategory.get('Roofing')?.forEach(id => filterIds.add(id));
          break;
        case 'hvac':
          this.indexes.byCategory.get('HVAC')?.forEach(id => filterIds.add(id));
          break;
        case 'electrical':
          this.indexes.byCategory.get('Electrical')?.forEach(id => filterIds.add(id));
          break;
        
        // Campaign filters
        case 'campaign-ready':
          this.indexes.byCampaignStatus.get('active')?.forEach(id => filterIds.add(id));
          break;
        case 'no-campaign':
          this.indexes.byCampaignStatus.get('none')?.forEach(id => filterIds.add(id));
          break;
        
        // Complex filters (need manual check)
        default:
          for (const [id, contractor] of this.mergedData) {
            if (this.matchesComplexFilter(contractor, filter)) {
              filterIds.add(id);
            }
          }
          break;
      }

      // Intersect results
      if (resultIds === null) {
        resultIds = filterIds;
      } else {
        resultIds = new Set([...resultIds].filter((id: string) => filterIds.has(id)));
      }
    }

    return Array.from(resultIds || [])
      .map(id => this.mergedData.get(id))
      .filter((c): c is MergedContractor => c !== undefined);
  }

  // Match complex filters that require data inspection
  private matchesComplexFilter(contractor: MergedContractor, filter: string): boolean {
    switch(filter) {
      case 'high-psi':
        return contractor.intelligence.websiteSpeed.mobile >= 85;
      case 'medium-psi':
        return contractor.intelligence.websiteSpeed.mobile >= 60 && 
               contractor.intelligence.websiteSpeed.mobile < 85;
      case 'low-psi':
        return contractor.intelligence.websiteSpeed.mobile < 60;
      case 'inactive-reviews':
        return contractor.intelligence.reviewsRecency === 'INACTIVE';
      case 'high-rating':
        return contractor.googleRating >= 4.5;
      case 'low-rating':
        return contractor.googleRating < 4.0;
      case 'professional-email':
        return contractor.emailQuality === 'PROFESSIONAL_DOMAIN';
      case 'personal-email':
        return contractor.emailQuality === 'PERSONAL_DOMAIN';
      default:
        return false;
    }
  }

  // Load more data (lazy loading)
  async loadMore(page: number): Promise<MergedContractor[]> {
    const start = page * this.CHUNK_SIZE;
    await this.loadCSVChunk(start, this.CHUNK_SIZE);
    this.mergeData();
    
    return Array.from(this.mergedData.values())
      .slice(start, start + this.CHUNK_SIZE);
  }

  // Update campaign status
  async updateCampaignStatus(
    businessId: string, 
    emailNumber: number, 
    status: 'pending' | 'scheduled' | 'sent' | 'opened' | 'responded'
  ): Promise<void> {
    const normalizedId = this.normalizeId(businessId);
    const contractor = this.mergedData.get(normalizedId);
    
    if (contractor?.campaignData?.emailSequences) {
      const email = contractor.campaignData.emailSequences.find(
        (e: any) => e.email_number === emailNumber
      );
      
      if (email) {
        email.status = status;
        const today = new Date().toISOString().split('T')[0];
        
        switch(status) {
          case 'sent':
            email.sentDate = today;
            break;
          case 'opened':
            email.openedDate = today;
            break;
          case 'responded':
            email.respondedDate = today;
            break;
        }
        
        // Update backend
        await fetch('/api/campaigns/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: normalizedId,
            emailNumber,
            status,
            date: today
          })
        });
      }
    }
  }

  // Get all contractors (for export)
  getAllContractors(): MergedContractor[] {
    return Array.from(this.mergedData.values());
  }

  // Get contractor by ID
  getContractorById(id: string): MergedContractor | undefined {
    return this.mergedData.get(this.normalizeId(id));
  }

  // Get stats
  getStats() {
    const contractors = Array.from(this.mergedData.values());
    return {
      total: contractors.length,
      withCampaigns: contractors.filter(c => c.hasCampaign).length,
      avgCompletionScore: Math.round(
        contractors.reduce((sum, c) => sum + c.completionScore, 0) / contractors.length
      ),
      highCompletion: contractors.filter(c => c.completionScore >= 85).length,
    };
  }
}

// Singleton instance
export const contractorService = new ContractorServiceClass();