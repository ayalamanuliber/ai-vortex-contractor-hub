import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, authorization',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// In-memory storage for campaign statuses (temporary solution for Vercel)
// NOTE: This will reset on each deployment, but it's a quick patch until we have a DB
let campaignStatuses: any = { contractors: {} };

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { contractorId, emailIndex, status, scheduledDate, sentDate } = body;
    
    console.log('📥 Campaign Status API - Request received:', {
      contractorId,
      emailIndex,
      status,
      scheduledDate,
      sentDate
    });
    
    if (!contractorId || emailIndex === undefined || !status) {
      console.error('❌ Missing required fields:', { contractorId, emailIndex, status });
      return NextResponse.json(
        { error: 'Missing required fields: contractorId, emailIndex, status' },
        { status: 400 }
      );
    }

    // Initialize contractor data if it doesn't exist
    if (!campaignStatuses.contractors) {
      campaignStatuses.contractors = {};
    }
    if (!campaignStatuses.contractors[contractorId]) {
      campaignStatuses.contractors[contractorId] = { 
        emailStatuses: {},
        lastUpdated: new Date().toISOString()
      };
    }

    // Update the specific email status
    campaignStatuses.contractors[contractorId].emailStatuses[emailIndex] = {
      status,
      scheduledDate: scheduledDate || null,
      sentDate: sentDate || null,
      updatedAt: new Date().toISOString()
    };
    
    campaignStatuses.contractors[contractorId].lastUpdated = new Date().toISOString();
    
    console.log('✅ Campaign status saved in memory:', {
      contractorId,
      emailIndex,
      status,
      scheduledDate,
      totalContractors: Object.keys(campaignStatuses.contractors).length
    });

    const response = NextResponse.json({
      success: true,
      message: `Campaign status updated for contractor ${contractorId}`,
      data: {
        contractorId,
        emailIndex,
        status,
        scheduledDate,
        timestamp: new Date().toISOString()
      }
    });

    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('Campaign status update error:', error);
    
    const errorResponse = NextResponse.json(
      { error: 'Failed to update campaign status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );

    Object.entries(corsHeaders).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });

    return errorResponse;
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contractorId = searchParams.get('contractorId');

    console.log('📤 Campaign Status GET - Request for:', { 
      contractorId, 
      totalContractors: Object.keys(campaignStatuses.contractors || {}).length 
    });

    if (contractorId) {
      // Return specific contractor's status
      const contractorStatus = campaignStatuses.contractors?.[contractorId] || { 
        emailStatuses: {}, 
        lastUpdated: null 
      };
      
      const response = NextResponse.json({
        success: true,
        data: contractorStatus
      });

      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } else {
      // Return all statuses
      const response = NextResponse.json({
        success: true,
        data: campaignStatuses
      });

      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }

  } catch (error) {
    console.error('Campaign status fetch error:', error);
    
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch campaign status' },
      { status: 500 }
    );

    Object.entries(corsHeaders).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });

    return errorResponse;
  }
});