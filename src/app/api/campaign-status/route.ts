import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
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

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { contractorId, emailIndex, status, scheduledDate, sentDate } = body;
    
    if (!contractorId || emailIndex === undefined || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: contractorId, emailIndex, status' },
        { status: 400 }
      );
    }

    // Load existing campaign statuses
    let campaignStatuses: any = {};
    const statusPath = path.join(process.cwd(), 'public', 'data', 'campaign_statuses.json');
    
    try {
      const statusContent = await fs.readFile(statusPath, 'utf-8');
      campaignStatuses = JSON.parse(statusContent);
    } catch (error) {
      // File doesn't exist yet, create empty structure
      campaignStatuses = { contractors: {} };
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

    // Save updated statuses
    await fs.writeFile(statusPath, JSON.stringify(campaignStatuses, null, 2));

    const response = NextResponse.json({
      success: true,
      message: `Campaign status updated for contractor ${contractorId}`,
      data: {
        contractorId,
        emailIndex,
        status,
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

    const statusPath = path.join(process.cwd(), 'public', 'data', 'campaign_statuses.json');
    
    try {
      const statusContent = await fs.readFile(statusPath, 'utf-8');
      const campaignStatuses = JSON.parse(statusContent);
      
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
      // File doesn't exist, return empty data
      const response = NextResponse.json({
        success: true,
        data: contractorId ? { emailStatuses: {}, lastUpdated: null } : { contractors: {} }
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