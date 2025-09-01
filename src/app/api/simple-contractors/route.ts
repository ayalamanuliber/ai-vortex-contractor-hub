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
        },
        businessHealth: 'NEEDS_ATTENTION' as const,
        sophisticationTier: 'Amateur' as const,
        emailQuality: 'UNKNOWN' as const,
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
    const searchId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '500'); // Increase to 500
    
    let filteredContractors = contractors;
    
    // If searching for specific ID, find it and put it first
    if (searchId) {
      const found = contractors.find(c => c.id === searchId);
      if (found) {
        filteredContractors = [found, ...contractors.filter(c => c.id !== searchId)];
      }
    }
    
    return NextResponse.json({
      contractors: filteredContractors.slice(0, limit),
      total: contractors.length,
      message: searchId ? `Found contractor ${searchId}` : 'Direct API - no service layer',
      searchId: searchId || null
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