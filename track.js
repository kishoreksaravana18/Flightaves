// Get flight data from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const flightData = {
    id: urlParams.get('id') || 'UNKNOWN',
    startCity: urlParams.get('from') || 'Origin',
    endCity: urlParams.get('to') || 'Destination',
    startAirport: urlParams.get('fromCode') || 'XXX',
    endAirport: urlParams.get('toCode') || 'YYY'
};

// Update page title
document.getElementById('route-title').textContent =
    `${flightData.startCity} → ${flightData.endCity}`;

// Generate mock data
function generatePriceData() {
    const data = {
        activeFlights: Math.floor(Math.random() * 50) + 10,
        priceHistory: [],
        calendar: [],
        cheapestFlights: []
    };

    // Generate 90-day price history
    let price = 400 + Math.random() * 300;
    for (let i = 0; i < 90; i++) {
        price += (Math.random() - 0.5) * 60;
        price = Math.max(250, Math.min(1200, price));
        data.priceHistory.push({
            day: i,
            price: Math.round(price)
        });
    }

    // Generate 30-day calendar
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        const dayPrice = Math.round(350 + Math.random() * 500);
        data.calendar.push({
            date: date,
            dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            price: dayPrice
        });
    }

    // Generate top 5 cheapest flights
    const flights = [];
    for (let i = 0; i < 20; i++) {
        const hour = Math.floor(Math.random() * 24);
        const min = Math.floor(Math.random() * 60).toString().padStart(2, '0');
        flights.push({
            time: `${hour}:${min}`,
            id: Math.random().toString(36).substr(2, 6).toUpperCase(),
            price: Math.round(300 + Math.random() * 600),
            date: data.calendar[Math.floor(Math.random() * 30)].dateStr
        });
    }
    data.cheapestFlights = flights.sort((a, b) => a.price - b.price).slice(0, 5);

    return data;
}

const priceData = generatePriceData();

// Calculate statistics
const currentPrice = priceData.priceHistory[priceData.priceHistory.length - 1].price;
const avgPrice = Math.round(
    priceData.priceHistory.reduce((sum, d) => sum + d.price, 0) / priceData.priceHistory.length
);
const bestPrice = Math.min(...priceData.calendar.map(d => d.price));
const priceDiff = currentPrice - avgPrice;
const trend = priceDiff > 0 ? '↑ Rising' : '↓ Falling';
const trendColor = priceDiff > 0 ? '#ff3366' : '#00ff88';

// Update overview stats
document.getElementById('active-flights').textContent = priceData.activeFlights;
document.getElementById('best-price').textContent = `$${bestPrice}`;
document.getElementById('avg-price').textContent = `$${avgPrice}`;
const trendEl = document.getElementById('trend');
trendEl.textContent = trend;
trendEl.style.color = trendColor;

// Render Price Calendar
const calendarContainer = document.getElementById('price-calendar');
const minCalPrice = Math.min(...priceData.calendar.map(d => d.price));
const maxCalPrice = Math.max(...priceData.calendar.map(d => d.price));

priceData.calendar.forEach(day => {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';

    // Mark best deals and expensive days
    if (day.price === minCalPrice) {
        dayEl.classList.add('best-deal');
    } else if (day.price > avgPrice * 1.2) {
        dayEl.classList.add('expensive');
    }

    dayEl.innerHTML = `
        <div class="day-date">${day.dayName}</div>
        <div class="day-date">${day.dateStr}</div>
        <div class="day-price">$${day.price}</div>
        ${day.price === minCalPrice ? '<div class="day-label" style="color: #00ff88;">Best Deal</div>' : ''}
    `;

    calendarContainer.appendChild(dayEl);
});

// Render Cheapest Flights
const cheapestContainer = document.getElementById('cheapest-list');
priceData.cheapestFlights.forEach((flight, index) => {
    const flightEl = document.createElement('div');
    flightEl.className = 'flight-item';
    flightEl.innerHTML = `
        <div class="flight-rank">#${index + 1}</div>
        <div class="flight-info">
            <div class="flight-time">${flight.date} at ${flight.time}</div>
            <div class="flight-id">Flight ${flight.id}</div>
        </div>
        <div class="flight-price">$${flight.price}</div>
        <button class="flight-action" onclick="alert('Booking feature coming soon!')">Book Now</button>
    `;
    cheapestContainer.appendChild(flightEl);
});

// Render 90-Day History Chart
const chartContainer = document.getElementById('history-chart');
const chartWidth = chartContainer.clientWidth - 40;
const chartHeight = 260;

const minHistPrice = Math.min(...priceData.priceHistory.map(d => d.price));
const maxHistPrice = Math.max(...priceData.priceHistory.map(d => d.price));
const priceRange = maxHistPrice - minHistPrice || 1;

const pathPoints = priceData.priceHistory.map((d, i) => {
    const x = (i / 89) * chartWidth;
    const y = chartHeight - ((d.price - minHistPrice) / priceRange) * chartHeight;
    return `${x},${y}`;
}).join(' ');

const chartSVG = `
    <svg width="100%" height="100%" viewBox="0 0 ${chartWidth} ${chartHeight}" preserveAspectRatio="none">
        <defs>
            <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#00f3ff" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="#00f3ff" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <!-- Area -->
        <path d="M0,${chartHeight} ${pathPoints.split(' ').map(p => 'L' + p).join(' ')} V${chartHeight} Z" 
              fill="url(#histGradient)" />
        <!-- Line -->
        <path d="M0,0 ${pathPoints.split(' ').map(p => 'L' + p).join(' ')}" 
              fill="none" stroke="#00f3ff" stroke-width="2" vector-effect="non-scaling-stroke"/>
        <!-- Average Line -->
        <line x1="0" y1="${chartHeight - ((avgPrice - minHistPrice) / priceRange) * chartHeight}" 
              x2="${chartWidth}" y2="${chartHeight - ((avgPrice - minHistPrice) / priceRange) * chartHeight}" 
              stroke="rgba(255,255,255,0.3)" stroke-dasharray="4" />
    </svg>
    <div style="position: absolute; bottom: 10px; left: 20px; font-size: 0.8rem; color: var(--text-muted);">
        90 days ago
    </div>
    <div style="position: absolute; bottom: 10px; right: 20px; font-size: 0.8rem; color: var(--text-muted);">
        Today
    </div>
    <div style="position: absolute; top: 10px; right: 20px; font-size: 0.8rem; color: rgba(255,255,255,0.5);">
        --- Average ($${avgPrice})
    </div>
`;

chartContainer.innerHTML = chartSVG;
