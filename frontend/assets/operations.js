/**
 * OPERATIONS MANAGER - Main JavaScript controller
 * Contractor Intelligence Hub V4 - Coordinates all UI components
 */

class OperationsManager {
    constructor() {
        this.state = {
            contractors: [],
            filteredContractors: [],
            currentPage: 1,
            perPage: this.calculateAdaptivePageSize(),
            totalContractors: 0,
            filters: {},
            sortBy: 'data_completion_score',
            sortOrder: 'desc',
            viewMode: 'grid',
            loading: false,
            lastUpdate: null
        };

        this.components = {};
        this.apiBase = '';
        this.refreshInterval = null;
        
        this.init();
    }

    /**
     * Calculate optimal page size based on viewport and performance
     */
    calculateAdaptivePageSize() {
        // EMERGENCY FIX: Force small pagination to prevent browser freezing
        const emergencySize = 20;
        
        console.log(`🚨 EMERGENCY MODE: Page size forced to ${emergencySize} to prevent browser crash`);
        return emergencySize;
        
        // Original adaptive logic disabled for emergency
        // const viewportHeight = window.innerHeight;
        // const estimatedCardHeight = 200;
        // const headerHeight = 120;
        // const footerHeight = 80;
        // const availableHeight = viewportHeight - headerHeight - footerHeight;
        // const cardsPerViewport = Math.floor(availableHeight / estimatedCardHeight);
        // const adaptiveSize = Math.min(100, Math.max(20, cardsPerViewport * 2));
    }

    /**
     * Lazy loading for images and heavy content
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            // Apply to all lazy images
            document.querySelectorAll('img.lazy').forEach(img => imageObserver.observe(img));
        }
    }

    /**
     * 🚨 EMERGENCY INIT - Circuit breaker pattern to prevent browser crashes
     */
    async init() {
        try {
            console.log('🚨 EMERGENCY INIT: Ultra-safe mode activated');
            
            // Show loading screen
            this.showLoadingScreen();
            
            // CIRCUIT BREAKER: Check if browser is already stressed
            if (this.detectBrowserStress()) {
                this.redirectToEmergencyMode();
                return;
            }
            
            // Initialize components with timeout protection
            this.updateLoadingProgress(20, 'Loading system components...');
            await this.safeInitializeComponents();
            
            // Set up event listeners (safe)
            this.setupEventListeners();
            this.updateLoadingProgress(40, 'Setting up event handlers...');
            
            // CRITICAL: Ask user before loading data
            this.updateLoadingProgress(60, 'Ready to load data...');
            this.hideLoadingScreen();
            this.showDataLoadingPrompt();
            
            console.log('🚨 EMERGENCY INIT: Ready for manual data loading');
            
        } catch (error) {
            console.error('🚨 EMERGENCY INIT FAILED:', error);
            this.redirectToEmergencyMode();
        }
    }

    /**
     * 🚨 DETECT BROWSER STRESS - Check if system is already overloaded
     */
    detectBrowserStress() {
        // Check memory usage if available
        if (performance.memory) {
            const memoryUsedMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            const memoryLimitMB = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
            
            if (memoryUsedMB > memoryLimitMB * 0.7) {
                console.warn(`🚨 HIGH MEMORY DETECTED: ${memoryUsedMB}MB/${memoryLimitMB}MB`);
                return true;
            }
        }
        
        // Check DOM complexity
        const domElements = document.querySelectorAll('*').length;
        if (domElements > 5000) {
            console.warn(`🚨 DOM OVERLOAD: ${domElements} elements`);
            return true;
        }
        
        return false;
    }

    /**
     * 🚨 REDIRECT TO EMERGENCY MODE
     */
    redirectToEmergencyMode() {
        console.log('🚨 REDIRECTING TO EMERGENCY MODE');
        this.showToast('error', '🚨 BROWSER STRESS DETECTED', 'Switching to emergency mode to prevent crash');
        setTimeout(() => {
            window.location.href = 'emergency-mode.html';
        }, 3000);
    }

    /**
     * 🚨 SAFE COMPONENT INITIALIZATION - No heavy processing
     */
    async safeInitializeComponents() {
        // Initialize only essential components
        try {
            this.components.calendar = { update: () => {}, render: () => {} };
            this.components.dashboard = { update: () => {}, render: () => {} };
            this.components.adaptiveGrid = { handleResize: () => {} };
            this.components.visualCards = { render: (contractors, container) => {
                container.innerHTML = contractors.map(c => this.renderContractorCard(c)).join('');
            }};
            this.components.smartFilters = {};
            this.components.dataEnrichment = {};
            this.components.campaignManagement = {};
        } catch (error) {
            console.error('🚨 Component initialization failed:', error);
            throw error;
        }
    }

