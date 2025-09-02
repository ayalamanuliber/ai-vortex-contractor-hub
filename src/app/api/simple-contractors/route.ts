import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import fs from 'fs/promises';
import path from 'path';

// Function to categorize contractors based on exact mapping
function getMegaCategory(category: string): string {
  if (!category) return 'Other';
  
  const cat = category.toLowerCase();
  
  // Exact mapping as specified
  if (cat.includes('roofing') || cat.includes('roof')) return 'Roofing';
  if (cat.includes('hvac') || cat.includes('heating') || cat.includes('cooling') || cat.includes('air conditioning')) return 'HVAC';
  if (cat.includes('plumber') || cat.includes('plumbing')) return 'Plumbing';
  if (cat.includes('electrician') || cat.includes('electric')) return 'Electrical';
  if (cat.includes('remodeling') || cat.includes('drywall') || cat.includes('carpet') || cat.includes('floor') || cat.includes('tile') || cat.includes('counter')) return 'Remodeling & Finishing';
  if (cat.includes('landscap') || cat.includes('lawn') || cat.includes('siding')) return 'Exterior & Landscaping';
  if (cat.includes('concrete')) return 'Heavy & Civil Work';
  if (cat.includes('home builder') || cat.includes('custom home')) return 'Home Building';
  if (cat.includes('handyman')) return 'Specialty Trades & Handyman';
  if (cat.includes('supplier')) return 'Suppliers & Materials';
  if (cat.includes('interior designer') || cat.includes('waterproofing')) return 'Ancillary Services';
  if (cat.includes('general contractor') || cat.includes('construction company')) return 'General Construction';
  if (cat.includes('window') || cat.includes('door') || cat.includes('glass')) return 'Window & Door';
  if (cat.includes('association') || cat.includes('organization')) return 'Other';
  
  return 'Other';
}

