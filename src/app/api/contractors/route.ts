import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import fs from 'fs/promises';
import path from 'path';

// Cache for CSV data to avoid re-parsing
let csvCache: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const start = parseInt(searchParams.get('start') || '0');
  const limit = parseInt(searchParams.get('limit') || '100');
  
  try {
    // Check cache
    const now = Date.now();
    if (!csvCache || now - cacheTimestamp > CACHE_DURATION) {
      // Use the original master CSV file directly
      const csvPath = path.join(process.cwd(), 'public', 'data', 'contractors_original.csv');
      
      try {
        await fs.access(csvPath);
      } catch (error) {
        // Return mock data if no CSV file found
        return NextResponse.json({
          contractors: generateMockData(limit),
          total: 1000,
          hasMore: start + limit < 1000,
          message: 'Using mock data - CSV file not found'
        });
      }
      
      const csvContent = await fs.readFile(csvPath, 'utf-8');
      
      // Parse CSV with proper quote handling for complex fields
      const parsed = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header) => header.trim(),
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ',',
        newline: '\n'
      });
      
      if (parsed.errors.length > 0) {
        console.warn('CSV parsing errors:', parsed.errors);
      }
      
      csvCache = parsed.data;
      cacheTimestamp = now;
    }
    
    // Paginate and process data
    const rawData = csvCache.slice(start, start + limit);
    const processedData = rawData.map(row => processContractorRow(row));
    
    return NextResponse.json({
      contractors: processedData,
      total: csvCache.length,
      hasMore: start + limit < csvCache.length,
    });
  } catch (error) {
    console.error('Error reading CSV:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      contractors: generateMockData(limit),
      total: 1000,
      hasMore: start + limit < 1000,
      message: 'Using mock data due to error'
    });
  }
}

// Generate mock data for development/fallback
function generateMockData(count: number) {
  const states = ['KS', 'TX', 'CO', 'ID', 'CA', 'FL'];
  const categories = ['Roofing', 'HVAC', 'Electrical', 'Plumbing', 'General Contractor'];
  const companies = [
    'Superior Construction',
    'Elite Roofing Solutions',
    'Pro HVAC Services',
    'Premier Electrical',
    'Quality Contractors Inc',
    'Master Builders LLC',
    'Expert Home Services',
    'Reliable Construction Co',
    'Top Tier Contractors',
    'Advanced Building Solutions'
  ];
  
  const mockData = [];
  
  for (let i = 0; i < count; i++) {
    const id = String(1000 + i).padStart(5, '0');
    const state = states[Math.floor(Math.random() * states.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    
    mockData.push({
      'Business ID': id,
      'Business Name': `${company} ${i + 1}`,
      'Category': category,
      'Email': `contact@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      'Phone': `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      'Website': `https://${company.toLowerCase().replace(/\s+/g, '')}.com`,
      'Address': `${Math.floor(Math.random() * 9999) + 1} Main St, ${state}`,
      'City': `City${i + 1}`,
      'State': state,
      'Zip Code': String(Math.floor(Math.random() * 90000) + 10000),
      'Completion Score': Math.floor(Math.random() * 40) + 60, // 60-100
      'Health Score': Math.floor(Math.random() * 40) + 60,
      'Trust Score': Math.floor(Math.random() * 40) + 60,
      'Google Rating': (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
      'Reviews Count': Math.floor(Math.random() * 200) + 10,
      'Mobile Speed': Math.floor(Math.random() * 40) + 60,
      'Desktop Speed': Math.floor(Math.random() * 40) + 60,
      'Days Since Latest Review': Math.floor(Math.random() * 200),
      'Platform': Math.random() > 0.5 ? 'Google My Business' : 'Yelp',
      'Domain Age': (Math.random() * 10 + 1).toFixed(1),
      'Business Hours': 'Mon-Fri 8AM-5PM'
    });
  }
  
  return mockData;
}

// Process contractor row with proper completion score parsing
function processContractorRow(row: any) {
  const id = String(row['business_id'] || row.id).replace(/^0+/, '').trim().replace(/_[A-Z]*$/, '');
  
  // Better parsing for completion score
  const rawScore = row['data_completion_score'];
  let completionScore = 0;
  
  if (rawScore !== null && rawScore !== undefined && rawScore !== '') {
    const parsed = parseFloat(String(rawScore));
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      completionScore = Math.round(parsed);
    }
  }
  
  return {
    'business_id': id,
    'Business ID': id,
    'Business Name': row['L1_company_name'] || 'Unknown Business',
    'Category': row['L1_category'] || 'General Contractor',
    'Email': row['L1_primary_email'] || 'contact@example.com',
    'Phone': row['L1_phone'] || '(555) 000-0000',
    'Website': row['L1_website'] || '',
    'Address': row['L1_address_full'] || 'Unknown Location',
    'City': row['L1_city'] || '',
    'State': row['L1_state_code'] || 'Unknown',
    'Zip Code': row['L1_postal_code'] || '',
    'Completion Score': completionScore,
    'Health Score': calculateHealthScore(row, completionScore),
    'Trust Score': Math.round(parseFloat(row['L2_trust_score']) * 100) || 0,
    'Google Rating': parseFloat(row['L1_google_rating']) || 0,
    'Reviews Count': parseInt(row['L1_google_reviews_count']) || 0,
    'Mobile Speed': parseInt(row['L1_psi_mobile_performance']) || 0,
    'Desktop Speed': parseInt(row['L1_psi_desktop_performance']) || 0,
    'Days Since Latest Review': parseInt(row['L1_days_since_latest_review']) || 0,
    'Platform': row['L1_builder_platform'] || 'Unknown',
    'Domain Age': parseFloat(row['L1_whois_domain_age_years']) || 0,
    'Business Hours': row['L1_weekday_hours'] || 'Mon-Fri 8AM-5PM'
  };
}

function calculateHealthScore(row: any, completionScore: number): number {
  const googleRating = parseFloat(row['L1_google_rating']) || 0;
  const reviewsCount = parseInt(row['L1_google_reviews_count']) || 0;
  const sophisticationScore = parseInt(row['L2_sophistication_score']) || 0;
  
  let healthScore = 0;
  healthScore += completionScore * 0.4;
  healthScore += (googleRating * 20) * 0.3;
  healthScore += Math.min(reviewsCount * 2, 20) * 0.2;
  healthScore += sophisticationScore * 0.1;
  
  return Math.round(Math.min(healthScore, 100));
}

// PATCH method for updating NAME and LAST_NAME fields
export async function PATCH(request: NextRequest) {
  try {
    const { businessId, name, lastName } = await request.json();
    
    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const csvPath = path.join(process.cwd(), 'public', 'data', 'contractors_editable.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    // Parse CSV
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });
    
    // Find and update the contractor
    const contractorIndex = parsed.data.findIndex((row: any) => 
      String(row.business_id) === String(businessId)
    );
    
    if (contractorIndex === -1) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }
    
    // Update the fields
    (parsed.data[contractorIndex] as any).NAME = name || '';
    (parsed.data[contractorIndex] as any).LAST_NAME = lastName || '';
    
    // Convert back to CSV
    const updatedCsv = Papa.unparse(parsed.data);
    
    // Write back to file
    await fs.writeFile(csvPath, updatedCsv, 'utf-8');
    
    // Clear cache to force reload
    csvCache = null;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Contractor updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating contractor:', error);
    return NextResponse.json({ 
      error: 'Failed to update contractor' 
    }, { status: 500 });
  }
}