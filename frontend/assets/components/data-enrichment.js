/**
 * DATA ENRICHMENT COMPONENT - In-line editing and enhancement
 */
class DataEnrichmentComponent {
    constructor(operationsManager) {
        this.ops = operationsManager;
        this.currentContractor = null;
        this.originalData = null;
    }

    openEditModal(contractor) {
        this.currentContractor = contractor;
        this.originalData = { ...contractor };
        
        const modal = document.getElementById('edit-modal');
        const form = document.getElementById('edit-form');
        
        form.innerHTML = this.renderEditForm(contractor);
        form.dataset.contractorId = contractor.business_id;
        
        modal.classList.add('open');
        modal.style.display = 'flex';
        
        this.setupFormValidation();
    }

    renderEditForm(contractor) {
        return `
            <div class="edit-form-grid">
                <div class="form-section">
                    <h4 class="section-title">Basic Information</h4>
                    
                    <div class="form-group">
                        <label class="form-label">Company Name</label>
                        <input type="text" class="form-input" name="company_name" 
                               value="${contractor.company_name || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <input type="text" class="form-input" name="category" 
                               value="${contractor.category || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Primary Email</label>
                        <input type="email" class="form-input" name="primary_email" 
                               value="${contractor.primary_email || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Phone</label>
                        <input type="tel" class="form-input" name="phone" 
                               value="${contractor.phone || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Website</label>
                        <input type="url" class="form-input" name="website" 
                               value="${contractor.website || ''}">
                    </div>
                </div>
                
                <div class="form-section">
                    <h4 class="section-title">Location</h4>
                    
                    <div class="form-group">
                        <label class="form-label">Full Address</label>
                        <input type="text" class="form-input" name="address_full" 
                               value="${contractor.address_full || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">City</label>
                        <input type="text" class="form-input" name="city" 
                               value="${contractor.city || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">State</label>
                        <input type="text" class="form-input" name="state_code" 
                               value="${contractor.state_code || ''}" maxlength="2">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Postal Code</label>
                        <input type="text" class="form-input" name="postal_code" 
                               value="${contractor.postal_code || ''}">
                    </div>
                </div>
                
                <div class="form-section full-width">
                    <h4 class="section-title">Enhancement Preview</h4>
                    <div class="enhancement-preview" id="enhancement-preview">
                        ${this.renderEnhancementPreview(contractor)}
                    </div>
                </div>
            </div>
        `;
    }

    renderEnhancementPreview(contractor) {
        const currentScore = contractor.data_completion_score || 0;
        const missingFields = this.identifyMissingFields(contractor);
        const potentialIncrease = Math.min(30, missingFields.length * 5);
        const newScore = Math.min(100, currentScore + potentialIncrease);

        return `
            <div class="score-comparison">
                <div class="score-item">
                    <div class="score-label">Current Score</div>
                    <div class="score-value current">${currentScore}%</div>
                </div>
                <div class="score-arrow">→</div>
                <div class="score-item">
                    <div class="score-label">Potential Score</div>
                    <div class="score-value potential">${newScore}%</div>
                </div>
            </div>
            
            <div class="missing-fields">
                <div class="missing-title">Missing/Incomplete Fields:</div>
                <div class="missing-list">
                    ${missingFields.map(field => `
                        <span class="missing-field" data-field="${field.name}">${field.label}</span>
                    `).join('')}
                </div>
            </div>
            
            <div class="enhancement-impact">
                <div class="impact-title">Enhancement Impact:</div>
                <div class="impact-details">
                    <div class="impact-item">
                        <span class="impact-icon"><i data-lucide="trending-up" class="icon-sm"></i></span>
                        <span>Score increase: +${potentialIncrease}%</span>
                    </div>
                    <div class="impact-item">
                        <span class="impact-icon"><i data-lucide="target" class="icon-sm"></i></span>
                        <span>Campaign readiness: ${newScore >= 80 ? 'Ready' : 'Needs work'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    identifyMissingFields(contractor) {
        const fields = [
            { name: 'company_name', label: 'Company Name', required: true },
            { name: 'primary_email', label: 'Email Address', required: true },
            { name: 'phone', label: 'Phone Number', required: false },
            { name: 'website', label: 'Website URL', required: false },
            { name: 'address_full', label: 'Full Address', required: false },
            { name: 'city', label: 'City', required: false },
            { name: 'state_code', label: 'State', required: false },
            { name: 'postal_code', label: 'Postal Code', required: false }
        ];

        return fields.filter(field => {
            const value = contractor[field.name];
            return !value || value.toString().trim().length === 0;
        });
    }

    setupFormValidation() {
        const form = document.getElementById('edit-form');
        const inputs = form.querySelectorAll('.form-input');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
                this.updateEnhancementPreview();
            });
            
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    validateField(input) {
        const value = input.value.trim();
        const fieldName = input.name;
        
        input.classList.remove('error', 'success');
        
        // Remove existing validation message
        const existingMsg = input.parentNode.querySelector('.validation-message');
        if (existingMsg) {
            existingMsg.remove();
        }
        
        // Validate based on field type
        let isValid = true;
        let message = '';
        
        if (input.required && !value) {
            isValid = false;
            message = 'This field is required';
        } else if (input.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        } else if (input.type === 'url' && value && !this.isValidURL(value)) {
            isValid = false;
            message = 'Please enter a valid URL';
        } else if (fieldName === 'state_code' && value && value.length !== 2) {
            isValid = false;
            message = 'State code must be 2 characters';
        }
        
        if (!isValid) {
            input.classList.add('error');
            const msgDiv = document.createElement('div');
            msgDiv.className = 'validation-message error';
            msgDiv.textContent = message;
            input.parentNode.appendChild(msgDiv);
        } else if (value) {
            input.classList.add('success');
        }
        
        return isValid;
    }

    updateEnhancementPreview() {
        const form = document.getElementById('edit-form');
        const formData = new FormData(form);
        const updatedContractor = { ...this.currentContractor };
        
        // Update contractor data with form values
        for (const [key, value] of formData.entries()) {
            updatedContractor[key] = value.trim();
        }
        
        const preview = document.getElementById('enhancement-preview');
        if (preview) {
            preview.innerHTML = this.renderEnhancementPreview(updatedContractor);
        }
    }

    async saveChanges() {
        const form = document.getElementById('edit-form');
        const inputs = form.querySelectorAll('.form-input');
        
        // Validate all fields
        let isValid = true;
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.ops.showToast('error', 'Validation Error', 'Please fix the errors before saving');
            return;
        }
        
        try {
            const formData = new FormData(form);
            const updates = {};
            
            for (const [key, value] of formData.entries()) {
                if (value.trim() !== (this.originalData[key] || '').toString().trim()) {
                    updates[key] = value.trim();
                }
            }
            
            if (Object.keys(updates).length === 0) {
                this.ops.showToast('info', 'No Changes', 'No changes were made');
                this.ops.closeModal('edit-modal');
                return;
            }
            
            const contractorId = this.currentContractor.business_id;
            const response = await fetch(`${this.ops.apiBase}/api/contractors/${contractorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to save changes');
            }
            
            this.ops.showToast('success', 'Changes Saved', 
                `Data updated successfully. Score change: ${data.changes.score_change > 0 ? '+' : ''}${data.changes.score_change}`);
            
            this.ops.closeModal('edit-modal');
            await this.ops.loadContractors(false); // Refresh the list
            
        } catch (error) {
            console.error('Save error:', error);
            this.ops.showToast('error', 'Save Error', error.message);
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}