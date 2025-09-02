export interface Contractor {
  id: string;
  businessName: string;
  category: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Scores
  completionScore: number;
  healthScore: number;
  trustScore: number;
  googleRating: number;
  reviewsCount: number;
  
  // Intelligence
  intelligence: {
    websiteSpeed: {
      mobile: number;
      desktop: number;
      average: number;
    };
    reviewsRecency: 'ACTIVE' | 'MODERATE' | 'INACTIVE' | 'UNKNOWN';
    daysSinceLatest: number;
    platformDetection: string;
    domainAge: number;
    businessHours: string;
    lastReviewDate?: string;
    websiteBuilder?: string;
    expiringSoon?: number;
  };
  
  // Classifications
  businessHealth: 'HEALTHY' | 'EMERGING' | 'NEEDS_ATTENTION';
  sophisticationTier: 'Professional' | 'Growing' | 'Amateur';
  emailQuality: 'PROFESSIONAL_DOMAIN' | 'PERSONAL_DOMAIN' | 'UNKNOWN';
  
  // Editable fields
  name: string;
  lastName: string;
  nombre?: string;
}

export interface Campaign {
  business_id: string;
  company_name: string;
  trade?: string;
  location?: string;
  processing_status?: string;
  timestamp?: string;
  cost?: number;
  tokens?: number;
  duration_minutes?: number;
  campaign_data?: {
    business_id: string;
    company_name: string;
    contact_timing?: {
      best_day_email_1: string;
      best_day_email_2: string;
      best_day_email_3: string;
      window_a_time: string;
      window_b_time: string;
    };
    email_sequences?: EmailSequence[];
    messaging_preferences?: {
      email_length: string;
      proof_preference: string;
    };
  };
  focus_group_generated?: boolean;
  total_cost?: number;
  total_tokens?: number;
}

export interface EmailSequence {
  email_number: number;
  subject: string;
  send_day: string;
  send_time: string;
  body: string;
  status?: 'pending' | 'scheduled' | 'sent' | 'opened' | 'responded';
  sent_date?: string;
  opened_date?: string;
  responded_date?: string;
}

export interface MergedContractor extends Contractor {
  hasCampaign: boolean;
  hasFocusGroup: boolean;
  campaignData: any | null;
  cost: number;
  sessionDuration: number;
  tokensUsed: number;
  emailSequences: number;
  notes: Note[];
  rawData?: any; // Raw CSV data for detailed intelligence
}

export interface Note {
  id: string;
  date: string;
  type: 'manual' | 'campaign' | 'opportunity' | 'follow-up' | 'system';
  content: string;
}

export interface CampaignsDatabase {
  database_info: {
    generated_date: string;
    total_contractors: number;
    system_version: string;
    last_updated: string;
  };
  contractors: Record<string, Campaign>;
}