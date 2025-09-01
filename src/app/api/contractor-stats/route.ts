import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import fs from 'fs/promises';
import path from 'path';

// Cache for better performance
let statsCache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to categorize contractors based on keywords
function getMegaCategory(category: string): string {
  if (!category) return 'Other';
  
  const cat = category.toLowerCase();
  
  if (cat.includes('roofing') || cat.includes('roofer') || cat.includes('skylight')) return 'Roofing';
  if (cat.includes('hvac') || cat.includes('heating') || cat.includes('air conditioning') || cat.includes('air duct')) return 'HVAC';
  if (cat.includes('plumber') || cat.includes('plumbing') || cat.includes('septic')) return 'Plumbing';
  if (cat.includes('electric') || cat.includes('electrical') || cat.includes('lighting') || cat.includes('solar')) return 'Electrical';
  if (cat.includes('remodel') || cat.includes('kitchen') || cat.includes('bathroom') || cat.includes('paint') || cat.includes('cabinet') || cat.includes('countertop') || cat.includes('floor') || cat.includes('tile') || cat.includes('carpet') || cat.includes('furniture')) return 'Remodeling & Finishing';
  if (cat.includes('siding') || cat.includes('gutter') || cat.includes('landscap') || cat.includes('lawn') || cat.includes('deck') || cat.includes('fence') || cat.includes('pond')) return 'Exterior & Landscaping';
  if (cat.includes('pav') || cat.includes('asphalt') || cat.includes('excavat') || cat.includes('demolition') || cat.includes('concrete') || cat.includes('masonry') || cat.includes('road construction') || cat.includes('dock') || cat.includes('logging')) return 'Heavy & Civil Work';
  if (cat.includes('home builder') || cat.includes('log home') || cat.includes('custom home') || cat.includes('modular home') || cat.includes('portable building')) return 'Home Building';
  if (cat.includes('handyman') || cat.includes('handywoman') || cat.includes('handyperson') || cat.includes('carpent') || cat.includes('woodworker') || cat.includes('weld') || cat.includes('drilling') || cat.includes('insulation') || cat.includes('swimming pool') || cat.includes('hot tub') || cat.includes('appliance')) return 'Specialty Trades & Handyman';
  if (cat.includes('supply') || cat.includes('supplier') || cat.includes('store') || cat.includes('shop') || cat.includes('wholesaler') || cat.includes('materials') || cat.includes('sand & gravel') || cat.includes('stone')) return 'Suppliers & Materials';
  if (cat.includes('architect') || cat.includes('design') || cat.includes('designer') || cat.includes('engineer') || cat.includes('consultant') || cat.includes('water damage') || cat.includes('waterproofing') || cat.includes('fire') || cat.includes('restoration') || cat.includes('home inspector') || cat.includes('land surveyor')) return 'Ancillary Services';
  if (cat.includes('construction') || cat.includes('contractor') || cat.includes('general contractor') || cat.includes('civil') || cat.includes('utility')) return 'General Construction';
  if (cat.includes('window') || cat.includes('door') || cat.includes('glass & mirror')) return 'Window & Door';
  
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
    
    // Process contractors for stats (faster processing)
    const contractors = parsed.data.map((row: any) => ({
      completionScore: Number(row['data_completion_score']) || 0,
      state: row['L1_state_code'] || '',
      category: getMegaCategory(row['L1_category'] || ''),
      googleRating: Number(row['L1_google_rating']) || 0,
      googleReviews: Number(row['L1_google_reviews_count']) || 0,
      mobileSpeed: Number(row['L1_psi_mobile_performance']) || 0,
      emailQuality: row['L2_email_quality'] || 'UNKNOWN',
      websiteBuilder: row['L1_builder_platform'] || 'UNKNOWN',
      lastReviewDate: row['L1_last_review_date'] || '',
      domainAge: Number(row['L1_whois_domain_age_years']) || 0,
    }));
    
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
        roofing: contractors.filter(c => c.category === 'Roofing').length,
        hvac: contractors.filter(c => c.category === 'HVAC').length,
        plumbing: contractors.filter(c => c.category === 'Plumbing').length,
        electrical: contractors.filter(c => c.category === 'Electrical').length,
        remodeling: contractors.filter(c => c.category === 'Remodeling & Finishing').length,
        exterior: contractors.filter(c => c.category === 'Exterior & Landscaping').length,
        heavyCivil: contractors.filter(c => c.category === 'Heavy & Civil Work').length,
        homeBuilding: contractors.filter(c => c.category === 'Home Building').length,
        specialty: contractors.filter(c => c.category === 'Specialty Trades & Handyman').length,
        suppliers: contractors.filter(c => c.category === 'Suppliers & Materials').length,
        ancillary: contractors.filter(c => c.category === 'Ancillary Services').length,
        construction: contractors.filter(c => c.category === 'General Construction').length,
        windowDoor: contractors.filter(c => c.category === 'Window & Door').length,
        other: contractors.filter(c => c.category === 'Other').length,
      },
      
      // Website Speed (PSI)
      speed: {
        high: contractors.filter(c => c.mobileSpeed >= 85).length,
        medium: contractors.filter(c => c.mobileSpeed >= 60 && c.mobileSpeed < 85).length,
        low: contractors.filter(c => c.mobileSpeed < 60).length,
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
        activeReviews: contractors.filter(c => {
          if (!c.lastReviewDate) return false;
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          const lastReview = new Date(c.lastReviewDate);
          return lastReview > sixMonthsAgo;
        }).length,
        inactiveReviews: contractors.filter(c => {
          if (!c.lastReviewDate) return false;
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          const lastReview = new Date(c.lastReviewDate);
          return lastReview <= sixMonthsAgo;
        }).length,
        noReviews: contractors.filter(c => c.googleReviews === 0).length,
      },
      
      // Website Builder Statistics  
      builders: {
        wix: contractors.filter(c => {
          const builder = c.websiteBuilder.toLowerCase();
          return builder.includes('wix');
        }).length,
        godaddy: contractors.filter(c => {
          const builder = c.websiteBuilder.toLowerCase();
          return builder.includes('godaddy') || builder.includes('go daddy');
        }).length,
        squarespace: contractors.filter(c => {
          const builder = c.websiteBuilder.toLowerCase();
          return builder.includes('squarespace');
        }).length,
        custom: contractors.filter(c => {
          const builder = c.websiteBuilder.toLowerCase();
          // WordPress, custom, or other non-builder platforms are considered custom
          return (builder.includes('wordpress') || 
                  builder.includes('custom') || 
                  builder === 'unknown' ||
                  (!builder.includes('wix') && 
                   !builder.includes('godaddy') && 
                   !builder.includes('go daddy') && 
                   !builder.includes('squarespace') &&
                   !builder.includes('facebook'))) &&
                 builder !== '';
        }).length,
      },
      
      // Domain Age Statistics
      domain: {
        established: contractors.filter(c => c.domainAge >= 5).length,
        new: contractors.filter(c => c.domainAge > 0 && c.domainAge < 2).length,
        expiringSoon: contractors.filter(c => {
          // This would need domain expiration data from whois
          // For now, using a placeholder calculation
          return false;
        }).length,
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