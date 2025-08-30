/**
 * ADAPTIVE GRID COMPONENT - Responsive contractor grid with scaling
 */
class AdaptiveGridComponent {
    constructor(operationsManager) {
        this.ops = operationsManager;
        this.currentMode = 'balanced';
        this.init();
    }

    init() {
        this.handleResize();
    }

    setMode(mode) {
        this.currentMode = mode;
        const grid = document.getElementById('contractors-container');
        if (!grid) return;

        grid.classList.remove('compact', 'balanced', 'detailed');
        grid.classList.add(mode);

        // Adjust per-page count based on mode
        switch (mode) {
            case 'compact':
                this.ops.state.perPage = 100;
                break;
            case 'balanced':
                this.ops.state.perPage = 50;
                break;
            case 'detailed':
                this.ops.state.perPage = 25;
                break;
        }
    }

    handleResize() {
        const width = window.innerWidth;
        let newMode = 'balanced';

        if (width < 768) {
            newMode = 'compact';
        } else if (width > 1400) {
            newMode = 'detailed';
        }

        if (newMode !== this.currentMode) {
            this.setMode(newMode);
        }
    }

    calculateOptimalColumns() {
        const container = document.getElementById('contractors-container');
        if (!container) return 3;

        const containerWidth = container.offsetWidth;
        const cardMinWidth = this.currentMode === 'compact' ? 280 : 
                           this.currentMode === 'detailed' ? 400 : 350;
        
        return Math.floor(containerWidth / cardMinWidth) || 1;
    }
}