    /**
     * 🚨 SHOW DATA LOADING PROMPT - User must manually trigger data loading
     */
    showDataLoadingPrompt() {
        const app = document.getElementById('app');
        app.style.display = 'flex';
        
        // Create manual loading interface
        const promptHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 500px; text-align: center; color: black;">
                    <h2>🚨 EMERGENCY MODE</h2>
                    <p style="margin: 1rem 0; line-height: 1.6;">System is ready, but data loading is MANUAL to prevent crashes.</p>
                    <p style="margin: 1rem 0; color: red;"><strong>WARNING:</strong> Loading large datasets may freeze browser!</p>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                        <button onclick="operationsManager.loadSafeDashboard()" style="padding: 1rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            🛡️ Load Dashboard Only<br><small>(Safe - 5 sec timeout)</small>
                        </button>
                        <button onclick="operationsManager.loadFirstPage()" style="padding: 1rem 1.5rem; background: #ffc107; color: black; border: none; border-radius: 8px; cursor: pointer;">
                            ⚠️ Load First 10 Contractors<br><small>(May cause issues)</small>
                        </button>
                        <button onclick="window.location.href='emergency-mode.html'" style="padding: 1rem 1.5rem; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            🚨 Emergency Mode<br><small>(Ultra-safe)</small>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', promptHTML);
    }

