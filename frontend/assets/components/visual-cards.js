/**
 * VISUAL CARDS COMPONENT - Status-aware contractor cards with completion visualization
 */
class VisualCardsComponent {
    constructor(operationsManager) {
        this.ops = operationsManager;
    }

    render(contractors, container) {
        container.innerHTML = contractors.map(contractor => this.renderCard(contractor)).join('');
        this.setupCardInteractions();
    }

    renderCard(contractor) {
        const statusClass = this.getStatusClass(contractor);
        const statusText = this.getStatusText(contractor);
        const completionTier = this.getCompletionTier(contractor.data_completion_score);
        const completionColor = this.getCompletionColor(contractor.data_completion_score);

        return `
            <div class="contractor-card ${statusClass}" data-id="${contractor.business_id}">
                <div class="card-header-section">
                    <div class="card-company-info">
                        <h3 class="company-name" title="${contractor.company_name}">${contractor.company_name}</h3>
                        <div class="company-category">${contractor.category}</div>
                    </div>
                    <div class="card-status ${statusClass}">${statusText}</div>
                </div>
                
                <div class="completion-section">
                    <div class="completion-circle" style="background: conic-gradient(${completionColor} ${contractor.data_completion_score * 3.6}deg, var(--glass-border) 0deg)">
                        <div class="completion-score">${contractor.data_completion_score}%</div>
                    </div>
                    <div class="completion-details">
                        <div class="completion-tier ${completionTier.toLowerCase().replace('_', '-')}">${completionTier}</div>
                        <div class="location-info">
                            <span><i data-lucide="map-pin" class="icon-sm"></i></span>
                            <span>${contractor.city || 'Unknown'}, ${contractor.state_code || 'US'}</span>
                        </div>
                        ${contractor.google_rating > 0 ? `
                        <div class="rating-info">
                            <span><i data-lucide="star" class="icon-sm"></i></span>
                            <span>${contractor.google_rating} (${contractor.google_reviews_count} reviews)</span>
                        </div>` : ''}
                    </div>
                </div>
                
                ${contractor.has_campaign ? this.renderCampaignSection(contractor) : this.renderEnhancementSection(contractor)}
                
                <div class="card-actions">
                    ${this.renderCardActions(contractor)}
                </div>
            </div>
        `;
    }

    getStatusClass(contractor) {
        if (contractor.has_campaign) {
            return contractor.campaign_status === 'SENT' ? 'in-progress' : 'has-campaign';
        }
        return 'no-campaign';
    }

    getStatusText(contractor) {
        if (contractor.has_campaign) {
            switch (contractor.campaign_status) {
                case 'READY': return '<i data-lucide="check-circle" class="icon-sm"></i> CAMPAIGN READY';
                case 'SENT': return '<i data-lucide="refresh-cw" class="icon-sm"></i> IN PROGRESS';
                case 'COMPLETE': return '<i data-lucide="check-circle" class="icon-sm"></i> COMPLETE';
                default: return '<i data-lucide="check-circle" class="icon-sm"></i> HAS CAMPAIGN';
            }
        }
        return '<i data-lucide="x-circle" class="icon-sm"></i> NO CAMPAIGN';
    }

    getCompletionTier(score) {
        if (score >= 90) return 'PREMIUM';
        if (score >= 80) return 'READY';
        if (score >= 70) return 'GOOD';
        if (score >= 50) return 'NEEDS_WORK';
        return 'POOR';
    }

    getCompletionColor(score) {
        if (score >= 90) return 'var(--score-premium)';
        if (score >= 80) return 'var(--score-ready)';
        if (score >= 70) return 'var(--score-good)';
        if (score >= 50) return 'var(--score-needs-work)';
        return 'var(--score-poor)';
    }

    renderCampaignSection(contractor) {
        if (!contractor.campaign_data && contractor.emails_sent === 0) {
            return `
                <div class="campaign-section">
                    <div class="campaign-title"><i data-lucide="mail" class="icon-sm"></i> Campaign Ready</div>
                    <div class="campaign-preview">Campaign generated and ready to execute</div>
                </div>
            `;
        }

        const emailsCount = contractor.emails_sent || 0;
        
        return `
            <div class="campaign-section">
                <div class="campaign-title"><i data-lucide="mail" class="icon-sm"></i> Email Sequence Progress</div>
                <div class="email-sequences">
                    ${this.renderEmailSequence(1, emailsCount >= 1)}
                    ${this.renderEmailSequence(2, emailsCount >= 2)}
                    ${this.renderEmailSequence(3, emailsCount >= 3)}
                </div>
                ${contractor.next_followup_date ? `
                <div class="next-action">
                    <span><i data-lucide="clock" class="icon-sm"></i> Next: ${new Date(contractor.next_followup_date).toLocaleDateString()}</span>
                </div>` : ''}
            </div>
        `;
    }

