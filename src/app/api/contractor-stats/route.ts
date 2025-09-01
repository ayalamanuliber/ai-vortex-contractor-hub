import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'data', 'contractors_original.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });
    
    // Process contractors for stats
    const contractors = parsed.data.map((row: any) => ({
      id: String(row['business_id']).replace(/^0+/, '').trim(),
      completionScore: Number(row['data_completion_score']) || 0,
      state: row['L1_state_code'] || '',
      category: row['L1_category'] || '',
      googleRating: Number(row['L1_google_rating']) || 0,
      reviewsCount: Number(row['L1_google_reviews_count']) || 0,
      mobileSpeed: Number(row['L1_psi_mobile_performance']) || 0,
      emailQuality: row['L2_email_quality'] || 'UNKNOWN',
      businessHealth: row['L1_targeting_business_health'] || 'NEEDS_ATTENTION',
    }));
    
    // Calculate filter stats
    const stats = {
      total: contractors.length,
      
      // Completion Score
      completion: {
        high: contractors.filter(c => c.completionScore >= 85).length,
        medium: contractors.filter(c => c.completionScore >= 70 && c.completionScore < 85).length,
        low: contractors.filter(c => c.completionScore >= 50 && c.completionScore < 70).length,
        veryLow: contractors.filter(c => c.completionScore < 50).length,
      },
      
      // States (top 6)
      states: {
        kansas: contractors.filter(c => c.state === 'KS').length,
        texas: contractors.filter(c => c.state === 'TX').length,
        colorado: contractors.filter(c => c.state === 'CO').length,
        idaho: contractors.filter(c => c.state === 'ID').length,
        california: contractors.filter(c => c.state === 'CA').length,
        florida: contractors.filter(c => c.state === 'FL').length,
      },
      
      // Categories
      categories: {
        roofing: contractors.filter(c => c.category.toLowerCase().includes('roofing')).length,
        hvac: contractors.filter(c => c.category.toLowerCase().includes('hvac')).length,
        electrical: contractors.filter(c => c.category.toLowerCase().includes('electrical')).length,
        plumbing: contractors.filter(c => c.category.toLowerCase().includes('plumbing')).length,
        construction: contractors.filter(c => c.category.toLowerCase().includes('construction')).length,
        contractor: contractors.filter(c => c.category.toLowerCase().includes('contractor')).length,
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
      
      // Business Health
      health: {
        healthy: contractors.filter(c => c.businessHealth === 'HEALTHY').length,
        emerging: contractors.filter(c => c.businessHealth === 'EMERGING').length,
        needsAttention: contractors.filter(c => c.businessHealth === 'NEEDS_ATTENTION').length,
        struggling: contractors.filter(c => c.businessHealth === 'STRUGGLING').length,
      }
    };
    
    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to calculate stats',
      stats: null 
    }, { status: 500 });
  }
}