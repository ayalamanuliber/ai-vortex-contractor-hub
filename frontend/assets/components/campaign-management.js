/**
 * CAMPAIGN MANAGEMENT COMPONENT - Semi-manual campaign execution
 */
class CampaignManagementComponent {
    constructor(operationsManager) {
        this.ops = operationsManager;
        this.currentCampaign = null;
    }

    async viewCampaign(contractorId) {
        try {
            const response = await fetch(`${this.ops.apiBase}/api/contractors/${contractorId}/campaign`);
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error);
            
            this.currentCampaign = { contractorId, ...data };
            this.openCampaignModal();
            
        } catch (error) {
            console.error('Campaign view error:', error);
            this.ops.showToast('error', 'Campaign Error', error.message);
        }
    }

    openCampaignModal() {
        const modal = document.getElementById('campaign-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        
        title.textContent = 'Campaign Management';
        body.innerHTML = this.renderCampaignContent();
        
        modal.classList.add('open');
        modal.style.display = 'flex';
        
        this.setupCampaignEventListeners();
    }

    renderCampaignContent() {
        const campaign = this.currentCampaign.campaign;
        const contractor = this.getContractorById(this.currentCampaign.contractorId);
        
        if (!campaign) {
            return `
                <div class="campaign-error">
                    <div class="error-icon"><i data-lucide="alert-triangle" class="icon-lg"></i></div>
                    <div class="error-message">Campaign data not available</div>
                </div>
            `;
        }

        return `
            <div class="campaign-content">
                <div class="contractor-summary">
                    <div class="contractor-info">
                        <h3 class="contractor-name">${contractor?.company_name || 'Unknown Company'}</h3>
                        <div class="contractor-details">
                            <span class="contractor-category">${contractor?.category || 'General'}</span>
                            <span class="contractor-location"><i data-lucide="map-pin" class="icon-sm"></i> ${contractor?.city}, ${contractor?.state_code}</span>
                            <span class="contractor-score">Score: ${contractor?.data_completion_score || 0}%</span>
                        </div>
                    </div>
                    <div class="campaign-status">
                        <div class="status-badge ${this.getStatusClass(this.currentCampaign.status)}">
                            ${this.getStatusText(this.currentCampaign.status)}
                        </div>
                    </div>
                </div>

                <div class="campaign-sequences">
                    <h4 class="sequences-title">Email Sequences</h4>
                    ${this.renderEmailSequences(campaign)}
                </div>

                <div class="campaign-actions">
                    <h4 class="actions-title">Quick Actions</h4>
                    <div class="action-buttons">
                        <button class="btn btn-primary" id="copy-email-1"><i data-lucide="clipboard" class="icon-sm"></i> Copy Email 1</button>
                        <button class="btn btn-secondary" id="copy-email-2"><i data-lucide="clipboard" class="icon-sm"></i> Copy Email 2</button>
                        <button class="btn btn-secondary" id="copy-email-3"><i data-lucide="clipboard" class="icon-sm"></i> Copy Email 3</button>
                        <button class="btn btn-secondary" id="mark-sent"><i data-lucide="check-circle" class="icon-sm"></i> Mark Sent</button>
                        <button class="btn btn-secondary" id="schedule-followup"><i data-lucide="clock" class="icon-sm"></i> Schedule Follow-up</button>
                    </div>
                </div>

                <div class="campaign-timing">
                    <h4 class="timing-title">Optimal Timing</h4>
                    <div class="timing-suggestions">
                        ${this.renderTimingSuggestions(campaign)}
                    </div>
                </div>
            </div>
        `;
    }

    renderEmailSequences(campaign) {
        if (!campaign.email_sequences || campaign.email_sequences.length === 0) {
            return '<div class="no-sequences">No email sequences found</div>';
        }

        return campaign.email_sequences.map((sequence, index) => `
            <div class="email-sequence-card" data-sequence="${index + 1}">
                <div class="sequence-header">
                    <div class="sequence-number">Email ${index + 1}</div>
                    <div class="sequence-status">${sequence.status || 'Ready'}</div>
                </div>
                <div class="sequence-preview">
                    <div class="preview-subject">
                        <strong>Subject:</strong> ${sequence.subject || 'No subject'}
                    </div>
                    <div class="preview-body">
                        ${this.truncateText(sequence.body || 'No content', 150)}
                    </div>
                </div>
                <div class="sequence-actions">
                    <button class="sequence-btn" onclick="campaignManagement.copySequenceToClipboard(${index + 1})">
                        <i data-lucide="clipboard" class="icon-sm"></i> Copy
                    </button>
                    <button class="sequence-btn" onclick="campaignManagement.previewSequence(${index + 1})">
                        <i data-lucide="eye" class="icon-sm"></i> Preview
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderTimingSuggestions(campaign) {
        const timing = campaign.timing_suggestions || {};
        
        return `
            <div class="timing-grid">
                <div class="timing-item">
                    <div class="timing-label">Best Days</div>
                    <div class="timing-value">${timing.best_days || 'Tuesday, Thursday'}</div>
                </div>
                <div class="timing-item">
                    <div class="timing-label">Best Times</div>
                    <div class="timing-value">${timing.best_times || '9:00 AM, 2:00 PM'}</div>
                </div>
                <div class="timing-item">
                    <div class="timing-label">Follow-up Interval</div>
                    <div class="timing-value">${timing.followup_interval || '3-5 days'}</div>
                </div>
                <div class="timing-item">
                    <div class="timing-label">Local Timezone</div>
                    <div class="timing-value">${timing.timezone || 'Local Time'}</div>
                </div>
            </div>
        `;
    }

    setupCampaignEventListeners() {
        document.getElementById('copy-email-1')?.addEventListener('click', () => this.copySequenceToClipboard(1));
        document.getElementById('copy-email-2')?.addEventListener('click', () => this.copySequenceToClipboard(2));
        document.getElementById('copy-email-3')?.addEventListener('click', () => this.copySequenceToClipboard(3));
        document.getElementById('mark-sent')?.addEventListener('click', () => this.markEmailSent());
        document.getElementById('schedule-followup')?.addEventListener('click', () => this.scheduleFollowup());
    }

    async copySequenceToClipboard(sequenceNumber) {
        try {
            const campaign = this.currentCampaign.campaign;
            const sequence = campaign.email_sequences?.[sequenceNumber - 1];
            
            if (!sequence) {
                throw new Error('Email sequence not found');
            }

            const emailContent = this.formatEmailForCopy(sequence);
            
            await navigator.clipboard.writeText(emailContent);
            this.ops.showToast('success', 'Copied!', `Email ${sequenceNumber} copied to clipboard`);
            
        } catch (error) {
            console.error('Copy error:', error);
            this.ops.showToast('error', 'Copy Failed', error.message);
        }
    }

    formatEmailForCopy(sequence) {
        return `Subject: ${sequence.subject || ''}\n\n${sequence.body || ''}`;
    }

    async markEmailSent() {
        try {
            const response = await fetch(`${this.ops.apiBase}/api/contractors/${this.currentCampaign.contractorId}/campaign/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'mark_sent',
                    email_sequence: 1 // Could be made dynamic
                })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            this.ops.showToast('success', 'Email Marked', 'Campaign updated successfully');
            this.ops.closeModal('campaign-modal');
            await this.ops.loadContractors(false);
            
        } catch (error) {
            console.error('Mark sent error:', error);
            this.ops.showToast('error', 'Update Error', error.message);
        }
    }

    scheduleFollowup() {
        // Implementation for scheduling follow-ups
        this.ops.showToast('info', 'Feature Coming', 'Follow-up scheduling will be available soon');
    }

    previewSequence(sequenceNumber) {
        const campaign = this.currentCampaign.campaign;
        const sequence = campaign.email_sequences?.[sequenceNumber - 1];
        
        if (!sequence) {
            this.ops.showToast('error', 'Not Found', 'Email sequence not found');
            return;
        }

        // Create a preview modal or expand the sequence card
        this.ops.showToast('info', 'Preview', `Email ${sequenceNumber}: ${sequence.subject}`);
    }

    getContractorById(contractorId) {
        return this.ops.state.contractors.find(c => c.business_id === contractorId);
    }

    getStatusClass(status) {
        const statusClasses = {
            'READY': 'ready',
            'SENT': 'in-progress',
            'COMPLETE': 'complete'
        };
        return statusClasses[status] || 'unknown';
    }

    getStatusText(status) {
        const statusTexts = {
            'READY': '<i data-lucide="check-circle" class="icon-sm"></i> Ready to Send',
            'SENT': '<i data-lucide="refresh-cw" class="icon-sm"></i> In Progress',
            'COMPLETE': '<i data-lucide="check-circle" class="icon-sm"></i> Complete'
        };
        return statusTexts[status] || status || 'Unknown';
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }
}

// Make it globally available for onclick handlers
window.campaignManagement = new CampaignManagementComponent(window.operationsManager);