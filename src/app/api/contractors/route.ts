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
      // Try different possible paths for the CSV file
      let csvPath = path.join(process.cwd(), 'public', 'data', 'contractors.csv');
      
      try {
        await fs.access(csvPath);
      } catch (error) {
        // If file doesn't exist, try relative path
        csvPath = path.join(process.cwd(), 'CONTRACTORS - Master_Sheet.csv');
        try {
          await fs.access(csvPath);
        } catch (error2) {
          // Return mock data if no CSV file found
          return NextResponse.json({
            contractors: generateMockData(limit),
            total: 1000,
            hasMore: start + limit < 1000,
            message: 'Using mock data - CSV file not found'
          });
        }
      }
      
      const csvContent = await fs.readFile(csvPath, 'utf-8');
      
      // Parse CSV
      const parsed = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header) => header.trim(),
      });
      
      if (parsed.errors.length > 0) {
        console.warn('CSV parsing errors:', parsed.errors);
      }
      
      csvCache = parsed.data;
      cacheTimestamp = now;
    }
    
    // Paginate
    const paginatedData = csvCache.slice(start, start + limit);
    
    return NextResponse.json({
      contractors: paginatedData,
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