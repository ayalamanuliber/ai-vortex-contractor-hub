/**
 * CALENDAR COMPONENT - Visual calendar with optimal timing highlights
 */
class CalendarComponent {
    constructor(operationsManager) {
        this.ops = operationsManager;
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        document.getElementById('calendar-prev').addEventListener('click', () => this.previousMonth());
        document.getElementById('calendar-next').addEventListener('click', () => this.nextMonth());
    }

    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.render();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.render();
    }

    render() {
        const monthElement = document.getElementById('calendar-month');
        const gridElement = document.getElementById('calendar-grid');
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        
        monthElement.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // Generate calendar grid
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startingDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        let calendarHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            calendarHTML += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Add days of the month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDay = new Date(this.currentYear, this.currentMonth, day);
            const isToday = currentDay.toDateString() === today.toDateString();
            const hasEvents = this.hasEventsOnDay(currentDay);
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}" 
                     data-date="${currentDay.toISOString().split('T')[0]}">
                    <div class="day-number">${day}</div>
                    ${hasEvents ? this.renderDayEvents(currentDay) : ''}
                </div>
            `;
        }
        
        gridElement.innerHTML = calendarHTML;
        this.setupDayClickHandlers();
    }

    hasEventsOnDay(date) {
        // Placeholder: Check if there are any campaigns scheduled for this day
        return Math.random() > 0.7; // Simulate some days having events
    }

    renderDayEvents(date) {
        // Placeholder: Render event indicators
        const eventCount = Math.floor(Math.random() * 5) + 1;
        return `<div class="day-events">${eventCount}</div>`;
    }

    setupDayClickHandlers() {
        document.querySelectorAll('.calendar-day:not(.empty)').forEach(day => {
            day.addEventListener('click', (e) => {
                const date = e.currentTarget.dataset.date;
                this.onDayClick(date);
            });
        });
    }

    onDayClick(date) {
        console.log('Calendar day clicked:', date);
        // Show contractors scheduled for this day
    }

    update(dashboardData) {
        // Update calendar with new data
        this.render();
    }
}