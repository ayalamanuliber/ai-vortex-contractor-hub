/**
 * COMPLETION CALCULATOR - Dynamic completion scoring system
 * Calculates and updates completion scores based on data quality
 * Supports real-time updates and enhancement tracking
 */

class CompletionCalculator {
  constructor() {
    this.scoreWeights = {
      basic_info: 30,      // Company name, category, email, phone
      location: 15,        // Address, city, state, postal
      online_presence: 20, // Website, Google rating/reviews
      business_intel: 25,  // Business health, sophistication
      enhancement: 10      // Additional data layers
    };
  }

  /**
   * Calculate completion score for a contractor
   */
  calculateScore(contractor) {
    let score = 0;
    let breakdown = {
      basic_info: 0,
      location: 0,
      online_presence: 0,
      business_intel: 0,
      enhancement: 0
    };

    // Basic Info Score (30 points max)
    let basicScore = 0;
    if (contractor.company_name && contractor.company_name !== 'Unknown Company') basicScore += 10;
    if (contractor.category && contractor.category !== 'General') basicScore += 5;
    if (contractor.primary_email && contractor.primary_email.length > 0) basicScore += 10;
    if (contractor.phone && contractor.phone.length > 0) basicScore += 5;
    breakdown.basic_info = Math.min(basicScore, 30);

    // Location Score (15 points max)
    let locationScore = 0;
    if (contractor.address_full && contractor.address_full.length > 0) locationScore += 5;
    if (contractor.city && contractor.city.length > 0) locationScore += 3;
    if (contractor.state_code && contractor.state_code.length > 0) locationScore += 4;
    if (contractor.postal_code && contractor.postal_code.length > 0) locationScore += 3;
    breakdown.location = Math.min(locationScore, 15);

    // Online Presence Score (20 points max)
    let onlineScore = 0;
    if (contractor.website && contractor.website.length > 0) onlineScore += 8;
    if (contractor.google_rating && contractor.google_rating > 0) onlineScore += 7;
    if (contractor.google_reviews_count && contractor.google_reviews_count > 0) onlineScore += 5;
    breakdown.online_presence = Math.min(onlineScore, 20);

    // Business Intelligence Score (25 points max)
    let intelScore = 0;
    if (contractor.business_health && contractor.business_health !== 'UNKNOWN') intelScore += 8;
    if (contractor.sophistication_tier && contractor.sophistication_tier !== 'Unknown') intelScore += 7;
    if (contractor.trust_score && contractor.trust_score > 0) intelScore += 5;
    if (contractor.pricing_psychology && contractor.pricing_psychology !== 'value') intelScore += 5;
    breakdown.business_intel = Math.min(intelScore, 25);

    // Enhancement Score (10 points max)
    let enhancementScore = 0;
    if (contractor.email_quality && contractor.email_quality === 'PROFESSIONAL_DOMAIN') enhancementScore += 3;
    if (contractor.conversion_probability && contractor.conversion_probability === 'high') enhancementScore += 3;
    if (contractor.primary_angle && contractor.primary_angle !== 'general') enhancementScore += 2;
    if (contractor.sophistication_score && contractor.sophistication_score > 50) enhancementScore += 2;
    breakdown.enhancement = Math.min(enhancementScore, 10);

    // Total score
    score = breakdown.basic_info + breakdown.location + breakdown.online_presence + breakdown.business_intel + breakdown.enhancement;

    return {
      total_score: Math.min(score, 100),
      breakdown,
      tier: this.getCompletionTier(score),
      missing_fields: this.identifyMissingFields(contractor),
      improvement_suggestions: this.generateImprovementSuggestions(contractor, breakdown)
    };
  }

  /**
   * Determine completion tier based on score
   */
  getCompletionTier(score) {
    if (score >= 90) return 'PREMIUM';
    if (score >= 80) return 'READY';
    if (score >= 70) return 'GOOD';
    if (score >= 50) return 'NEEDS_WORK';
    return 'POOR';
  }

  /**
   * Identify missing or incomplete fields
   */
  identifyMissingFields(contractor) {
    const missing = [];
    
    // Critical fields
    if (!contractor.company_name || contractor.company_name === 'Unknown Company') {
      missing.push({ field: 'company_name', priority: 'HIGH', impact: 'Critical for identification' });
    }
    if (!contractor.primary_email || contractor.primary_email.length === 0) {
      missing.push({ field: 'primary_email', priority: 'HIGH', impact: 'Required for outreach' });
    }
    
    // Important fields
    if (!contractor.phone || contractor.phone.length === 0) {
      missing.push({ field: 'phone', priority: 'MEDIUM', impact: 'Alternative contact method' });
    }
    if (!contractor.website || contractor.website.length === 0) {
      missing.push({ field: 'website', priority: 'MEDIUM', impact: 'Business credibility and research' });
    }
    if (!contractor.address_full || contractor.address_full.length === 0) {
      missing.push({ field: 'address', priority: 'MEDIUM', impact: 'Local targeting and credibility' });
    }
    
    // Enhancement fields
    if (contractor.google_rating === 0) {
      missing.push({ field: 'google_reviews', priority: 'LOW', impact: 'Business reputation insights' });
    }
    if (contractor.business_health === 'UNKNOWN') {
      missing.push({ field: 'business_intelligence', priority: 'LOW', impact: 'Targeting optimization' });
    }

    return missing;
  }

