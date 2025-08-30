/**
 * SMART FILTERS COMPONENT - Visual filtering with feedback
 */
class SmartFiltersComponent {
    constructor(operationsManager) {
        this.ops = operationsManager;
        this.filterOptions = {};
        this.init();
    }

    init() {
        this.populateFilterOptions();
        this.setupFilterIndicators();
    }

    async populateFilterOptions() {
        try {
            // Get unique categories and states from contractors
            const response = await fetch(`${this.ops.apiBase}/api/contractors?limit=1000`);
            const data = await response.json();
            
            if (data.contractors) {
                this.populateCategoryFilter(data.contractors);
                this.populateStateFilter(data.contractors);
            }
        } catch (error) {
            console.warn('Could not populate filter options:', error.message);
        }
    }

    populateCategoryFilter(contractors) {
        const categories = [...new Set(contractors.map(c => c.category).filter(c => c))].sort();
        const categorySelect = document.getElementById('filter-category');
        
        categorySelect.innerHTML = '<option value="">All Trades</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    populateStateFilter(contractors) {
        const states = [...new Set(contractors.map(c => c.state_code).filter(s => s))].sort();
        const stateSelect = document.getElementById('filter-state');
        
        stateSelect.innerHTML = '<option value="">All States</option>';
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    }

    setupFilterIndicators() {
        // Add filter indicators to show active filters
        const filtersContainer = document.querySelector('.filters-container');
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'filter-indicators';
        indicatorDiv.id = 'filter-indicators';
        filtersContainer.appendChild(indicatorDiv);
    }

    updateFilterIndicators() {
        const indicators = document.getElementById('filter-indicators');
        if (!indicators) return;

        const activeFilters = [];
        const filters = this.ops.state.filters;

        if (filters.category) activeFilters.push(`Trade: ${filters.category}`);
        if (filters.min_completion) activeFilters.push(`Score: ${filters.min_completion}+`);
        if (filters.has_campaign) {
            activeFilters.push(filters.has_campaign === 'true' ? 'Has Campaign' : 'No Campaign');
        }
        if (filters.state) activeFilters.push(`State: ${filters.state}`);
        if (filters.search) activeFilters.push(`Search: "${filters.search}"`);

        if (activeFilters.length === 0) {
            indicators.innerHTML = '';
            indicators.style.display = 'none';
            return;
        }

        indicators.style.display = 'flex';
        indicators.innerHTML = activeFilters.map(filter => `
            <span class="filter-indicator">${filter}</span>
        `).join('');
    }

    getFilterSummary() {
        const total = this.ops.state.totalContractors;
        const filtered = this.ops.state.filteredContractors.length;
        const percentage = total > 0 ? Math.round((filtered / total) * 100) : 0;

        return {
            total,
            filtered,
            percentage,
            showing: `Showing ${filtered.toLocaleString()} of ${total.toLocaleString()} contractors (${percentage}%)`
        };
    }
}