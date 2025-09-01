import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Try different possible paths for the campaigns JSON file
    let jsonPath = path.join(process.cwd(), 'public', 'data', 'campaigns.json');
    
    try {
      await fs.access(jsonPath);
    } catch (error) {
      // If file doesn't exist, try relative path
      jsonPath = path.join(process.cwd(), 'MASTER_CAMPAIGN_DATABASE.json');
      try {
        await fs.access(jsonPath);
      } catch (error2) {
        // Return mock campaign data if no JSON file found
        return NextResponse.json(generateMockCampaigns());
      }
    }
    
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const campaigns = JSON.parse(jsonContent);
    
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error reading campaigns:', error);
    
    // Return mock campaign data as fallback
    return NextResponse.json(generateMockCampaigns());
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const updates = await request.json();
    let jsonPath = path.join(process.cwd(), 'public', 'data', 'campaigns.json');
    
    try {
      await fs.access(jsonPath);
    } catch (error) {
      jsonPath = path.join(process.cwd(), 'MASTER_CAMPAIGN_DATABASE.json');
    }
    
    // Read current data
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const campaigns = JSON.parse(jsonContent);
    
    // Apply updates
    if (campaigns.contractors && campaigns.contractors[updates.businessId]) {
      const contractor = campaigns.contractors[updates.businessId];
      if (contractor.campaign_data?.email_sequences) {
        const email = contractor.campaign_data.email_sequences.find(
          (e: any) => e.email_number === updates.emailNumber
        );
        
        if (email) {
          email.status = updates.status;
          if (updates.date) {
            switch(updates.status) {
              case 'sent':
                email.sent_date = updates.date;
                break;
              case 'opened':
                email.opened_date = updates.date;
                break;
              case 'responded':
                email.responded_date = updates.date;
                break;
            }
          }
        }
      }
      
      // Update last_updated timestamp
      campaigns.database_info.last_updated = new Date().toISOString();
      
      // Write back to file
      await fs.writeFile(jsonPath, JSON.stringify(campaigns, null, 2));
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to update campaigns' },
      { status: 500 }
    );
  }
}

// Generate mock campaign data
function generateMockCampaigns() {
  const mockContractors: any = {};
  
  // Create mock campaign data for first 10 contractors
  for (let i = 0; i < 10; i++) {
    const id = String(1000 + i).padStart(5, '0');
    
    mockContractors[id] = {
      company_name: `Mock Company ${i + 1}`,
      trade: 'Roofing contractor',
      location: 'Kansas',
      processing_status: 'completed',
      timestamp: new Date().toISOString(),
      cost: Math.random() * 0.01,
      tokens: Math.floor(Math.random() * 50000) + 20000,
      duration_minutes: Math.random() * 5 + 1,
      campaign_data: {
        business_id: id,
        company_name: `Mock Company ${i + 1}`,
        contact_timing: {
          best_day_email_1: 'Tuesday',
          best_day_email_2: 'Thursday',
          best_day_email_3: 'Monday',
          window_a_time: '6:30 AM',
          window_b_time: '7:30 PM'
        },
        email_sequences: [
          {
            email_number: 1,
            subject: 'Your business and online presence',
            send_day: 'Tuesday',
            send_time: '6:30 AM',
            body: `Hi there,\n\nI noticed ${`Mock Company ${i + 1}`} and wanted to reach out directly. Your work looks solid, but I see some gaps in your online setup that could be costing you quality leads.\n\nI help contractors like you fix these issues quickly - things like website credibility, review management, and professional email setup.\n\nWould you be open to a brief, no-fluff overview of how we tackle this for your business? Just the facts, no sales pitch.\n\nManu`,
            status: 'pending'
          },
          {
            email_number: 2,
            subject: 'Re: Your business and online presence',
            send_day: 'Thursday',
            send_time: '7:30 PM',
            body: `Hi,\n\nJust following up on my email from Tuesday. I know you're busy with jobs, but wanted to reiterate that my focus is on practical solutions for contractors.\n\nThe online credibility gaps I mentioned can often be addressed within 2-3 weeks, and the impact on lead quality is usually noticeable right away.\n\nIf you'd like to see a quick 5-minute overview of what this looks like for businesses like yours, I'm happy to share.\n\nBest,\nManu`,
            status: 'pending'
          },
          {
            email_number: 3,
            subject: 'Final follow-up - online presence optimization',
            send_day: 'Monday',
            send_time: '6:30 AM',
            body: `Hi,\n\nThis is my final follow-up about optimizing your online presence.\n\nI understand if this isn't a priority right now, but I wanted to make sure you had the chance to see what we do for contractors.\n\nIf you change your mind, you can always reach out.\n\nBest of luck with your business,\nManu`,
            status: 'pending'
          }
        ],
        messaging_preferences: {
          email_length: 'concise',
          proof_preference: 'case_studies'
        }
      },
      focus_group_generated: true
    };
  }
  
  return {
    database_info: {
      generated_date: new Date().toISOString(),
      total_contractors: 10,
      system_version: 'FOCUS-INTEL V2.0',
      last_updated: new Date().toISOString()
    },
    contractors: mockContractors
  };
}