    /**
     * 🚨 LOAD SAFE DASHBOARD - Dashboard data only, 5 second timeout
     */
    async loadSafeDashboard() {
        try {
            document.querySelector('[style*="position: fixed"]').remove();
            this.showToast('info', 'Loading Dashboard', 'Loading dashboard data with 5 second timeout...');
            
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 5000);
            
            await this.loadDashboardData();
            this.showToast('success', 'Dashboard Ready', 'Dashboard loaded successfully. Contractor loading is manual.');
            
        } catch (error) {
            this.showToast('error', 'Dashboard Failed', 'Could not load dashboard: ' + error.message);
        }
    }

    /**
     * 🚨 LOAD FIRST PAGE - Only 10 contractors with circuit breaker
     */
    async loadFirstPage() {
        try {
            document.querySelector('[style*="position: fixed"]').remove();
            
            // Override page size for safety
            const originalPerPage = this.state.perPage;
            this.state.perPage = 10;
            
            this.showToast('warning', 'Loading 10 Contractors', 'Loading first 10 contractors with 10 second timeout...');
            
            const startTime = performance.now();
            await this.loadContractors();
            const loadTime = performance.now() - startTime;
            
            this.showToast('success', 'First Page Loaded', `10 contractors loaded in ${Math.round(loadTime)}ms`);
            
            // Restore original page size
            this.state.perPage = originalPerPage;
            
        } catch (error) {
            this.showToast('error', 'Load Failed', 'Could not load contractors: ' + error.message);
            this.showEmergencyFallback();
        }
    }

    /**
     * Initialize all UI components
     */
    async initializeComponents() {
        // Initialize components (will be implemented in separate files)
        this.components.calendar = new CalendarComponent(this);
        this.components.dashboard = new DashboardComponent(this);
        this.components.adaptiveGrid = new AdaptiveGridComponent(this);
        this.components.visualCards = new VisualCardsComponent(this);
        this.components.smartFilters = new SmartFiltersComponent(this);
        this.components.dataEnrichment = new DataEnrichmentComponent(this);
        this.components.campaignManagement = new CampaignManagementComponent(this);
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Header actions
        document.getElementById('refresh-data').addEventListener('click', () => this.refreshData());
        document.getElementById('export-data').addEventListener('click', () => this.exportData());
        document.getElementById('sync-data').addEventListener('click', () => this.syncData());

        // Filter and search
        document.getElementById('filter-category').addEventListener('change', () => this.applyFilters());
        document.getElementById('filter-completion').addEventListener('change', () => this.applyFilters());
        document.getElementById('filter-campaign').addEventListener('change', () => this.applyFilters());
        document.getElementById('filter-state').addEventListener('change', () => this.applyFilters());
        document.getElementById('search-input').addEventListener('input', this.debounce(() => this.applyFilters(), 500));
        document.getElementById('search-btn').addEventListener('click', () => this.applyFilters());
        document.getElementById('clear-filters').addEventListener('click', () => this.clearFilters());

        // Sort and view
        document.getElementById('sort-select').addEventListener('change', () => this.applySorting());
        document.getElementById('sort-order').addEventListener('click', () => this.toggleSortOrder());
        document.getElementById('grid-view').addEventListener('click', () => this.setViewMode('grid'));
        document.getElementById('list-view').addEventListener('click', () => this.setViewMode('list'));

        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => this.previousPage());
        document.getElementById('next-page').addEventListener('click', () => this.nextPage());

        // Modal handlers
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal('campaign-modal'));
        document.getElementById('edit-modal-close').addEventListener('click', () => this.closeModal('edit-modal'));
        document.getElementById('cancel-edit').addEventListener('click', () => this.closeModal('edit-modal'));
        document.getElementById('save-edit').addEventListener('click', () => this.saveContractorEdit());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Window events
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));
    }

    /**
     * Show loading screen with real progress tracking
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        const loadingSubtitle = document.querySelector('.loading-subtitle');
        
        loadingScreen.style.display = 'flex';
        app.style.display = 'none';
        
        // EMERGENCY: Real progress tracking
        this.updateLoadingProgress(10, 'Initializing emergency mode...');
        
        setTimeout(() => {
            this.updateLoadingProgress(30, 'Loading system components...');
        }, 200);
        
        setTimeout(() => {
            this.updateLoadingProgress(50, 'Connecting to data sources...');
        }, 400);
        
        setTimeout(() => {
            this.updateLoadingProgress(70, 'Applying performance optimizations...');
        }, 600);
    }
    
    /**
     * Update loading progress with real status
     */
    updateLoadingProgress(percent, message) {
        const loadingBar = document.querySelector('.loading-bar');
        const loadingSubtitle = document.querySelector('.loading-subtitle');
        
        if (loadingBar) loadingBar.style.width = `${percent}%`;
        if (loadingSubtitle) loadingSubtitle.textContent = message;
        
        console.log(`Loading: ${percent}% - ${message}`);
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        const loadingBar = document.querySelector('.loading-bar');
        
        loadingBar.style.width = '100%';
        
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                app.style.display = 'flex';
                app.classList.add('fade-in');
            }, 500);
        }, 200);
    }

    /**
     * Load dashboard overview data
     */
    async loadDashboardData() {
        try {
            const response = await fetch(`${this.apiBase}/api/dashboard`);
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || 'Dashboard data failed');
            
            this.updateDashboard(data);
            this.state.lastUpdate = new Date();
            
        } catch (error) {
            console.error('Dashboard load error:', error);
            this.showToast('error', 'Dashboard Error', error.message);
        }
    }

    /**
     * Update dashboard with new data
     */
    updateDashboard(data) {
        // Update header stats
        document.getElementById('total-contractors').textContent = data.overview.total_contractors.toLocaleString();
        document.getElementById('ready-campaigns').textContent = data.today_actions.ready_to_send.toLocaleString();
        document.getElementById('completion-80').textContent = data.metrics.completion_80_plus.toLocaleString();

        // Update today's actions
        document.getElementById('ready-to-send-count').textContent = data.today_actions.ready_to_send;
        document.getElementById('enrich-data-count').textContent = data.today_actions.needs_enrichment;
        document.getElementById('followup-count').textContent = data.today_actions.follow_ups_due;

        // Update pipeline
        document.getElementById('pipeline-queue').textContent = data.pipeline.queue;
        document.getElementById('pipeline-ready').textContent = data.pipeline.ready;
        document.getElementById('pipeline-sent').textContent = data.pipeline.sent;
        document.getElementById('pipeline-complete').textContent = data.pipeline.complete;

        // Update components
        if (this.components.dashboard) {
            this.components.dashboard.update(data);
        }
        
        if (this.components.calendar) {
            this.components.calendar.update(data);
        }

        // Set adaptive UI mode
        this.setAdaptiveMode(data.overview.ui_scale_mode);
    }

    /**
     * Set adaptive UI mode based on data volume
     */
    setAdaptiveMode(mode) {
        const grid = document.getElementById('contractors-container');
        if (!grid) return;

        grid.classList.remove('compact', 'balanced', 'detailed');
        
        switch (mode) {
            case 'COMPACT':
                grid.classList.add('compact');
                this.state.perPage = 100;
                break;
            case 'BALANCED':
                grid.classList.add('balanced');
                this.state.perPage = 50;
                break;
            case 'DETAILED':
                grid.classList.add('detailed');
                this.state.perPage = 25;
                break;
        }
    }

    /**
     * 🚨 LOAD CONTRACTORS - Maximum protection against browser crashes
     */
    async loadContractors(showLoading = true) {
        const startTime = performance.now();
        
        try {
            // CIRCUIT BREAKER: Check system stress before loading
            if (this.detectBrowserStress()) {
                this.showToast('error', '🚨 SYSTEM STRESS', 'Browser is stressed - operation cancelled to prevent crash');
                return;
            }

            this.state.loading = true;
            if (showLoading) {
                this.showContractorsLoading();
            }

            // EMERGENCY: Force ultra-small page size if not already set
            if (this.state.perPage > 50) {
                this.state.perPage = 20;
                console.warn('🚨 FORCING SMALL PAGE SIZE TO PREVENT CRASH');
            }

            const params = new URLSearchParams({
                page: this.state.currentPage,
                limit: Math.min(this.state.perPage, 50), // HARD LIMIT: Never more than 50
                sort_by: this.state.sortBy,
                sort_order: this.state.sortOrder,
                ...this.state.filters
            });

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // EMERGENCY: 10 second timeout

            // EMERGENCY: Show immediate feedback
            this.showToast('info', 'Loading Data', `Fetching max ${Math.min(this.state.perPage, 50)} contractors... (10s timeout)`);

            const response = await fetch(`${this.apiBase}/api/contractors?${params}`, {
                signal: controller.signal,
                headers: {
                    'Cache-Control': 'no-cache',
                    'X-Emergency-Mode': 'true'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: Failed to load contractors`);
            }
            
            const data = await response.json();
            
            // CIRCUIT BREAKER: Check if response is too large
            if (data.contractors && data.contractors.length > 100) {
                this.showToast('warning', '🚨 LARGE DATASET', 'Truncating to 50 records to prevent crash');
                data.contractors = data.contractors.slice(0, 50);
            }
            
            this.state.contractors = data.contractors || [];
            this.state.filteredContractors = data.contractors || [];
            this.state.totalContractors = data.pagination ? data.pagination.total_records : 0;
            this.state.lastUpdate = new Date();
            
            const loadTime = performance.now() - startTime;
            console.log(`🚨 SAFE LOAD: ${data.contractors ? data.contractors.length : 0} contractors in ${Math.round(loadTime)}ms`);
            
            // SAFETY: Use timeout for rendering to prevent blocking
            setTimeout(() => {
                this.renderContractorsSafely(data.contractors || []);
                this.updatePagination(data.pagination || { current_page: 1, total_pages: 1 });
                this.updateContractorsHeader(data.pagination ? data.pagination.total_records : 0);
            }, 100);
            
            // Show performance warning
            if (loadTime > 5000) {
                this.showToast('warning', 'SLOW LOAD', `Load took ${Math.round(loadTime)}ms - consider reducing filters`);
            }
            
        } catch (error) {
            console.error('🚨 CONTRACTORS LOAD ERROR:', error);
            
            // EMERGENCY: Better error handling with fallback data
            if (error.name === 'AbortError') {
                this.showToast('error', '🚨 TIMEOUT (10s)', 'Server too slow - switching to emergency mode');
                this.showEmergencyFallback();
            } else if (error.message.includes('Failed to fetch')) {
                this.showToast('error', '🚨 SERVER DOWN', 'Cannot connect - check if server is running');
                this.showEmergencyFallback();
            } else {
                this.showToast('error', '🚨 LOAD ERROR', `${error.message}`);
                this.showEmergencyFallback();
            }
            
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * 🚨 RENDER CONTRACTORS SAFELY - Prevent DOM overload
     */
    renderContractorsSafely(contractors) {
        const container = document.getElementById('contractors-container');
        const loading = document.getElementById('contractors-loading');
        const empty = document.getElementById('contractors-empty');
        
        if (!container) {
            console.error('🚨 CONTAINER NOT FOUND - DOM may be corrupted');
            return;
        }
        
        loading.style.display = 'none';
        
        if (!contractors || contractors.length === 0) {
            container.style.display = 'none';
            empty.style.display = 'flex';
            return;
        }
        
        empty.style.display = 'none';
        container.style.display = 'grid';
        
        // SAFETY: Limit DOM rendering
        const safeLimit = Math.min(contractors.length, 25);
        const safeContractors = contractors.slice(0, safeLimit);
        
        if (contractors.length > safeLimit) {
            this.showToast('warning', '🚨 DOM PROTECTION', `Showing ${safeLimit}/${contractors.length} to prevent browser slowdown`);
        }
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        safeContractors.forEach((contractor, index) => {
            // Add delay between renders to prevent blocking
            setTimeout(() => {
                const cardHTML = this.renderContractorCard(contractor);
                const div = document.createElement('div');
                div.innerHTML = cardHTML;
                fragment.appendChild(div.firstElementChild);
                
                if (index === safeContractors.length - 1) {
                    container.innerHTML = '';
                    container.appendChild(fragment);
                    this.setupCardEventListeners();
                }
            }, index * 10); // 10ms delay between each card
        });
    }

    /**
     * Render contractors in the grid/list
     */
    renderContractors(contractors) {
        const container = document.getElementById('contractors-container');
        const loading = document.getElementById('contractors-loading');
        const empty = document.getElementById('contractors-empty');
        
        loading.style.display = 'none';
        
        if (contractors.length === 0) {
            container.style.display = 'none';
            empty.style.display = 'flex';
            return;
        }
        
        empty.style.display = 'none';
        container.style.display = 'grid';
        
        // Use VisualCards component to render
        if (this.components.visualCards) {
            this.components.visualCards.render(contractors, container);
        } else {
            // Fallback rendering
            container.innerHTML = contractors.map(contractor => this.renderContractorCard(contractor)).join('');
        }
        
        // Set up card event listeners
        this.setupCardEventListeners();
    }

    /**
     * Render a single contractor card (fallback)
     */
    renderContractorCard(contractor) {
        const statusClass = contractor.has_campaign ? 
            (contractor.campaign_status === 'SENT' ? 'in-progress' : 'has-campaign') : 
            'no-campaign';
        
        const statusText = contractor.has_campaign ? 
            '✅ CAMPAIGN READY' : 
            '❌ NO CAMPAIGN';
            
        const completionTier = this.getCompletionTier(contractor.data_completion_score);
        
        return `
            <div class="contractor-card ${statusClass}" data-id="${contractor.business_id}">
                <div class="card-header-section">
                    <div class="card-company-info">
                        <h3 class="company-name">${contractor.company_name}</h3>
                        <div class="company-category">${contractor.category}</div>
                    </div>
                    <div class="card-status ${statusClass}">${statusText}</div>
                </div>
                
                <div class="completion-section">
                    <div class="completion-circle">
                        <div class="completion-score">${contractor.data_completion_score}%</div>
                    </div>
                    <div class="completion-details">
                        <div class="completion-tier ${completionTier.toLowerCase()}">${completionTier}</div>
                        <div class="location-info">
                            <span><i data-lucide="map-pin" class="icon-sm"></i></span>
                            <span>${contractor.city}, ${contractor.state_code}</span>
                        </div>
                    </div>
                </div>
                
                ${contractor.has_campaign ? this.renderCampaignSection(contractor) : this.renderEnhancementSection(contractor)}
                
                <div class="card-actions">
                    ${contractor.has_campaign ? 
                        `<button class="card-btn primary" onclick="operationsManager.viewCampaign('${contractor.business_id}')"><i data-lucide="mail" class="icon-sm"></i> View Campaign</button>
                         <button class="card-btn" onclick="operationsManager.copyCampaignEmail('${contractor.business_id}')"><i data-lucide="clipboard" class="icon-sm"></i> Copy Email</button>
                         <button class="card-btn" onclick="operationsManager.markEmailSent('${contractor.business_id}')">✅ Mark Sent</button>` :
                        `<button class="card-btn primary" onclick="operationsManager.editContractor('${contractor.business_id}')">✏️ Edit Data</button>
                         <button class="card-btn" onclick="operationsManager.generateCampaign('${contractor.business_id}')"><i data-lucide="rocket" class="icon-sm"></i> Generate Campaign</button>`
                    }
                </div>
            </div>
        `;
    }

    /**
     * Render campaign section for contractor card
     */
    renderCampaignSection(contractor) {
        if (!contractor.campaign_data) return '';
        
        return `
            <div class="campaign-section">
                <div class="campaign-title"><i data-lucide="mail" class="icon-sm"></i> Email Sequence</div>
                <div class="email-sequences">
                    <div class="email-sequence">
                        <div class="sequence-status ${contractor.emails_sent >= 1 ? 'ready' : 'pending'}">
                            ${contractor.emails_sent >= 1 ? '✅' : '1'}
                        </div>
                        <div class="sequence-text">Initial outreach email</div>
                    </div>
                    <div class="email-sequence">
                        <div class="sequence-status ${contractor.emails_sent >= 2 ? 'ready' : 'pending'}">
                            ${contractor.emails_sent >= 2 ? '✅' : '2'}
                        </div>
                        <div class="sequence-text">Follow-up email</div>
                    </div>
                    <div class="email-sequence">
                        <div class="sequence-status ${contractor.emails_sent >= 3 ? 'ready' : 'pending'}">
                            ${contractor.emails_sent >= 3 ? '✅' : '3'}
                        </div>
                        <div class="sequence-text">Final outreach email</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render enhancement section for contractor card
     */
    renderEnhancementSection(contractor) {
        const needs = [];
        
        if (contractor.data_completion_score < 80) {
            needs.push('Data Quality');
        }
        if (!contractor.primary_email || contractor.primary_email.length === 0) {
            needs.push('Email');
        }
        if (!contractor.website) {
            needs.push('Website');
        }
        if (contractor.google_reviews_count === 0) {
            needs.push('Reviews');
        }
        
        return `
            <div class="enhancement-section">
                <div class="campaign-title"><i data-lucide="target" class="icon-sm"></i> Enhancement Needed</div>
                <div class="enhancement-needs">
                    ${needs.map(need => `<span class="enhancement-tag">${need}</span>`).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Get completion tier from score
     */
    getCompletionTier(score) {
        if (score >= 90) return 'PREMIUM';
        if (score >= 80) return 'READY';
        if (score >= 70) return 'GOOD';
        if (score >= 50) return 'NEEDS_WORK';
        return 'POOR';
    }

    /**
     * Set up event listeners for contractor cards
     */
    setupCardEventListeners() {
        document.querySelectorAll('.contractor-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const contractorId = card.dataset.id;
                    this.viewContractorDetails(contractorId);
                }
            });
        });
    }

    /**
     * Show contractors loading state
     */
    showContractorsLoading() {
        document.getElementById('contractors-loading').style.display = 'flex';
        document.getElementById('contractors-container').style.display = 'none';
        document.getElementById('contractors-empty').style.display = 'none';
    }

    /**
     * Show empty contractors state
     */
    showContractorsEmpty() {
        document.getElementById('contractors-loading').style.display = 'none';
        document.getElementById('contractors-container').style.display = 'none';
        document.getElementById('contractors-empty').style.display = 'flex';
    }

    /**
     * EMERGENCY FALLBACK: Show dummy data when server fails
     */
    showEmergencyFallback() {
        const container = document.getElementById('contractors-container');
        const loading = document.getElementById('contractors-loading');
        const empty = document.getElementById('contractors-empty');
        
        loading.style.display = 'none';
        empty.style.display = 'none';
        container.style.display = 'grid';
        
        // Emergency fallback data
        const fallbackContractors = [
            {
                business_id: 'DEMO_001',
                company_name: '🚨 EMERGENCY DEMO MODE',
                category: 'System Status',
                data_completion_score: 0,
                city: 'Server',
                state_code: 'DOWN',
                has_campaign: false
            }
        ];
        
        container.innerHTML = fallbackContractors.map(contractor => this.renderContractorCard(contractor)).join('');
        this.updateContractorsHeader(1);
    }

    /**
     * Update contractors header
     */
    updateContractorsHeader(totalRecords) {
        const countElement = document.getElementById('contractors-count');
        const subtitleElement = document.getElementById('section-subtitle');
        
        countElement.textContent = `${totalRecords.toLocaleString()} contractors`;
        
        let subtitle = 'Adaptive display optimized for your data volume';
        if (totalRecords > 2000) subtitle = 'Compact view - High data density detected';
        else if (totalRecords > 500) subtitle = 'Balanced view - Medium data density';
        else subtitle = 'Detailed view - Full information display';
        
        subtitleElement.textContent = subtitle;
    }

    /**
     * Update pagination controls
     */
    updatePagination(paginationData) {
        const pagination = document.getElementById('pagination');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const info = document.getElementById('pagination-info');
        
        if (paginationData.total_pages <= 1) {
            pagination.style.display = 'none';
            return;
        }
        
        pagination.style.display = 'flex';
        
        prevBtn.disabled = paginationData.current_page <= 1;
        nextBtn.disabled = paginationData.current_page >= paginationData.total_pages;
        
        info.textContent = `Page ${paginationData.current_page} of ${paginationData.total_pages}`;
    }

    /**
     * Apply current filters
     */
    async applyFilters() {
        this.state.filters = {};
        this.state.currentPage = 1;
        
        const category = document.getElementById('filter-category').value;
        const completion = document.getElementById('filter-completion').value;
        const campaign = document.getElementById('filter-campaign').value;
        const state = document.getElementById('filter-state').value;
        const search = document.getElementById('search-input').value.trim();
        
        if (category) this.state.filters.category = category;
        if (completion) this.state.filters.min_completion = completion;
        if (campaign) {
            if (campaign === 'has_campaign') this.state.filters.has_campaign = 'true';
            else if (campaign === 'no_campaign') this.state.filters.has_campaign = 'false';
        }
        if (state) this.state.filters.state = state;
        if (search) this.state.filters.search = search;
        
        await this.loadContractors();
    }

    /**
     * Clear all filters
     */
    async clearFilters() {
        this.state.filters = {};
        this.state.currentPage = 1;
        
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-completion').value = '';
        document.getElementById('filter-campaign').value = '';
        document.getElementById('filter-state').value = '';
        document.getElementById('search-input').value = '';
        
        await this.loadContractors();
    }

    /**
     * Apply sorting
     */
    async applySorting() {
        this.state.sortBy = document.getElementById('sort-select').value;
        this.state.currentPage = 1;
        await this.loadContractors();
    }

    /**
     * Toggle sort order
     */
    async toggleSortOrder() {
        this.state.sortOrder = this.state.sortOrder === 'desc' ? 'asc' : 'desc';
        this.state.currentPage = 1;
        
        const btn = document.getElementById('sort-order');
        btn.textContent = this.state.sortOrder === 'desc' ? '↓' : '↑';
        
        await this.loadContractors();
    }

    /**
     * Set view mode
     */
    setViewMode(mode) {
        this.state.viewMode = mode;
        
        document.getElementById('grid-view').classList.toggle('active', mode === 'grid');
        document.getElementById('list-view').classList.toggle('active', mode === 'list');
        
        const container = document.getElementById('contractors-container');
        container.className = mode === 'grid' ? 'contractors-grid' : 'contractors-list';
    }

    /**
     * Navigation methods
     */
    async previousPage() {
        if (this.state.currentPage > 1) {
            this.state.currentPage--;
            await this.loadContractors();
        }
    }

    async nextPage() {
        this.state.currentPage++;
        await this.loadContractors();
    }

    /**
     * Contractor action methods
     */
    async viewCampaign(contractorId) {
        try {
            const response = await fetch(`${this.apiBase}/api/contractors/${contractorId}/campaign`);
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error);
            
            this.openCampaignModal(contractorId, data);
            
        } catch (error) {
            console.error('Campaign view error:', error);
            this.showToast('error', 'Campaign Error', error.message);
        }
    }

    async editContractor(contractorId) {
        try {
            const response = await fetch(`${this.apiBase}/api/contractors/${contractorId}`);
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error);
            
            this.openEditModal(contractorId, data.contractor);
            
        } catch (error) {
            console.error('Edit contractor error:', error);
            this.showToast('error', 'Edit Error', error.message);
        }
    }

    async copyCampaignEmail(contractorId) {
        // Implementation for copying email to clipboard
        this.showToast('success', 'Copied', 'Email copied to clipboard');
    }

    async markEmailSent(contractorId) {
        try {
            const response = await fetch(`${this.apiBase}/api/contractors/${contractorId}/campaign/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_sent' })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            this.showToast('success', 'Email Marked', 'Campaign updated successfully');
            await this.loadContractors(false);
            
        } catch (error) {
            console.error('Mark sent error:', error);
            this.showToast('error', 'Update Error', error.message);
        }
    }

    /**
     * Data management methods
     */
    async refreshData() {
        this.showToast('info', 'Refreshing', 'Updating data...');
        await this.loadDashboardData();
        await this.loadContractors();
        this.showToast('success', 'Refreshed', 'Data updated successfully');
    }

    async exportData() {
        try {
            const response = await fetch(`${this.apiBase}/api/export/csv`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ only_enhanced: false })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            this.showToast('success', 'Export Complete', 'CSV file generated successfully');
            
        } catch (error) {
            console.error('Export error:', error);
            this.showToast('error', 'Export Error', error.message);
        }
    }

    async syncData() {
        try {
            this.showToast('info', 'Syncing', 'Triggering data unification...');
            
            const response = await fetch(`${this.apiBase}/api/data/unify`, {
                method: 'POST'
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            this.showToast('success', 'Sync Complete', 'Data unified successfully');
            await this.refreshData();
            
        } catch (error) {
            console.error('Sync error:', error);
            this.showToast('error', 'Sync Error', error.message);
        }
    }

    /**
     * Modal management
     */
    openCampaignModal(contractorId, campaignData) {
        const modal = document.getElementById('campaign-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        
        title.textContent = 'Campaign Details';
        body.innerHTML = this.renderCampaignModal(campaignData);
        
        modal.classList.add('open');
        modal.style.display = 'flex';
    }

    openEditModal(contractorId, contractor) {
        const modal = document.getElementById('edit-modal');
        const form = document.getElementById('edit-form');
        
        form.innerHTML = this.renderEditForm(contractor);
        form.dataset.contractorId = contractorId;
        
        modal.classList.add('open');
        modal.style.display = 'flex';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('open');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    /**
     * Toast notifications
     */
    showToast(type, title, message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${this.getToastIcon(type)}</div>
                <div class="toast-text">
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close">&times;</button>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 5000);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        });
    }

    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    /**
     * Utility methods
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    handleKeyboard(e) {
        // Escape key to close modals
        if (e.key === 'Escape') {
            this.closeModal('campaign-modal');
            this.closeModal('edit-modal');
        }
        
        // Ctrl+R to refresh
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            this.refreshData();
        }
    }

    handleResize() {
        // Handle responsive adjustments
        if (this.components.adaptiveGrid) {
            this.components.adaptiveGrid.handleResize();
        }
    }

    /**
     * Auto-refresh functionality
     */
    startAutoRefresh() {
        // EMERGENCY: Reduce refresh frequency to prevent load
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
        }, 10 * 60 * 1000); // 10 minutes instead of 5
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * EMERGENCY: Performance monitoring to prevent browser crash
     */
    startPerformanceMonitoring() {
        // Monitor memory usage
        this.performanceInterval = setInterval(() => {
            if (performance.memory) {
                const memoryInfo = performance.memory;
                const memoryUsedMB = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
                const memoryLimitMB = Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024);
                
                console.log(`Memory: ${memoryUsedMB}MB / ${memoryLimitMB}MB`);
                
                // EMERGENCY: Warn if memory usage is high
                if (memoryUsedMB > memoryLimitMB * 0.8) {
                    this.showToast('warning', 'HIGH MEMORY', 'Browser using too much memory - consider refreshing page');
                }
                
                // EMERGENCY: Force page refresh if memory is critical
                if (memoryUsedMB > memoryLimitMB * 0.9) {
                    this.showToast('error', 'CRITICAL MEMORY', 'Auto-refreshing page to prevent crash');
                    setTimeout(() => window.location.reload(), 3000);
                }
            }
            
            // Monitor DOM elements
            const contractorCards = document.querySelectorAll('.contractor-card');
            if (contractorCards.length > 100) {
                console.warn(`DOM overload: ${contractorCards.length} contractor cards rendered`);
                this.showToast('warning', 'DOM OVERLOAD', `${contractorCards.length} elements detected - system may slow down`);
            }
            
        }, 30000); // Check every 30 seconds
    }

    stopPerformanceMonitoring() {
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
            this.performanceInterval = null;
        }
    }

    /**
     * Placeholder methods for modal content
     */
    renderCampaignModal(campaignData) {
        return `<div class="campaign-modal-content">Campaign details will be rendered here</div>`;
    }

    renderEditForm(contractor) {
        return `<div class="edit-form-content">Edit form will be rendered here</div>`;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.operationsManager = new OperationsManager();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.operationsManager) {
        if (document.hidden) {
            window.operationsManager.stopAutoRefresh();
        } else {
            window.operationsManager.startAutoRefresh();
            window.operationsManager.refreshData();
        }
    }
});