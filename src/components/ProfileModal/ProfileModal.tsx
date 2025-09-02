'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, Mail, Phone, Star, Globe, Copy, Send, Play, 
  FileText, TrendingUp, Building, AlertCircle
} from 'lucide-react';
import { useContractorStore } from '@/stores/contractorStore';
import { cn } from '@/lib/utils/cn';

// Add CSS keyframes for animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `;
  document.head.appendChild(style);
}

interface TabContentProps {
  currentProfile: any;
  activeTab: string;
}

// Simple Tooltip Component
const Tooltip = ({ children, text, delay = 0 }: { 
  children: React.ReactNode; 
  text: string; 
  delay?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setTimeout(() => setIsVisible(true), delay)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          padding: '8px 12px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#ffffff',
          fontSize: '12px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          animation: 'fadeInUp 0.2s ease-out'
        }}>
          {text}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(0, 0, 0, 0.9)'
          }} />
        </div>
      )}
    </div>
  );
};

const IntelligenceTab = ({ currentProfile }: TabContentProps) => {
  // Extract reviews from rawData
  const reviews = [];
  if (currentProfile.rawData) {
    for (let i = 1; i <= 5; i++) {
      const rating = currentProfile.rawData[`L1_review_${i}_rating`];
      const text = currentProfile.rawData[`L1_review_${i}_text`];
      const date = currentProfile.rawData[`L1_review_${i}_date`];
      const author = currentProfile.rawData[`L1_review_${i}_author`];
      const relativeTime = currentProfile.rawData[`L1_review_${i}_relative_time`];
      
      if (rating && author) {
        reviews.push({ rating: parseInt(rating), text, date, author, relativeTime });
      }
    }
  }

  const hasWhoisData = currentProfile.rawData?.L1_whois_domain_age_years || 
                       currentProfile.rawData?.L1_whois_days_until_expiry;
  
  const hasPSIData = currentProfile.rawData?.L1_psi_mobile_performance || 
                     currentProfile.rawData?.L1_psi_desktop_performance;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#facc15';
    return '#ef4444';
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px'
    }}>
      {/* Google Reviews Intelligence */}
      <div style={{ 
        background: '#0a0a0b', 
        border: '1px solid rgba(255, 255, 255, 0.06)', 
        borderRadius: '8px',
        overflow: 'hidden',
        animation: 'fadeInUp 0.5s cubic-bezier(0.4, 0.0, 0.2, 1) 0.1s both'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Star size={16} style={{ opacity: 0.5, color: 'rgba(255, 255, 255, 0.5)' }} />
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              GOOGLE REVIEWS INTELLIGENCE
            </span>
          </div>
          <span style={{
            padding: '2px 8px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            color: '#22c55e'
          }}>
            {currentProfile.intelligence?.reviewsRecency === 'ACTIVE' ? 'HEALTHY' : 
             currentProfile.intelligence?.reviewsRecency === 'MODERATE' ? 'MODERATE' : 'INACTIVE'}
          </span>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '68% 30%', 
            gap: '24px' 
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Rating Hero */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: '#facc15',
                    lineHeight: 1
                  }}>
                    {currentProfile.googleRating?.toFixed(1) || '0.0'}
                  </div>
                  <div style={{
                    color: '#facc15',
                    fontSize: '18px',
                    marginTop: '4px'
                  }}>
                    ★★★★★
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '20px',
                  flex: 1
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.3)',
                      textTransform: 'uppercase'
                    }}>
                      Total Reviews
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff'
                    }}>
                      {currentProfile.reviewsCount || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.3)',
                      textTransform: 'uppercase'
                    }}>
                      Review Frequency
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: currentProfile.intelligence?.reviewsRecency === 'ACTIVE' ? '#22c55e' : 
                             currentProfile.intelligence?.reviewsRecency === 'MODERATE' ? '#facc15' : '#ef4444'
                    }}>
                      {currentProfile.intelligence?.reviewsRecency || 'UNKNOWN'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.3)',
                      textTransform: 'uppercase'
                    }}>
                      Days Since Latest
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff'
                    }}>
                      {currentProfile.intelligence?.daysSinceLatest || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Reviews */}
              {reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.slice(0, 3).map((review, index) => (
                    <div key={index} style={{
                      padding: '16px',
                      background: '#050505',
                      borderRadius: '6px',
                      transition: 'transform 0.2s'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#ffffff'
                        }}>
                          {review.author}
                        </span>
                        <span style={{
                          color: '#facc15',
                          fontSize: '12px'
                        }}>
                          {'★'.repeat(review.rating)}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.3)',
                        marginBottom: '8px'
                      }}>
                        {review.relativeTime || review.date}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        lineHeight: '1.5'
                      }}>
                        {review.text || '[No review text]'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.3)' }}>
                  No review details available
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '14px',
                background: '#050505',
                borderRadius: '6px'
              }}>
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '10px'
                }}>
                  Business Hours
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.6'
                }}>
                  {currentProfile.rawData?.L1_weekday_hours ? 
                    currentProfile.rawData.L1_weekday_hours.split(';').map((hours: string, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{hours.split(' ')[0]}</span>
                        <span>{hours.split(' ').slice(1).join(' ')}</span>
                      </div>
                    )) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Mon-Fri</span>
                          <span>8:00 AM - 5:00 PM</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255, 255, 255, 0.3)' }}>
                          <span>Sat-Sun</span>
                          <span>Closed</span>
                        </div>
                      </div>
                    )
                  }
                </div>
              </div>
              
              <div style={{
                padding: '14px',
                background: '#050505',
                borderRadius: '6px'
              }}>
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '10px'
                }}>
                  Business Insights
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.6'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#ffffff' }}>Health:</strong> {currentProfile.rawData?.L1_targeting_business_health || 'HEALTHY'}<br/>
                    <strong style={{ color: '#ffffff' }}>Priority:</strong> {currentProfile.rawData?.L1_targeting_outreach_priority || 'MEDIUM'}<br/>
                    <strong style={{ color: '#ffffff' }}>Approach:</strong> {currentProfile.rawData?.L1_targeting_best_approach || 'GENERAL'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.3)' }}>
                    {currentProfile.googleRating >= 4.5 ? 
                      'High rating with active reviews. Professional mentions in reviews indicate quality service.' :
                      'Review analysis indicates potential areas for improvement.'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WHOIS Domain Intelligence */}
      <div style={{ 
        background: '#0a0a0b', 
        border: '1px solid rgba(255, 255, 255, 0.06)', 
        borderRadius: '8px',
        overflow: 'hidden',
        animation: 'fadeInUp 0.5s cubic-bezier(0.4, 0.0, 0.2, 1) 0.2s both'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={16} style={{ opacity: 0.5, color: 'rgba(255, 255, 255, 0.5)' }} />
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              WHOIS DOMAIN INTELLIGENCE
            </span>
          </div>
          <span style={{
            padding: '2px 8px',
            background: currentProfile.rawData?.L1_whois_domain_age_years && 
                       parseFloat(currentProfile.rawData.L1_whois_domain_age_years) < 2 ? 
                       'rgba(251, 146, 60, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            color: currentProfile.rawData?.L1_whois_domain_age_years && 
                   parseFloat(currentProfile.rawData.L1_whois_domain_age_years) < 2 ? 
                   '#fb923c' : '#22c55e'
          }}>
            {currentProfile.rawData?.L1_whois_domain_age_years && 
             parseFloat(currentProfile.rawData.L1_whois_domain_age_years) < 2 ? 
             'NEW DOMAIN' : 'ESTABLISHED'}
          </span>
        </div>
        <div style={{ padding: '20px' }}>
          {hasWhoisData ? (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: '#050505',
                  borderRadius: '8px',
                  padding: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: '#22c55e'
                  }} />
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    marginBottom: '4px',
                    color: '#a855f7'
                  }}>
                    {currentProfile.rawData?.L1_whois_domain_age_years ? 
                      Math.floor(parseFloat(currentProfile.rawData.L1_whois_domain_age_years)) : '—'
                    } yrs
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase'
                  }}>
                    Domain Age
                  </div>
                </div>
                
                <div style={{
                  background: '#050505',
                  borderRadius: '8px',
                  padding: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: currentProfile.rawData?.L1_whois_days_until_expiry && 
                               parseInt(currentProfile.rawData.L1_whois_days_until_expiry) < 90 ? '#fb923c' : '#22c55e'
                  }} />
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    marginBottom: '4px',
                    color: currentProfile.rawData?.L1_whois_days_until_expiry && 
                           parseInt(currentProfile.rawData.L1_whois_days_until_expiry) < 90 ? '#fb923c' : '#22c55e'
                  }}>
                    {currentProfile.rawData?.L1_whois_days_until_expiry || 140}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase'
                  }}>
                    Days Until Expiry
                  </div>
                </div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Domain</div>
                  <div style={{
                    fontSize: '13px',
                    color: '#ffffff',
                    fontWeight: '500'
                  }}>
                    {currentProfile.rawData?.L2_normalized_domain || currentProfile.website?.replace('https://', '').replace('http://', '')}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Registrar</div>
                  <div style={{
                    fontSize: '13px',
                    color: '#ffffff',
                    fontWeight: '500'
                  }}>
                    GoDaddy.com, LLC
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Created</div>
                  <div style={{
                    fontSize: '13px',
                    color: '#ffffff',
                    fontWeight: '500'
                  }}>
                    {currentProfile.rawData?.L1_whois_domain_age_years ? 
                      `${new Date().getFullYear() - Math.floor(parseFloat(currentProfile.rawData.L1_whois_domain_age_years))}` : 
                      'May 3, 2024'
                    }
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Expires</div>
                  <div style={{
                    fontSize: '13px',
                    color: currentProfile.rawData?.L1_whois_days_until_expiry && 
                           parseInt(currentProfile.rawData.L1_whois_days_until_expiry) < 90 ? '#fb923c' : '#22c55e',
                    fontWeight: '500'
                  }}>
                    {currentProfile.rawData?.L1_whois_days_until_expiry ? 
                      new Date(Date.now() + parseInt(currentProfile.rawData.L1_whois_days_until_expiry) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 
                      'May 3, 2027'
                    }
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Recently Registered</div>
                  <div style={{
                    fontSize: '13px',
                    color: currentProfile.rawData?.L1_whois_domain_age_years && 
                           parseFloat(currentProfile.rawData.L1_whois_domain_age_years) < 2 ? '#fb923c' : '#ffffff',
                    fontWeight: '500'
                  }}>
                    {currentProfile.rawData?.L1_whois_domain_age_years && 
                     parseFloat(currentProfile.rawData.L1_whois_domain_age_years) < 2 ? 'Yes' : 'No'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Status</div>
                  <div style={{
                    fontSize: '13px',
                    color: '#22c55e',
                    fontWeight: '500'
                  }}>
                    Active
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <AlertCircle size={48} style={{ color: 'rgba(255, 255, 255, 0.3)', marginBottom: '12px' }} />
              <div style={{ color: 'rgba(255, 255, 255, 0.3)' }}>WHOIS data not available</div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.2)', marginTop: '4px' }}>
                Domain information could not be retrieved
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PSI Performance Intelligence */}
      <div style={{ 
        background: '#0a0a0b', 
        border: '1px solid rgba(255, 255, 255, 0.06)', 
        borderRadius: '8px',
        overflow: 'hidden',
        animation: 'fadeInUp 0.5s cubic-bezier(0.4, 0.0, 0.2, 1) 0.3s both'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={16} style={{ opacity: 0.5, color: 'rgba(255, 255, 255, 0.5)' }} />
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              PSI PERFORMANCE INTELLIGENCE
            </span>
          </div>
          {hasPSIData && (
            <span style={{
              padding: '2px 8px',
              background: (parseInt(currentProfile.rawData?.L1_psi_mobile_performance) || 0) < 70 ? 
                         'rgba(251, 146, 60, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: '600',
              color: (parseInt(currentProfile.rawData?.L1_psi_mobile_performance) || 0) < 70 ? 
                     '#fb923c' : '#22c55e'
            }}>
              {(parseInt(currentProfile.rawData?.L1_psi_mobile_performance) || 0) < 70 ? 
               'NEEDS MOBILE FIX' : 'EXCELLENT'}
            </span>
          )}
        </div>
        <div style={{ padding: '20px' }}>
          {hasPSIData ? (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px'
              }}>
                <div style={{
                  background: '#050505',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '42px',
                    fontWeight: '700',
                    lineHeight: 1,
                    marginBottom: '8px',
                    color: getScoreColor(parseInt(currentProfile.rawData?.L1_psi_mobile_performance) || 0)
                  }}>
                    {currentProfile.rawData?.L1_psi_mobile_performance || '—'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '12px'
                  }}>
                    Mobile Performance
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>69</span>
                      <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase' }}>Access</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>86</span>
                      <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase' }}>Best</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>83</span>
                      <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase' }}>SEO</span>
                    </div>
                  </div>
                </div>
                <div style={{
                  background: '#050505',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '42px',
                    fontWeight: '700',
                    lineHeight: 1,
                    marginBottom: '8px',
                    color: getScoreColor(parseInt(currentProfile.rawData?.L1_psi_desktop_performance) || 0)
                  }}>
                    {currentProfile.rawData?.L1_psi_desktop_performance || '—'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '12px'
                  }}>
                    Desktop Performance
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>69</span>
                      <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase' }}>Access</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>89</span>
                      <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase' }}>Best</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>83</span>
                      <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase' }}>SEO</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '20px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Average Performance</div>
                    <div style={{
                      fontSize: '13px',
                      color: '#22c55e',
                      fontWeight: '500'
                    }}>
                      {currentProfile.rawData?.L1_psi_avg_performance || '—'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>FID Mobile</div>
                    <div style={{
                      fontSize: '13px',
                      color: '#ffffff',
                      fontWeight: '500'
                    }}>
                      149ms
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>FID Desktop</div>
                    <div style={{
                      fontSize: '13px',
                      color: '#ffffff',
                      fontWeight: '500'
                    }}>
                      212ms
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <TrendingUp size={48} style={{ color: 'rgba(255, 255, 255, 0.3)', marginBottom: '12px' }} />
              <div style={{ color: 'rgba(255, 255, 255, 0.3)' }}>PSI data not available</div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.2)', marginTop: '4px' }}>
                Performance metrics could not be measured
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Builder Intelligence */}
      <div style={{ 
        background: '#0a0a0b', 
        border: '1px solid rgba(255, 255, 255, 0.06)', 
        borderRadius: '8px',
        overflow: 'hidden',
        animation: 'fadeInUp 0.5s cubic-bezier(0.4, 0.0, 0.2, 1) 0.4s both'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building size={16} style={{ opacity: 0.5, color: 'rgba(255, 255, 255, 0.5)' }} />
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              BUILDER & OPPORTUNITY INTELLIGENCE
            </span>
          </div>
          <span style={{
            padding: '2px 8px',
            background: currentProfile.emailQuality === 'PERSONAL_DOMAIN' ? 
                       'rgba(251, 146, 60, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            color: currentProfile.emailQuality === 'PERSONAL_DOMAIN' ? '#fb923c' : '#22c55e'
          }}>
            {currentProfile.emailQuality === 'PERSONAL_DOMAIN' ? 'GMAIL ISSUE' : 'HOSTING ONLY'}
          </span>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Platform Detected</div>
              <div style={{
                fontSize: '13px',
                color: '#ffffff',
                fontWeight: '500'
              }}>
                {currentProfile.rawData?.L1_builder_platform || 'Nginx'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Category</div>
              <div style={{
                fontSize: '13px',
                color: '#ffffff',
                fontWeight: '500'
              }}>
                {currentProfile.rawData?.L1_builder_category || 'HOSTING'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Email Type</div>
              <div style={{
                fontSize: '13px',
                color: currentProfile.emailQuality === 'PERSONAL_DOMAIN' ? '#fb923c' : '#22c55e',
                fontWeight: '500'
              }}>
                {currentProfile.emailQuality === 'PERSONAL_DOMAIN' ? 'Personal Gmail' : 
                 currentProfile.emailQuality === 'PROFESSIONAL_DOMAIN' ? 'Professional Domain' : 'Personal Gmail'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Sophistication Score</div>
              <div style={{
                fontSize: '13px',
                color: '#ffffff',
                fontWeight: '500'
              }}>
                {currentProfile.completionScore} - {currentProfile.sophisticationTier?.toUpperCase() || 'GROWING'}
              </div>
            </div>
          </div>

          {/* Primary Opportunity Identified */}
          <div style={{
            borderLeft: '3px solid #fb923c',
            paddingLeft: '16px',
            background: 'rgba(251, 146, 60, 0.05)',
            borderRadius: '0 4px 4px 0',
            padding: '16px 16px 16px 19px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <div style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px'
              }}>
                Primary Opportunity Identified
              </div>
              <div style={{
                fontSize: '12px',
                color: '#22c55e',
                fontWeight: '600'
              }}>
                {currentProfile.emailQuality === 'PERSONAL_DOMAIN' ? '$800 - $2,500' : '$1,500 - $3,000'}
              </div>
            </div>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px'
            }}>
              {currentProfile.emailQuality === 'PERSONAL_DOMAIN' ? 'Email Professionalization' : 'Website Performance Optimization'}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.5'
            }}>
              {currentProfile.emailQuality === 'PERSONAL_DOMAIN' ? 
                'Gmail address creates credibility gap for $50K+ roofing projects. Professional domain email would improve trust with commercial clients and insurance companies.' :
                `${currentProfile.rawData?.L1_psi_mobile_performance ? 'Mobile' : 'Website'} performance could be optimized for better user experience and search rankings.`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampaignTab = ({ currentProfile }: TabContentProps) => {
  const [emailStatuses, setEmailStatuses] = useState<{[key: number]: string}>({});
  
  if (!currentProfile.hasCampaign || !currentProfile.campaignData?.campaign_data?.email_sequences) {
    return (
      <div style={{ 
        background: '#0a0a0b', 
        border: '1px solid rgba(255, 255, 255, 0.06)', 
        borderRadius: '8px'
      }}>
        <div style={{ padding: '20px' }}>
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.3)', fontSize: '12px' }}>
            <FileText size={48} style={{ color: 'rgba(255, 255, 255, 0.3)', marginBottom: '12px' }} />
            <div>No campaign sequence configured</div>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>Generate a campaign to see email sequences here</div>
          </div>
        </div>
      </div>
    );
  }

  const emailSequences = currentProfile.campaignData.campaign_data.email_sequences || [];

  const updateEmailStatus = (emailIndex: number, status: string) => {
    setEmailStatuses(prev => ({ ...prev, [emailIndex]: status }));
  };

  const copyToClipboard = async (text: string, buttonElement: HTMLElement) => {
    try {
      await navigator.clipboard.writeText(text);
      const originalContent = buttonElement.innerHTML;
      buttonElement.innerHTML = '✓ Copied!';
      buttonElement.style.color = '#22c55e';
      setTimeout(() => {
        buttonElement.innerHTML = originalContent;
        buttonElement.style.color = '';
      }, 1000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div style={{ 
      background: '#0a0a0b', 
      border: '1px solid rgba(255, 255, 255, 0.06)', 
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Send size={16} style={{ opacity: 0.5, color: '#22c55e' }} />
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            EMAIL CAMPAIGN SEQUENCE
          </span>
        </div>
        <span style={{
          padding: '2px 8px',
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: '600',
          color: '#22c55e'
        }}>
          READY
        </span>
      </div>
      <div style={{ padding: '20px' }}>
        {/* Campaign Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Campaign Type</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                Review Acceleration
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Email Length</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                {currentProfile.campaignData.campaign_data.messaging_preferences?.email_length || 'Type A - Concise'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Proof Style</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                {currentProfile.campaignData.campaign_data.messaging_preferences?.proof_preference || 'Data/Case Studies'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Total Emails</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                {emailSequences.length}
              </span>
            </div>
          </div>
          <button style={{
            padding: '8px 16px',
            background: '#3b82f6',
            border: '1px solid #3b82f6',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Play size={14} />
            Start Campaign
          </button>
        </div>

        {/* Timeline Visual */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '32px'
        }}>
          {emailSequences.map((_: any, index: number) => (
            <React.Fragment key={index}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: index < emailSequences.length - 1 ? 1 : 'none'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: emailStatuses[index] ? '#3b82f6' : '#0a0a0b',
                  border: `2px solid ${emailStatuses[index] ? '#3b82f6' : 'rgba(255, 255, 255, 0.06)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: emailStatuses[index] ? 'white' : 'rgba(255, 255, 255, 0.5)'
                }}>
                  {index + 1}
                </div>
                {index < emailSequences.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    background: emailStatuses[index] ? '#3b82f6' : 'rgba(255, 255, 255, 0.06)'
                  }} />
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Email Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {emailSequences.map((email: any, index: number) => (
            <div key={index} style={{
              background: '#0a0a0b',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '8px',
              padding: '20px',
              transition: 'all 0.2s'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#050505',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>
                    {email.email_number || index + 1}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#ffffff'
                    }}>
                      {email.send_day || 'Tuesday'}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.5)'
                    }}>
                      {email.send_time || '6:30 AM'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Scheduled', 'Sent', 'Opened', 'Replied'].map((status, statusIndex) => (
                    <button
                      key={statusIndex}
                      onClick={() => updateEmailStatus(index, status)}
                      style={{
                        padding: '4px 10px',
                        background: emailStatuses[index] === status ? 
                          (status === 'Sent' ? '#facc15' : 
                           status === 'Opened' ? '#22c55e' : 
                           status === 'Replied' ? '#a855f7' : '#3b82f6') : '#050505',
                        border: `1px solid ${emailStatuses[index] === status ? 
                          (status === 'Sent' ? '#facc15' : 
                           status === 'Opened' ? '#22c55e' : 
                           status === 'Replied' ? '#a855f7' : '#3b82f6') : 'rgba(255, 255, 255, 0.06)'}`,
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: emailStatuses[index] === status ? 
                          (status === 'Sent' ? 'black' : 'white') : 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <Mail size={14} style={{ opacity: 0.5 }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff',
                  flex: 1
                }}>
                  {email.subject || 'Subject pending'}
                </span>
              </div>
              
              <div style={{
                background: '#050505',
                borderRadius: '6px',
                padding: '16px',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6',
                marginBottom: '12px'
              }}>
                {email.body || 'Email content pending...'}
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={(e) => copyToClipboard(email.subject || '', e.currentTarget)}
                  style={{
                    padding: '6px 12px',
                    background: '#0a0a0b',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Copy size={12} />
                  Copy Subject
                </button>
                <button
                  onClick={(e) => copyToClipboard(email.body || '', e.currentTarget)}
                  style={{
                    padding: '6px 12px',
                    background: '#0a0a0b',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Copy size={12} />
                  Copy Body
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NotesTab = ({ currentProfile }: TabContentProps) => {
  return (
    <div style={{ 
      background: '#0a0a0b', 
      border: '1px solid rgba(255, 255, 255, 0.06)', 
      borderRadius: '8px'
    }}>
      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.3)', fontSize: '12px' }}>
          <FileText size={48} style={{ color: 'rgba(255, 255, 255, 0.3)', marginBottom: '12px' }} />
          <div>No notes recorded</div>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>Add notes about interactions with this contractor</div>
        </div>
      </div>
    </div>
  );
};

export function ProfileModal() {
  const { currentProfile, setCurrentProfile } = useContractorStore();
  const [activeTab, setActiveTab] = useState('intelligence');
  const [isExporting, setIsExporting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const closeModal = React.useCallback(() => {
    setIsVisible(false);
    // Delay the actual close to allow exit animation
    setTimeout(() => {
      setCurrentProfile(null);
    }, 200);
  }, [setCurrentProfile]);

  // Block body scroll when modal is open and handle entrance animation
  React.useEffect(() => {
    if (currentProfile) {
      document.body.style.overflow = 'hidden';
      // Trigger entrance animation after a tiny delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      
      // Add keyboard event listener for ESC key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.body.style.overflow = 'unset';
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [currentProfile, closeModal]);

  if (!currentProfile) return null;

  const exportScreenshot = async () => {
    setIsExporting(true);
    try {
      // Use html2canvas to capture the entire modal
      const { default: html2canvas } = await import('html2canvas');
      const modalElement = document.querySelector('[data-modal-content]') as HTMLElement;
      
      if (modalElement) {
        const canvas = await html2canvas(modalElement, {
          backgroundColor: '#050505',
          scale: 2, // Higher quality
          useCORS: true,
          allowTaint: true,
          scrollX: 0,
          scrollY: 0
        });
        
        // Create download link
        const link = document.createElement('a');
        link.download = `${currentProfile.businessName.replace(/[^a-zA-Z0-9]/g, '_')}_intelligence_report.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#facc15';
    return '#ef4444';
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      background: isVisible ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0)',
      backdropFilter: isVisible ? 'blur(4px)' : 'blur(0px)',
      overflow: 'hidden',
      transition: 'background-color 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), backdrop-filter 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'
    }}>
      <div style={{
        height: '100%',
        overflowY: 'auto',
        fontFamily: '-apple-system, "Inter", system-ui, sans-serif',
        transform: isVisible ? 'translateY(0%) scale(1)' : 'translateY(4%) scale(0.95)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)'
      }}>
        <div data-modal-content style={{ minHeight: '100%' }}>
          {/* Header */}
          <div style={{
            background: '#0a0a0b',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <Tooltip text="Press ESC or click to close" delay={500}>
                <button 
                  onClick={closeModal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    padding: '6px 8px',
                    borderRadius: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateX(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.transform = 'translateX(0px)';
                  }}
                >
                  <ArrowLeft size={16} />
                  Back to List
                </button>
              </Tooltip>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Tooltip text={isExporting ? "Processing screenshot..." : "Export full intelligence report as image"}>
                  <button 
                    onClick={exportScreenshot}
                    disabled={isExporting}
                    style={{
                      padding: '8px 16px',
                      background: '#0a0a0b',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                      color: isExporting ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.7)',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: isExporting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isExporting) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isExporting) {
                        e.currentTarget.style.background = '#0a0a0b';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      transform: isExporting ? 'scale(0.98)' : 'scale(1)',
                      transition: 'transform 0.2s ease'
                    }}>
                      {isExporting ? (
                        <>
                          <span style={{ 
                            animation: 'spin 1s linear infinite',
                            display: 'inline-block'
                          }}>⚡</span>
                          Processing...
                        </>
                      ) : (
                        <>
                          📸 Export
                        </>
                      )}
                    </span>
                  </button>
                </Tooltip>
                <button style={{
                  padding: '8px 16px',
                  background: '#0a0a0b',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  Edit
                </button>
                <button style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  border: '1px solid #3b82f6',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  Generate Campaign
                </button>
              </div>
            </div>

            {/* Header Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: '32px',
              alignItems: 'flex-start'
            }}>
              {/* Score Visual */}
              <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                <svg style={{ width: '80px', height: '80px', transform: 'rotate(-90deg)' }} viewBox="0 0 80 80">
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="36" 
                    stroke="rgba(255,255,255,0.06)" 
                    strokeWidth="4" 
                    fill="none"
                  />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="36" 
                    stroke={getScoreColor(currentProfile.completionScore)}
                    strokeWidth="4" 
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="226.19"
                    strokeDashoffset={226.19 - (226.19 * currentProfile.completionScore) / 100}
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: getScoreColor(currentProfile.completionScore)
                }}>
                  {currentProfile.completionScore}%
                </div>
              </div>
              
              {/* Company Info */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '16px',
                  marginBottom: '8px'
                }}>
                  <h1 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#ffffff',
                    margin: 0
                  }}>
                    {currentProfile.businessName}
                  </h1>
                  <span style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.3)'
                  }}>
                    #{currentProfile.id}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    padding: '3px 8px',
                    background: '#050505',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>
                    {currentProfile.category?.toUpperCase() || 'GENERAL CONSTRUCTION'}
                  </span>
                  <span>•</span>
                  <span>{currentProfile.city}, {currentProfile.state} {currentProfile.zipCode}</span>
                  <span>•</span>
                  <span style={{
                    padding: '3px 8px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#22c55e',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {currentProfile.rawData?.L1_whois_days_until_expiry || '140'} DAYS
                  </span>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.3)',
                  marginBottom: '16px'
                }}>
                  Contact: {currentProfile.name ? `${currentProfile.name} ${currentProfile.lastName}` : 'Owner'}
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '20px',
                  fontSize: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    const copyIcon = e.currentTarget.querySelector('[data-copy-email]') as HTMLElement;
                    if (copyIcon) copyIcon.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    const copyIcon = e.currentTarget.querySelector('[data-copy-email]') as HTMLElement;
                    if (copyIcon) copyIcon.style.opacity = '0';
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(currentProfile.email);
                    // Add visual feedback
                    const element = document.activeElement as HTMLElement;
                    if (element) {
                      const originalText = element.textContent;
                      element.textContent = '✓ Email Copied!';
                      setTimeout(() => {
                        element.textContent = originalText;
                      }, 1500);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Copy email ${currentProfile.email}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.currentTarget.click();
                    }
                  }}
                  >
                    <Mail size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    <span>{currentProfile.email}</span>
                    <Copy 
                      data-copy-email
                      size={14} 
                      style={{ 
                        color: 'rgba(255, 255, 255, 0.5)', 
                        cursor: 'pointer',
                        opacity: 0,
                        transition: 'opacity 0.2s ease'
                      }}
                    />
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    const copyIcon = e.currentTarget.querySelector('[data-copy-phone]') as HTMLElement;
                    if (copyIcon) copyIcon.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    const copyIcon = e.currentTarget.querySelector('[data-copy-phone]') as HTMLElement;
                    if (copyIcon) copyIcon.style.opacity = '0';
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(currentProfile.phone);
                    // Add visual feedback
                    const element = document.activeElement as HTMLElement;
                    if (element) {
                      const originalText = element.textContent;
                      element.textContent = '✓ Phone Copied!';
                      setTimeout(() => {
                        element.textContent = originalText;
                      }, 1500);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Copy phone ${currentProfile.phone}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.currentTarget.click();
                    }
                  }}
                  >
                    <Phone size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    <span>{currentProfile.phone}</span>
                    <Copy 
                      data-copy-phone
                      size={14} 
                      style={{ 
                        color: 'rgba(255, 255, 255, 0.5)', 
                        cursor: 'pointer',
                        opacity: 0,
                        transition: 'opacity 0.2s ease'
                      }}
                    />
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Globe size={14} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                    <a 
                      href={currentProfile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        textDecoration: 'none'
                      }}
                    >
                      {currentProfile.rawData?.L2_normalized_domain || currentProfile.website?.replace('https://', '').replace('http://', '')}
                    </a>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Star size={14} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                    <a 
                      href={`https://maps.google.com/?cid=${currentProfile.rawData?.L1_google_place_id || ''}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        textDecoration: 'none'
                      }}
                    >
                      {currentProfile.googleRating?.toFixed(1) || '0.0'} • {currentProfile.reviewsCount || 0} Reviews
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Stats Visual */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                minWidth: '280px'
              }}>
                <Tooltip text="PageSpeed Insights mobile performance score - higher is better for SEO and user experience">
                  <div style={{
                    background: '#050505',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    position: 'relative',
                    border: `1px solid ${getScoreColor(parseInt(currentProfile.rawData?.L1_psi_mobile_performance) || 0)}20`,
                    transition: 'all 0.3s ease',
                    cursor: 'help'
                  }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: getScoreColor(parseInt(currentProfile.rawData?.L1_psi_mobile_performance) || 0),
                    margin: '8px'
                  }} />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      PSI Mobile
                    </span>
                    <span style={{
                      fontSize: '9px',
                      color: getScoreColor(parseInt(currentProfile.rawData?.L1_psi_mobile_performance) || 0),
                      fontWeight: '600'
                    }}>
                      {(parseInt(currentProfile.rawData?.L1_psi_mobile_performance) || 0) >= 80 ? '↗' : 
                       (parseInt(currentProfile.rawData?.L1_psi_mobile_performance) || 0) >= 60 ? '→' : '↘'}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: getScoreColor(parseInt(currentProfile.rawData?.L1_psi_mobile_performance) || 0)
                  }}>
                    {currentProfile.rawData?.L1_psi_mobile_performance || '—'}
                  </div>
                  <div style={{
                    width: '100%',
                    height: '3px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '2px',
                      width: `${currentProfile.rawData?.L1_psi_mobile_performance || 0}%`,
                      background: `linear-gradient(90deg, ${getScoreColor(parseInt(currentProfile.rawData?.L1_psi_mobile_performance) || 0)}, ${getScoreColor(parseInt(currentProfile.rawData?.L1_psi_mobile_performance) || 0)}80)`,
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: `0 0 8px ${getScoreColor(parseInt(currentProfile.rawData?.L1_psi_mobile_performance) || 0)}30`
                    }} />
                  </div>
                </div>
                </Tooltip>

                <Tooltip text="PageSpeed Insights desktop performance score - shows how fast the site loads on computers">
                  <div style={{
                    background: '#050505',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    position: 'relative',
                    border: `1px solid ${getScoreColor(parseInt(currentProfile.rawData?.L1_psi_desktop_performance) || 0)}20`,
                    transition: 'all 0.3s ease',
                    cursor: 'help'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: getScoreColor(parseInt(currentProfile.rawData?.L1_psi_desktop_performance) || 0),
                    margin: '8px'
                  }} />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      PSI Desktop
                    </span>
                    <span style={{
                      fontSize: '9px',
                      color: getScoreColor(parseInt(currentProfile.rawData?.L1_psi_desktop_performance) || 0),
                      fontWeight: '600'
                    }}>
                      {(parseInt(currentProfile.rawData?.L1_psi_desktop_performance) || 0) >= 80 ? '↗' : 
                       (parseInt(currentProfile.rawData?.L1_psi_desktop_performance) || 0) >= 60 ? '→' : '↘'}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: getScoreColor(parseInt(currentProfile.rawData?.L1_psi_desktop_performance) || 0)
                  }}>
                    {currentProfile.rawData?.L1_psi_desktop_performance || '—'}
                  </div>
                  <div style={{
                    width: '100%',
                    height: '3px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '2px',
                      width: `${currentProfile.rawData?.L1_psi_desktop_performance || 0}%`,
                      background: `linear-gradient(90deg, ${getScoreColor(parseInt(currentProfile.rawData?.L1_psi_desktop_performance) || 0)}, ${getScoreColor(parseInt(currentProfile.rawData?.L1_psi_desktop_performance) || 0)}80)`,
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: `0 0 8px ${getScoreColor(parseInt(currentProfile.rawData?.L1_psi_desktop_performance) || 0)}30`
                    }} />
                  </div>
                </div>
                </Tooltip>

                <Tooltip text="Domain age in years - older domains typically rank better and appear more trustworthy">
                  <div style={{
                    background: '#050505',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    position: 'relative',
                    border: '1px solid #22c55e20',
                    transition: 'all 0.3s ease',
                    cursor: 'help'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    margin: '8px'
                  }} />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Domain Age
                    </span>
                    <span style={{
                      fontSize: '9px',
                      color: '#22c55e',
                      fontWeight: '600'
                    }}>
                      ↗
                    </span>
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#22c55e'
                  }}>
                    {currentProfile.rawData?.L1_whois_domain_age_years ? 
                      Math.floor(parseFloat(currentProfile.rawData.L1_whois_domain_age_years)) : '—'
                    }
                  </div>
                  <div style={{
                    width: '100%',
                    height: '3px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #22c55e, #22c55e80)',
                      borderRadius: '2px',
                      width: currentProfile.rawData?.L1_whois_domain_age_years ? 
                        `${Math.min(parseFloat(currentProfile.rawData.L1_whois_domain_age_years) * 5, 100)}%` : '0%',
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 0 8px #22c55e30'
                    }} />
                  </div>
                </div>
                </Tooltip>

                <Tooltip text="Trust score based on business profile completeness, reviews quality, and online presence">
                  <div style={{
                    background: '#050505',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    position: 'relative',
                    border: '1px solid #22c55e20',
                    transition: 'all 0.3s ease',
                    cursor: 'help'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    margin: '8px'
                  }} />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Trust Score
                    </span>
                    <span style={{
                      fontSize: '9px',
                      color: '#22c55e',
                      fontWeight: '600'
                    }}>
                      ↗
                    </span>
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#22c55e'
                  }}>
                    {currentProfile.trustScore || 85}%
                  </div>
                  <div style={{
                    width: '100%',
                    height: '3px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '2px',
                      width: `${currentProfile.trustScore || 85}%`,
                      background: 'linear-gradient(90deg, #22c55e, #22c55e80)',
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 0 8px #22c55e30'
                    }} />
                  </div>
                </div>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            background: '#0a0a0b',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <div style={{ display: 'flex' }}>
              {[
                { id: 'intelligence', label: 'Intelligence' },
                { id: 'campaign', label: 'Campaign' },
                { id: 'notes', label: 'Notes' }
              ].map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '14px 20px',
                    color: activeTab === tab.id ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                    fontSize: '11px',
                    fontWeight: '600',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    borderBottom: `2px solid ${activeTab === tab.id ? '#3b82f6' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                      e.currentTarget.style.borderBottomColor = 'rgba(59, 130, 246, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                      e.currentTarget.style.borderBottomColor = 'transparent';
                    }
                  }}
                >
                  {tab.label}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            {activeTab === 'intelligence' && <IntelligenceTab currentProfile={currentProfile} activeTab={activeTab} />}
            {activeTab === 'campaign' && <CampaignTab currentProfile={currentProfile} activeTab={activeTab} />}
            {activeTab === 'notes' && <NotesTab currentProfile={currentProfile} activeTab={activeTab} />}
          </div>
        </div>
      </div>
    </div>
  );
}