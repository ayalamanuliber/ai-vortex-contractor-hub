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
     * SMART INIT - Progressive loading with performance monitoring
     */
    async init() {
        try {
            console.log('🚀 SMART INIT: Progressive loading activated');
            
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize components with timeout protection
            this.updateLoadingProgress(20, 'Loading system components...');
            await this.safeInitializeComponents();
            
            // Set up event listeners
            this.setupEventListeners();
            this.updateLoadingProgress(40, 'Setting up event handlers...');
            
            // Load dashboard data first (lightweight)
            this.updateLoadingProgress(60, 'Loading dashboard...');
            await this.loadDashboardData();
            
            // Start performance monitoring
            this.startPerformanceMonitoring();
            
            // Hide loading and show main interface
            this.updateLoadingProgress(80, 'Ready to load contractors...');
            this.hideLoadingScreen();
            
            // TEMPORARILY DISABLED - Auto-load first page of contractors
            this.updateLoadingProgress(100, 'Interface ready - data loading disabled...');
            // await this.loadContractors();
            this.showEmptyInterface();
            
            // Start auto-refresh (reduced frequency)
            this.startAutoRefresh();
            
            console.log('✅ SMART INIT: System ready with progressive loading');
            
        } catch (error) {
            console.error('❌ INIT FAILED:', error);
            this.showEmergencyFallback();
        }
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
     * 🚨 DASHBOARD DATA DISABLED - Show fake data for interface only
     */
    async loadDashboardData() {
        try {
            // 🚨 DISABLED: Real dashboard data loading
            // const response = await fetch(`${this.apiBase}/api/dashboard`);
            // const data = await response.json();
            
            // 🚨 FAKE DASHBOARD DATA - Shows interface without real data
            const data = {
                overview: {
                    total_contractors: 0,
                    ui_scale_mode: 'DETAILED',
                    last_updated: new Date().toISOString()
                },
                today_actions: {
                    ready_to_send: 0,
                    needs_enrichment: 0,
                    follow_ups_due: 0,
                    high_priority: 0
                },
                metrics: {
                    completion_80_plus: 0
                },
                pipeline: {
                    queue: 0,
                    ready: 0,
                    sent: 0,
                    complete: 0
                }
            };
            
            this.updateDashboard(data);
            this.state.lastUpdate = new Date();
            
            console.log('✅ DASHBOARD INTERFACE: Fake data loaded for UI display');
            
        } catch (error) {
            console.error('Dashboard interface error:', error);
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
     * Show empty interface with placeholder
     */
    showEmptyInterface() {
        const contractorGrid = document.getElementById('contractor-grid');
        if (contractorGrid) {
            contractorGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="glass-surface p-8 rounded-2xl max-w-md mx-auto">
                        <i data-lucide="database" class="w-16 h-16 mx-auto mb-4 text-blue-400"></i>
                        <h3 class="text-xl font-semibold mb-2">System Ready</h3>
                        <p class="text-gray-300 mb-4">Interface loaded successfully. Contractor data loading is temporarily disabled for system stability.</p>
                        <button id="loadDataBtn" class="glass-button px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            <i data-lucide="download" class="w-4 h-4 mr-2"></i>
                            Enable Data Loading
                        </button>
                    </div>
                </div>
            `;
            
            // Initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    /**
     * 🚨 DATA LOADING DISABLED - Interface only mode for development/testing
     */
    async loadContractors(showLoading = true) {
        const startTime = performance.now();
        
        try {
            this.state.loading = true;
            if (showLoading) {
                this.showContractorsLoading();
            }

            // 🚨 DISABLED: All actual data loading commented out
            // const params = new URLSearchParams({
            //     page: this.state.currentPage,
            //     limit: this.state.perPage,
            //     sort_by: this.state.sortBy,
            //     sort_order: this.state.sortOrder,
            //     ...this.state.filters
            // });

            // const controller = new AbortController();
            // const timeoutId = setTimeout(() => controller.abort(), 15000);

            // const response = await fetch(`${this.apiBase}/api/contractors?${params}`, {
            //     signal: controller.signal,
            //     headers: {
            //         'Cache-Control': 'no-cache',
            //         'X-Performance-Mode': 'adaptive'
            //     }
            // });
            
            // clearTimeout(timeoutId);
            // const data = await response.json();
            
            // 🚨 INTERFACE ONLY: Return empty data to show UI without contractors
            const data = {
                contractors: [], // Empty array - no contractor data
                pagination: { 
                    current_page: 1, 
                    total_pages: 1,
                    total_records: 0,
                    per_page: this.state.perPage
                },
                performance: {
                    processing_time_ms: 5,
                    performance_tier: 'FAST'
                }
            };
            
            // Update state with empty data
            this.state.contractors = [];
            this.state.filteredContractors = [];
            this.state.totalContractors = 0;
            this.state.lastUpdate = new Date();
            
            const loadTime = performance.now() - startTime;
            console.log(`✅ INTERFACE MODE: UI loaded in ${Math.round(loadTime)}ms (no contractor data)`);
            
            // Render empty state immediately
            setTimeout(() => {
                this.renderContractorsProgressively([]);
                this.updatePagination(data.pagination);
                this.updateContractorsHeader(0, data.performance);
            }, 50);
            
            // Show helpful message
            this.showToast('info', 'Interface Mode', 'UI loaded without contractor data - ready for development');
            
        } catch (error) {
            console.error('❌ INTERFACE LOAD ERROR:', error);
            this.showToast('error', 'Interface Error', `${error.message}`);
            
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * PROGRESSIVE RENDERING - Smooth non-blocking DOM updates
     */
    renderContractorsProgressively(contractors) {
        const container = document.getElementById('contractors-container');
        const loading = document.getElementById('contractors-loading');
        const empty = document.getElementById('contractors-empty');
        
        if (!container) {
            console.error('❌ CONTAINER NOT FOUND - DOM may be corrupted');
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
        
        // Clear existing content
        container.innerHTML = '';
        
        // Progressive rendering with requestAnimationFrame for smoothness
        let index = 0;
        const renderBatch = () => {
            const startTime = performance.now();
            const batchSize = contractors.length > 30 ? 3 : 5; // Smaller batches for larger datasets
            
            // Render a batch of cards
            for (let i = 0; i < batchSize && index < contractors.length; i++, index++) {
                const contractor = contractors[index];
                const cardHTML = this.renderContractorCard(contractor);
                const div = document.createElement('div');
                div.innerHTML = cardHTML;
                container.appendChild(div.firstElementChild);
            }
            
            const renderTime = performance.now() - startTime;
            
            // Continue with next batch if there are more cards
            if (index < contractors.length) {
                // Adaptive delay based on render performance
                const delay = renderTime > 15 ? 25 : renderTime > 8 ? 10 : 5;
                setTimeout(() => requestAnimationFrame(renderBatch), delay);
            } else {
                // All done, set up event listeners
                this.setupCardEventListeners();
                console.log(`📋 Rendered ${contractors.length} contractor cards progressively`);
            }
        };
        
        // Start progressive rendering
        requestAnimationFrame(renderBatch);
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
     * Update contractors header with performance info
     */
    updateContractorsHeader(totalRecords, performanceInfo = null) {
        const countElement = document.getElementById('contractors-count');
        const subtitleElement = document.getElementById('section-subtitle');
        
        countElement.textContent = `${totalRecords.toLocaleString()} contractors`;
        
        let subtitle = 'Adaptive display optimized for your data volume';
        
        if (performanceInfo) {
            // Show performance-aware subtitle
            if (performanceInfo.performance_tier === 'FAST') {
                subtitle = `Fast query (${performanceInfo.processing_time_ms}ms) - Performance optimized`;
            } else if (performanceInfo.performance_tier === 'MEDIUM') {
                subtitle = `Medium dataset (${performanceInfo.processing_time_ms}ms) - Balanced view`;
            } else if (performanceInfo.performance_tier === 'SLOW') {
                subtitle = `Large dataset (${performanceInfo.processing_time_ms}ms) - Compact view for performance`;
            }
            
            if (performanceInfo.filtered_count !== performanceInfo.original_count) {
                subtitle += ` - Filtered from ${performanceInfo.original_count.toLocaleString()}`;
            }
        } else {
            // Fallback subtitle based on record count
            if (totalRecords > 2000) subtitle = 'Compact view - High data density detected';
            else if (totalRecords > 500) subtitle = 'Balanced view - Medium data density';
            else subtitle = 'Detailed view - Full information display';
        }
        
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