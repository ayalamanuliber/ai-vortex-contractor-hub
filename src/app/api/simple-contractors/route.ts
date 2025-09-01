import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'data', 'contractors_original.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });
    
    // Process each contractor directly with proper completion score
    const contractors = parsed.data.map((row: any) => {
      const id = String(row['business_id']).replace(/^0+/, '').trim();
      
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
          },
          reviewsRecency: 'UNKNOWN' as const,
          daysSinceLatest: Number(row['L1_days_since_latest_review']) || 0,
          platformDetection: row['L1_builder_platform'] || 'Unknown',
          domainAge: Number(row['L1_whois_domain_age_years']) || 0,
          businessHours: row['L1_weekday_hours'] || 'Mon-Fri 8AM-5PM',
          lastReviewDate: row['L1_last_review_date'] || '',
          websiteBuilder: row['L1_builder_platform'] || 'Unknown',
        },
        businessHealth: 'NEEDS_ATTENTION' as const,
        sophisticationTier: 'Amateur' as const,
        emailQuality: row['L2_email_quality'] || 'UNKNOWN',
        name: '',
        lastName: '',
        hasCampaign: false,
        hasFocusGroup: false,
        campaignData: null,
        cost: 0,
        sessionDuration: 0,
        tokensUsed: 0,
        emailSequences: 0,
        notes: [],
      };
    });
    
    // Debug contractor 3993
    const contractor3993 = contractors.find(c => c.id === '3993');
    if (contractor3993) {
      console.log('SIMPLE API - Contractor 3993:', {
        id: contractor3993.id,
        completionScore: contractor3993.completionScore,
        businessName: contractor3993.businessName
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
            
            // Category filters  
            case 'roofing': return contractor.category.toLowerCase().includes('roofing');
            case 'hvac': return contractor.category.toLowerCase().includes('hvac');
            case 'plumbing': return contractor.category.toLowerCase().includes('plumbing');
            case 'electrical': return contractor.category.toLowerCase().includes('electrical');
            case 'remodeling': return contractor.category.toLowerCase().includes('remodeling') || contractor.category.toLowerCase().includes('finishing');
            case 'exterior': return contractor.category.toLowerCase().includes('exterior') || contractor.category.toLowerCase().includes('landscaping');
            case 'heavyCivil': return contractor.category.toLowerCase().includes('heavy') || contractor.category.toLowerCase().includes('civil');
            case 'homeBuilding': return contractor.category.toLowerCase().includes('home building') || contractor.category.toLowerCase().includes('builder');
            case 'specialty': return contractor.category.toLowerCase().includes('specialty') || contractor.category.toLowerCase().includes('handyman');
            case 'suppliers': return contractor.category.toLowerCase().includes('suppliers') || contractor.category.toLowerCase().includes('materials');
            case 'ancillary': return contractor.category.toLowerCase().includes('ancillary') || contractor.category.toLowerCase().includes('services');
            case 'construction': return contractor.category.toLowerCase().includes('construction') || contractor.category.toLowerCase().includes('contractor');
            case 'windowDoor': return contractor.category.toLowerCase().includes('window') || contractor.category.toLowerCase().includes('door');
            case 'other': return contractor.category.toLowerCase().includes('other') || contractor.category === '';
            
            // Review filters
            case 'many-reviews': return contractor.reviewsCount >= 50;
            case 'few-reviews': return contractor.reviewsCount > 0 && contractor.reviewsCount < 20;
            case 'no-reviews': return contractor.reviewsCount === 0;
            case 'active-reviews': 
              if (!contractor.intelligence.lastReviewDate) return false;
              const sixMonthsAgo = new Date();
              sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
              const lastReview = new Date(contractor.intelligence.lastReviewDate);
              return lastReview > sixMonthsAgo;
            case 'inactive-reviews':
              if (!contractor.intelligence.lastReviewDate) return false;
              const sixMonthsAgoInactive = new Date();
              sixMonthsAgoInactive.setMonth(sixMonthsAgoInactive.getMonth() - 6);
              const lastReviewInactive = new Date(contractor.intelligence.lastReviewDate);
              return lastReviewInactive <= sixMonthsAgoInactive;
              
            // Website builder filters
            case 'wix-site': 
              return contractor.intelligence.websiteBuilder?.toLowerCase().includes('wix') || false;
            case 'godaddy-site': 
              const goDaddyBuilder = contractor.intelligence.websiteBuilder?.toLowerCase() || '';
              return goDaddyBuilder.includes('godaddy') || goDaddyBuilder.includes('go daddy');
            case 'squarespace-site': 
              return contractor.intelligence.websiteBuilder?.toLowerCase().includes('squarespace') || false;
            case 'custom-site': 
              const builder = contractor.intelligence.websiteBuilder?.toLowerCase() || '';
              return (builder.includes('wordpress') || 
                      builder.includes('custom') || 
                      builder === 'unknown' ||
                      (!builder.includes('wix') && 
                       !builder.includes('godaddy') && 
                       !builder.includes('go daddy') && 
                       !builder.includes('squarespace') &&
                       !builder.includes('facebook'))) &&
                     builder !== '';
                     
            // Email quality
            case 'professional-email': return contractor.emailQuality === 'PROFESSIONAL_DOMAIN';
            case 'personal-email': return contractor.emailQuality === 'PERSONAL_DOMAIN';
            
            // PSI performance
            case 'high-psi': return contractor.intelligence.websiteSpeed.mobile >= 85;
            case 'medium-psi': return contractor.intelligence.websiteSpeed.mobile >= 60 && contractor.intelligence.websiteSpeed.mobile < 85;
            case 'low-psi': return contractor.intelligence.websiteSpeed.mobile < 60;
            
            // Rating filters
            case 'high-rating': return contractor.googleRating >= 4.5;
            case 'low-rating': return contractor.googleRating < 4.0;
            
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