export async function GET(request: NextRequest) {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'data', 'contractors_original.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    // Load campaigns JSON data
    let campaignsData = null;
    try {
      const campaignsPath = path.join(process.cwd(), 'public', 'data', 'campaigns.json');
      const campaignsContent = await fs.readFile(campaignsPath, 'utf-8');
      campaignsData = JSON.parse(campaignsContent);
    } catch (error) {
      console.log('No campaigns data found, using default');
      campaignsData = { contractors: {} };
    }
    
    // Process each contractor directly with proper completion score
    const contractors = parsed.data.map((row: any) => {
      const id = String(row['business_id']).replace(/^0+/, '').trim();
      const originalId = String(row['business_id']).trim(); // Keep original with leading zeros
      
      // Check campaign data using multiple ID formats
      // Try: original, trimmed, padded with zero
      const paddedId = id.padStart(5, '0'); // Convert "1062" to "01062"
      const campaignData = campaignsData.contractors[originalId] || 
                          campaignsData.contractors[id] || 
                          campaignsData.contractors[paddedId];
      const hasCampaign = !!campaignData && campaignData.processing_status === 'completed';
      
      // Debug for contractor 1062
      if (id === '1062') {
        console.log('DEBUG 1062 Matching:', {
          id, 
          originalId,
          paddedId,
          foundWithOriginal: !!campaignsData.contractors[originalId],
          foundWithId: !!campaignsData.contractors[id],
          foundWithPadded: !!campaignsData.contractors[paddedId],
          campaignData: !!campaignData,
          hasCampaign
        });
      }
      
      // Direct completion score parsing
      let completionScore = 0;
      const rawScore = row['data_completion_score'];
      if (rawScore && !isNaN(Number(rawScore))) {
        completionScore = Number(rawScore);
      }
      
      return {
        id,
        businessName: row['L1_company_name'] || 'Unknown Business',
        category: row['L1_category'] || 'General Contractor',
        email: row['L1_primary_email'] || '',
        phone: row['L1_phone'] || '',
        website: row['L1_website'] || '',
        address: row['L1_address_full'] || '',
        city: row['L1_city'] || '',
        state: row['L1_state_code'] || '',
        zipCode: row['L1_postal_code'] || '',
        completionScore,
        healthScore: 50,
        trustScore: 50,
        googleRating: Number(row['L1_google_rating']) || 0,
        reviewsCount: Number(row['L1_google_reviews_count']) || 0,
        intelligence: {
          websiteSpeed: {
            mobile: Number(row['L1_psi_mobile_performance']) || 0,
            desktop: Number(row['L1_psi_desktop_performance']) || 0,
            average: Number(row['L1_psi_avg_performance']) || 0,
          },
          reviewsRecency: row['L1_review_frequency'] || 'UNKNOWN',
          daysSinceLatest: Number(row['L1_days_since_latest_review']) || 0,
          platformDetection: row['L1_builder_platform'] || 'Unknown',
          domainAge: Number(row['L1_whois_domain_age_years']) || 0,
          businessHours: row['L1_weekday_hours'] || 'Mon-Fri 8AM-5PM',
          lastReviewDate: row['L1_last_review_date'] || '',
          websiteBuilder: row['L1_builder_platform'] || '',
          expiringSoon: Number(row['L1_whois_expiring_soon']) || 0,
        },
        businessHealth: 'NEEDS_ATTENTION' as const,
        sophisticationTier: 'Amateur' as const,
        emailQuality: row['L2_email_quality'] || 'UNKNOWN',
        name: '',
        lastName: '',
        hasCampaign,
        hasFocusGroup: !!campaignData?.focus_group_generated,
        campaignData: campaignData || null,
        cost: campaignData?.cost || 0,
        sessionDuration: campaignData?.duration_minutes || 0,
        tokensUsed: campaignData?.tokens || 0,
        emailSequences: campaignData?.campaign_data?.email_sequences?.length || 0,
        notes: [],
        // Include raw CSV data for detailed intelligence
        rawData: row,
      };
    });
    
    // Debug contractor 3993 and 1062
    const contractor3993 = contractors.find(c => c.id === '3993');
    if (contractor3993) {
      console.log('SIMPLE API - Contractor 3993:', {
        id: contractor3993.id,
        completionScore: contractor3993.completionScore,
        businessName: contractor3993.businessName
      });
    }

    const contractor1062 = contractors.find(c => c.id === '1062');
    if (contractor1062) {
      console.log('SIMPLE API - Contractor 1062:', {
        id: contractor1062.id,
        hasCampaign: contractor1062.hasCampaign,
        campaignData: !!contractor1062.campaignData,
        businessName: contractor1062.businessName
      });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const start = parseInt(searchParams.get('start') || '0');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const filtersParam = searchParams.get('filters') || '';
    
    let filteredContractors = contractors;
    
    // Apply filters first
    if (filtersParam) {
      const filters = filtersParam.split(',').filter(f => f.trim());
      filteredContractors = contractors.filter(contractor => {
        return filters.every(filter => {
          switch (filter) {
            // Completion score filters
            case 'completion-80-100':
              return contractor.completionScore >= 80;
            case 'completion-60-79':
              return contractor.completionScore >= 60 && contractor.completionScore < 80;
            case 'completion-35-59':
              return contractor.completionScore >= 35 && contractor.completionScore < 60;
            case 'completion-0-34':
              return contractor.completionScore < 35;
            
            // State filters
            case 'alabama': return contractor.state === 'AL';
            case 'arkansas': return contractor.state === 'AR';
            case 'idaho': return contractor.state === 'ID';
            case 'kansas': return contractor.state === 'KS';
            case 'kentucky': return contractor.state === 'KY';
            case 'mississippi': return contractor.state === 'MS';
            case 'montana': return contractor.state === 'MT';
            case 'newMexico': return contractor.state === 'NM';
            case 'oklahoma': return contractor.state === 'OK';
            case 'southDakota': return contractor.state === 'SD';
            case 'utah': return contractor.state === 'UT';
            case 'westVirginia': return contractor.state === 'WV';
            
            // Category filters using exact mapping
            case 'roofing': return getMegaCategory(contractor.category) === 'Roofing';
            case 'hvac': return getMegaCategory(contractor.category) === 'HVAC';
            case 'plumbing': return getMegaCategory(contractor.category) === 'Plumbing';
            case 'electrical': return getMegaCategory(contractor.category) === 'Electrical';
            case 'remodeling': return getMegaCategory(contractor.category) === 'Remodeling & Finishing';
            case 'exterior': return getMegaCategory(contractor.category) === 'Exterior & Landscaping';
            case 'heavyCivil': return getMegaCategory(contractor.category) === 'Heavy & Civil Work';
            case 'homeBuilding': return getMegaCategory(contractor.category) === 'Home Building';
            case 'specialty': return getMegaCategory(contractor.category) === 'Specialty Trades & Handyman';
            case 'suppliers': return getMegaCategory(contractor.category) === 'Suppliers & Materials';
            case 'ancillary': return getMegaCategory(contractor.category) === 'Ancillary Services';
            case 'construction': return getMegaCategory(contractor.category) === 'General Construction';
            case 'windowDoor': return getMegaCategory(contractor.category) === 'Window & Door';
            case 'other': return getMegaCategory(contractor.category) === 'Other';
            
            // Review filters
            case 'many-reviews': return contractor.reviewsCount >= 50;
            case 'few-reviews': return contractor.reviewsCount > 0 && contractor.reviewsCount < 20;
            case 'no-reviews': return contractor.reviewsCount === 0 || contractor.reviewsCount === null;
            case 'active-reviews': return contractor.intelligence.reviewsRecency === 'ACTIVE';
            case 'inactive-reviews': return contractor.intelligence.reviewsRecency === 'INACTIVE';
              
            // Website builder filters using exact mapping
            case 'wix-site': return contractor.intelligence.websiteBuilder === 'Wix';
            case 'godaddy-site': return contractor.intelligence.websiteBuilder === 'GoDaddy';
            case 'squarespace-site': return contractor.intelligence.websiteBuilder === 'Squarespace';
            case 'custom-site': 
              const builder = contractor.intelligence.websiteBuilder;
              return !builder || 
                     builder === '' || 
                     builder === 'WordPress' || 
                     builder === 'Apache' || 
                     builder === 'Nginx' || 
                     builder === 'Unknown' || 
                     builder === 'ERROR';
                     
            // Email quality
            case 'professional-email': return contractor.emailQuality === 'PROFESSIONAL_DOMAIN';
            case 'personal-email': return contractor.emailQuality === 'PERSONAL_DOMAIN';
            
            // PSI performance using average
            case 'high-psi': return contractor.intelligence.websiteSpeed.average >= 85;
            case 'medium-psi': return contractor.intelligence.websiteSpeed.average >= 60 && contractor.intelligence.websiteSpeed.average < 85;
            case 'low-psi': return contractor.intelligence.websiteSpeed.average < 60;
            
            // Domain age filters
            case 'established-domain': return contractor.intelligence.domainAge >= 5;
            case 'new-domain': return contractor.intelligence.domainAge > 0 && contractor.intelligence.domainAge < 2;
            case 'expiring-domain': return contractor.intelligence.expiringSoon === 1;
            
            // Rating filters
            case 'high-rating': return contractor.googleRating >= 4.5;
            case 'low-rating': return contractor.googleRating < 4.0;
            
            // Campaign Status filters
            case 'campaign-ready': return contractor.hasCampaign && contractor.campaignData;
            case 'campaign-processing': return false; // Will implement when we have status in data
            case 'campaign-not-setup': return !contractor.hasCampaign;
            case 'campaign-failed': return false; // Will implement when we have status in data
            
            default:
              return true;
          }
        });
      });
    }
    
    // Search functionality - search through filtered contractors
    if (search.trim()) {
      const query = search.toLowerCase();
      filteredContractors = filteredContractors.filter(contractor => 
        contractor.businessName.toLowerCase().includes(query) ||
        contractor.category.toLowerCase().includes(query) ||
        contractor.state.toLowerCase().includes(query) ||
        contractor.id.includes(query) ||
        contractor.city.toLowerCase().includes(query)
      );
    }
    
    // Pagination
    const paginatedContractors = filteredContractors.slice(start, start + limit);
    
    return NextResponse.json({
      contractors: paginatedContractors,
      total: filteredContractors.length,
      totalAll: contractors.length,
      hasMore: start + limit < filteredContractors.length,
      message: search ? `Found ${filteredContractors.length} results for "${search}"` : `Page ${Math.floor(start/limit) + 1} of contractors`,
      search: search || null,
      start,
      limit
    });
    
  } catch (error) {
    console.error('Simple API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to load contractors',
      contractors: [],
      total: 0 
    }, { status: 500 });
  }
}