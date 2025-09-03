import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import fs from 'fs/promises';
import path from 'path';

// Cache for better performance
let statsCache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

export async function GET() {
  try {
    // Check cache first
    const now = Date.now();
    if (statsCache && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json({
        stats: statsCache,
        timestamp: new Date(cacheTimestamp).toISOString(),
        cached: true
      });
    }

    const csvPath = path.join(process.cwd(), 'public', 'data', 'contractors_original.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    // Load campaigns JSON data (new object format)
    let campaignsData: any = { contractors: {} };
    try {
      const campaignsPath = path.join(process.cwd(), 'public', 'data', 'campaigns.json');
      const campaignsContent = await fs.readFile(campaignsPath, 'utf-8');
      campaignsData = JSON.parse(campaignsContent);
    } catch (error) {
      console.log('No campaigns data found, using default stats');
      campaignsData = { contractors: {} };
    }

    // Create campaigns lookup for performance
    const campaignsLookup: Record<string, any> = {};
    const contractorsObj = campaignsData.contractors || {};
    
    Object.entries(contractorsObj).forEach(([contractorId, contractorData]: [string, any]) => {
      if (contractorData.campaign_data) {
        const campaign = contractorData.campaign_data;
        
        // Store both padded and unpadded versions for flexible matching
        const paddedId = contractorId;
        const unpaddedId = parseInt(contractorId, 10).toString();
        campaignsLookup[paddedId] = campaign;
        campaignsLookup[unpaddedId] = campaign;
      }
    });
    
    // Process contractors for stats (faster processing)
    const contractors = parsed.data.map((row: any) => {
      const businessId = String(row['business_id']).replace(/^0+/, '').trim();
      const campaignData = campaignsLookup[businessId];
      
      // Determine campaign status
      let campaignStatus = 'NOT_SETUP';
      if (campaignData) {
        // New format: if campaign exists in array, it's completed/ready
        campaignStatus = 'READY';
      }

      return {
        businessId,
        completionScore: Number(row['data_completion_score']) || 0,
        state: row['L1_state_code'] || '',
        category: row['L1_category'] || '',
        googleRating: Number(row['L1_google_rating']) || 0,
        googleReviews: Number(row['L1_google_reviews_count']) || 0,
        avgSpeed: Number(row['L1_psi_avg_performance']) || 0,
        emailQuality: row['L2_email_quality'] || 'UNKNOWN',
        websiteBuilder: row['L1_builder_platform'] || '',
        reviewFrequency: row['L1_review_frequency'] || '',
        domainAge: Number(row['L1_whois_domain_age_years']) || 0,
        expiringSoon: Number(row['L1_whois_expiring_soon']) || 0,
        campaignStatus,
      };
    });
    
    // Calculate filter stats efficiently
    const stats = {
      total: contractors.length,
      
      // Completion Score
      completion: {
        high: contractors.filter(c => c.completionScore >= 80).length,
        medium: contractors.filter(c => c.completionScore >= 60 && c.completionScore < 80).length,
        low: contractors.filter(c => c.completionScore >= 35 && c.completionScore < 60).length,
        veryLow: contractors.filter(c => c.completionScore < 35).length,
      },
      
      // Real states from your data
      states: {
        alabama: contractors.filter(c => c.state === 'AL').length,
        arkansas: contractors.filter(c => c.state === 'AR').length,
        idaho: contractors.filter(c => c.state === 'ID').length,
        kansas: contractors.filter(c => c.state === 'KS').length,
        kentucky: contractors.filter(c => c.state === 'KY').length,
        mississippi: contractors.filter(c => c.state === 'MS').length,
        montana: contractors.filter(c => c.state === 'MT').length,
        newMexico: contractors.filter(c => c.state === 'NM').length,
        oklahoma: contractors.filter(c => c.state === 'OK').length,
        southDakota: contractors.filter(c => c.state === 'SD').length,
        utah: contractors.filter(c => c.state === 'UT').length,
        westVirginia: contractors.filter(c => c.state === 'WV').length,
      },
      
      // 14 Real Mega Categories
      categories: {
        roofing: contractors.filter(c => getMegaCategory(c.category) === 'Roofing').length,
        hvac: contractors.filter(c => getMegaCategory(c.category) === 'HVAC').length,
        plumbing: contractors.filter(c => getMegaCategory(c.category) === 'Plumbing').length,
        electrical: contractors.filter(c => getMegaCategory(c.category) === 'Electrical').length,
        remodeling: contractors.filter(c => getMegaCategory(c.category) === 'Remodeling & Finishing').length,
        exterior: contractors.filter(c => getMegaCategory(c.category) === 'Exterior & Landscaping').length,
        heavyCivil: contractors.filter(c => getMegaCategory(c.category) === 'Heavy & Civil Work').length,
        homeBuilding: contractors.filter(c => getMegaCategory(c.category) === 'Home Building').length,
        specialty: contractors.filter(c => getMegaCategory(c.category) === 'Specialty Trades & Handyman').length,
        suppliers: contractors.filter(c => getMegaCategory(c.category) === 'Suppliers & Materials').length,
        ancillary: contractors.filter(c => getMegaCategory(c.category) === 'Ancillary Services').length,
        construction: contractors.filter(c => getMegaCategory(c.category) === 'General Construction').length,
        windowDoor: contractors.filter(c => getMegaCategory(c.category) === 'Window & Door').length,
        other: contractors.filter(c => getMegaCategory(c.category) === 'Other').length,
      },
      
      // Website Speed (PSI Average)
      speed: {
        high: contractors.filter(c => c.avgSpeed >= 85).length,
        medium: contractors.filter(c => c.avgSpeed >= 60 && c.avgSpeed < 85).length,
        low: contractors.filter(c => c.avgSpeed < 60).length,
      },
      
      // Google Rating
      rating: {
        high: contractors.filter(c => c.googleRating >= 4.5).length,
        good: contractors.filter(c => c.googleRating >= 4.0 && c.googleRating < 4.5).length,
        average: contractors.filter(c => c.googleRating >= 3.5 && c.googleRating < 4.0).length,
        low: contractors.filter(c => c.googleRating < 3.5 && c.googleRating > 0).length,
        noRating: contractors.filter(c => c.googleRating === 0).length,
      },
      
      // Email Quality
      email: {
        professional: contractors.filter(c => c.emailQuality === 'PROFESSIONAL_DOMAIN').length,
        personal: contractors.filter(c => c.emailQuality === 'PERSONAL_DOMAIN').length,
        unknown: contractors.filter(c => c.emailQuality === 'UNKNOWN').length,
      },
      
      // Review Statistics
      reviews: {
        highRating: contractors.filter(c => c.googleRating >= 4.5).length,
        lowRating: contractors.filter(c => c.googleRating > 0 && c.googleRating < 4.0).length,
        manyReviews: contractors.filter(c => c.googleReviews >= 50).length,
        fewReviews: contractors.filter(c => c.googleReviews > 0 && c.googleReviews < 20).length,
        activeReviews: contractors.filter(c => c.reviewFrequency === 'ACTIVE').length,
        inactiveReviews: contractors.filter(c => c.reviewFrequency === 'INACTIVE').length,
        noReviews: contractors.filter(c => c.googleReviews === 0 || c.googleReviews === null).length,
      },
      
      // Website Builder Statistics  
      builders: {
        wix: contractors.filter(c => c.websiteBuilder === 'Wix').length,
        godaddy: contractors.filter(c => c.websiteBuilder === 'GoDaddy').length,
        squarespace: contractors.filter(c => c.websiteBuilder === 'Squarespace').length,
        custom: contractors.filter(c => {
          // Custom/WordPress: NULL, "WordPress", "Apache", "Nginx", "Unknown", "ERROR" or empty
          return !c.websiteBuilder || 
                 c.websiteBuilder === '' || 
                 c.websiteBuilder === 'WordPress' || 
                 c.websiteBuilder === 'Apache' || 
                 c.websiteBuilder === 'Nginx' || 
                 c.websiteBuilder === 'Unknown' || 
                 c.websiteBuilder === 'ERROR';
        }).length,
      },
      
      // Domain Age Statistics
      domain: {
        established: contractors.filter(c => c.domainAge >= 5).length,
        new: contractors.filter(c => c.domainAge > 0 && c.domainAge < 2).length,
        expiringSoon: contractors.filter(c => c.expiringSoon === 1).length,
      },

      // Campaign Status Statistics
      campaigns: {
        ready: contractors.filter(c => c.campaignStatus === 'READY').length,
        processing: contractors.filter(c => c.campaignStatus === 'PROCESSING').length,
        notSetup: contractors.filter(c => c.campaignStatus === 'NOT_SETUP').length,
        failed: contractors.filter(c => c.campaignStatus === 'FAILED').length,
      },
    };
    
    // Cache the results
    statsCache = stats;
    cacheTimestamp = now;
    
    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString(),
      cached: false
    });
    
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to calculate stats',
      stats: null 
    }, { status: 500 });
  }
}