    renderEmailSequence(sequenceNumber, isSent) {
        const sequenceNames = {
            1: 'Initial outreach',
            2: 'Follow-up',
            3: 'Final outreach'
        };

        return `
            <div class="email-sequence ${isSent ? 'sent' : 'pending'}">
                <div class="sequence-status ${isSent ? 'ready' : 'pending'}">
                    ${isSent ? '<i data-lucide="check-circle" class="icon-sm"></i>' : sequenceNumber}
                </div>
                <div class="sequence-text">${sequenceNames[sequenceNumber]}</div>
                ${isSent ? '<div class="sequence-date">Sent</div>' : ''}
            </div>
        `;
    }

    renderEnhancementSection(contractor) {
        const needs = this.identifyEnhancementNeeds(contractor);
        
        return `
            <div class="enhancement-section">
                <div class="campaign-title"><i data-lucide="target" class="icon-sm"></i> Enhancement Opportunities</div>
                <div class="enhancement-needs">
                    ${needs.map(need => `<span class="enhancement-tag">${need}</span>`).join('')}
                </div>
                <div class="enhancement-impact">
                    <span>Potential score increase: +${this.calculatePotentialIncrease(contractor)}%</span>
                </div>
            </div>
        `;
    }

    identifyEnhancementNeeds(contractor) {
        const needs = [];
        
        if (contractor.data_completion_score < 80) {
            needs.push('Data Quality');
        }
        if (!contractor.primary_email || contractor.primary_email.trim().length === 0) {
            needs.push('Email');
        }
        if (!contractor.website || contractor.website.length === 0) {
            needs.push('Website');
        }
        if (contractor.google_reviews_count === 0) {
            needs.push('Reviews');
        }
        if (contractor.business_health === 'UNKNOWN') {
            needs.push('Business Intel');
        }
        if (contractor.trust_score < 0.7) {
            needs.push('Trust Score');
        }

        return needs.length > 0 ? needs : ['Ready for Campaign'];
    }

    calculatePotentialIncrease(contractor) {
        const currentScore = contractor.data_completion_score;
        const missingData = this.identifyEnhancementNeeds(contractor);
        return Math.min(100 - currentScore, missingData.length * 5);
    }

    renderCardActions(contractor) {
        if (contractor.has_campaign) {
            return `
                <button class="card-btn primary" onclick="operationsManager.viewCampaign('${contractor.business_id}')">
                    <i data-lucide="mail" class="icon-sm"></i> View Campaign
                </button>
                <button class="card-btn" onclick="operationsManager.copyCampaignEmail('${contractor.business_id}')">
                    <i data-lucide="clipboard" class="icon-sm"></i> Copy Email
                </button>
                <button class="card-btn" onclick="operationsManager.markEmailSent('${contractor.business_id}')">
                    <i data-lucide="check-circle" class="icon-sm"></i> Mark Sent
                </button>
            `;
        } else {
            return `
                <button class="card-btn primary" onclick="operationsManager.editContractor('${contractor.business_id}')">
                    <i data-lucide="edit" class="icon-sm"></i> Enhance Data
                </button>
                <button class="card-btn" onclick="operationsManager.generateCampaign('${contractor.business_id}')">
                    <i data-lucide="rocket" class="icon-sm"></i> Generate Campaign
                </button>
            `;
        }
    }

    setupCardInteractions() {
        document.querySelectorAll('.contractor-card').forEach(card => {
            card.addEventListener('mouseenter', this.onCardHover.bind(this));
            card.addEventListener('mouseleave', this.onCardLeave.bind(this));
            
            // Prevent card click when buttons are clicked
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const contractorId = card.dataset.id;
                    this.onCardClick(contractorId);
                }
            });
        });
    }

    onCardHover(e) {
        const card = e.currentTarget;
        card.style.transform = 'translateY(-8px)';
    }

    onCardLeave(e) {
        const card = e.currentTarget;
        card.style.transform = 'translateY(0)';
    }

    onCardClick(contractorId) {
        console.log('Card clicked:', contractorId);
        // Could implement a quick-view modal or expanded card state
    }
}