  /**
   * Generate improvement suggestions
   */
  generateImprovementSuggestions(contractor, breakdown) {
    const suggestions = [];

    // Basic info improvements
    if (breakdown.basic_info < 25) {
      suggestions.push({
        category: 'basic_info',
        suggestion: 'Complete core business information (company name, email, phone)',
        impact: 'HIGH',
        effort: 'LOW'
      });
    }

    // Location improvements
    if (breakdown.location < 12) {
      suggestions.push({
        category: 'location',
        suggestion: 'Add complete address information for local targeting',
        impact: 'MEDIUM',
        effort: 'LOW'
      });
    }

    // Online presence improvements
    if (breakdown.online_presence < 15) {
      if (!contractor.website) {
        suggestions.push({
          category: 'online_presence',
          suggestion: 'Find and verify website URL',
          impact: 'HIGH',
          effort: 'MEDIUM'
        });
      }
      if (contractor.google_rating === 0) {
        suggestions.push({
          category: 'online_presence',
          suggestion: 'Research Google Business Profile and reviews',
          impact: 'MEDIUM',
          effort: 'HIGH'
        });
      }
    }

    // Intelligence improvements
    if (breakdown.business_intel < 20) {
      suggestions.push({
        category: 'business_intel',
        suggestion: 'Enhance business intelligence through research and analysis',
        impact: 'MEDIUM',
        effort: 'HIGH'
      });
    }

    return suggestions;
  }

  /**
   * Update contractor score and track changes
   */
  updateContractorScore(contractor, updates = {}) {
    // Apply updates
    const updatedContractor = { ...contractor, ...updates };
    
    // Recalculate score
    const newScoreData = this.calculateScore(updatedContractor);
    const oldScore = contractor.data_completion_score || 0;
    const scoreChange = newScoreData.total_score - oldScore;

    // Update contractor data
    updatedContractor.data_completion_score = newScoreData.total_score;
    updatedContractor.completion_breakdown = newScoreData.breakdown;
    updatedContractor.completion_tier = newScoreData.tier;
    updatedContractor.missing_fields = newScoreData.missing_fields;
    updatedContractor.improvement_suggestions = newScoreData.improvement_suggestions;
    updatedContractor.updated_at = new Date().toISOString();

    // Track score change
    if (scoreChange !== 0) {
      updatedContractor.score_history = updatedContractor.score_history || [];
      updatedContractor.score_history.push({
        date: new Date().toISOString(),
        old_score: oldScore,
        new_score: newScoreData.total_score,
        change: scoreChange,
        fields_updated: Object.keys(updates)
      });
    }

    return {
      contractor: updatedContractor,
      score_change: scoreChange,
      tier_change: contractor.completion_tier !== newScoreData.tier,
      improvement_impact: this.calculateImprovementImpact(scoreChange, newScoreData.tier)
    };
  }

  /**
   * Calculate improvement impact
   */
  calculateImprovementImpact(scoreChange, newTier) {
    if (scoreChange >= 20) return 'MAJOR';
    if (scoreChange >= 10) return 'SIGNIFICANT';
    if (scoreChange >= 5) return 'MODERATE';
    if (scoreChange > 0) return 'MINOR';
    return 'NONE';
  }

  /**
   * Batch update multiple contractors
   */
  batchUpdateScores(contractors, updates = []) {
    const results = [];
    
    contractors.forEach((contractor, index) => {
      const contractorUpdates = updates[index] || {};
      const result = this.updateContractorScore(contractor, contractorUpdates);
      results.push(result);
    });

    return {
      updated_count: results.length,
      score_changes: results.filter(r => r.score_change !== 0).length,
      tier_changes: results.filter(r => r.tier_change).length,
      average_improvement: results.reduce((sum, r) => sum + r.score_change, 0) / results.length,
      results
    };
  }

  /**
   * Generate completion analytics for dashboard
   */
  generateCompletionAnalytics(contractors) {
    const analytics = {
      total_contractors: contractors.length,
      average_score: 0,
      score_distribution: {
        premium: 0,    // 90-100
        ready: 0,      // 80-89
        good: 0,       // 70-79
        needs_work: 0, // 50-69
        poor: 0        // 0-49
      },
      completion_trends: {
        improving: 0,
        stable: 0,
        declining: 0
      },
      top_missing_fields: {},
      improvement_opportunities: 0
    };

    let totalScore = 0;
    contractors.forEach(contractor => {
      const score = contractor.data_completion_score || 0;
      totalScore += score;

      // Score distribution
      if (score >= 90) analytics.score_distribution.premium++;
      else if (score >= 80) analytics.score_distribution.ready++;
      else if (score >= 70) analytics.score_distribution.good++;
      else if (score >= 50) analytics.score_distribution.needs_work++;
      else analytics.score_distribution.poor++;

      // Track missing fields
      if (contractor.missing_fields) {
        contractor.missing_fields.forEach(field => {
          analytics.top_missing_fields[field.field] = 
            (analytics.top_missing_fields[field.field] || 0) + 1;
        });
      }

      // Improvement opportunities
      if (score < 80) analytics.improvement_opportunities++;
    });

    analytics.average_score = Math.round(totalScore / contractors.length);

    return analytics;
  }
}

module.exports = CompletionCalculator;