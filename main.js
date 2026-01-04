// Initial Configuration
const AIRPORTS = [
    { name: 'JFK', lat: 40.6413, lng: -73.7781, city: 'New York' },
    { name: 'LHR', lat: 51.4700, lng: -0.4543, city: 'London' },
    { name: 'HND', lat: 35.5494, lng: 139.7798, city: 'Tokyo' },
    { name: 'DXB', lat: 25.2532, lng: 55.3657, city: 'Dubai' },
    { name: 'LAX', lat: 33.9416, lng: -118.4085, city: 'Los Angeles' },
    { name: 'CDG', lat: 49.0097, lng: 2.5479, city: 'Paris' },
    { name: 'SIN', lat: 1.3644, lng: 103.9915, city: 'Singapore' },
    { name: 'SYD', lat: -33.9399, lng: 151.1753, city: 'Sydney' },
    { name: 'BOM', lat: 19.0896, lng: 72.8656, city: 'Mumbai' },
    { name: 'GRU', lat: -23.4356, lng: -46.4731, city: 'São Paulo' },
    { name: 'CPT', lat: -33.9389, lng: 18.6017, city: 'Cape Town' },
    { name: 'PEK', lat: 40.0799, lng: 116.6031, city: 'Beijing' },
    { name: 'FRA', lat: 50.0379, lng: 8.5622, city: 'Frankfurt' },
    { name: 'AMS', lat: 52.3105, lng: 4.7683, city: 'Amsterdam' },
    { name: 'IST', lat: 41.2753, lng: 28.7519, city: 'Istanbul' },
    { name: 'SFO', lat: 37.6213, lng: -122.3790, city: 'San Francisco' },
    { name: 'HKG', lat: 22.3080, lng: 113.9185, city: 'Hong Kong' },
    { name: 'YVR', lat: 49.1967, lng: -123.1815, city: 'Vancouver' },
    { name: 'MEX', lat: 19.4361, lng: -99.0719, city: 'Mexico City' },
    { name: 'KUL', lat: 2.7456, lng: 101.7072, city: 'Kuala Lumpur' }
];

// Random Generative Helper
function randomAirport() {
    return AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
}

function generateFlight() {
    let start = randomAirport();
    let end = randomAirport();
    while (start.name === end.name) {
        end = randomAirport();
    }

    // Calculate distance approx to set realistic animation speed
    // Longer distance = longer animation time? Or faster "plane"?
    // Usually planes fly at const speed, so longer dist = longer time.
    const dx = start.lat - end.lat;
    const dy = start.lng - end.lng;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Base speed + variance. Time in ms.
    // Map distance (approx 0-180+) to time.
    // e.g. dist 100 -> 2000ms. dist 10 -> 500ms.
    const animTime = 1000 + (dist * 20);

    // Colors: Teal, Magenta, Blue
    const colors = ['#00f3ff', '#ff00aa', '#0099ff', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return {
        id: Math.random().toString(36).substr(2, 9),
        startLat: start.lat,
        startLng: start.lng,
        endLat: end.lat,
        endLng: end.lng,
        startAirport: start.name,
        endAirport: end.name,
        startCity: start.city,
        endCity: end.city,
        speed: animTime, // Used for arcDashAnimateTime
        color: color
    };
}

// State
let flights = Array.from({ length: 1500 }, generateFlight);
let autoRotate = true;

// DOM Elements
const flightCountEl = document.getElementById('flight-count');
const btnRotate = document.getElementById('btn-rotate');
const btnView2d = document.getElementById('btn-view-2d');
const btnTheme = document.getElementById('btn-theme');
const tooltip = document.getElementById('tooltip');

// Initialize Globe
const world = Globe()
    (document.getElementById('globeViz'))
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
    .pointOfView({ lat: 20, lng: 0, altitude: 2.5 })
    .arcColor(f => f.color)
    .arcDashLength(0.4)
    .arcDashGap(0.2) // Increased gap to make individual 'planes' visible
    .arcDashAnimateTime(f => f.speed)
    .arcStroke(0.6)
    // Add rings at airports to show activity
    .ringsData(AIRPORTS)
    .ringColor(() => '#00f3ff')
    .ringMaxRadius(3)
    .ringPropagationSpeed(2)
    .ringRepeatPeriod(1000)
    .arcsData(flights)
    .onGlobeClick(() => {
        if (autoRotate) {
            autoRotate = false;
            btnRotate.classList.remove('active');
        }
    });

// Update Loop




// Interactions
btnRotate.addEventListener('click', () => {
    autoRotate = !autoRotate;
    btnRotate.classList.toggle('active');
});

btnView2d.addEventListener('click', () => {
    alert("Projection switching coming in v2. Currently optimized for 3D Globe.");
});

let isDark = true;
btnTheme.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
        world.globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
            .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png');
    } else {
        world.globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
            .backgroundImageUrl(null);
        document.body.style.backgroundColor = '#ffffff';
    }
});

// Search Logic
const searchInput = document.getElementById('flight-search');
const searchResults = document.getElementById('search-results');

// Flight Details Logic
let selectedFlightId = null;

function filterFlights(query) {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return flights.filter(f =>
        f.id.toLowerCase().includes(lowerQuery) ||
        f.startAirport.toLowerCase().includes(lowerQuery) ||
        f.endAirport.toLowerCase().includes(lowerQuery) ||
        f.startCity.toLowerCase().includes(lowerQuery) ||
        f.endCity.toLowerCase().includes(lowerQuery)
    ).slice(0, 5); // Limit to 5 results
}

const searchBox = document.querySelector('.search-box');

function renderSearchResults(results) {
    if (results.length === 0) {
        searchResults.classList.remove('active');
        searchBox.classList.remove('has-results');
        return;
    }

    searchResults.innerHTML = '';
    results.forEach(f => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
            <div class="result-id">✈ ${f.id.toUpperCase()}</div>
            <div class="result-route">
                ${f.startCity} (${f.startAirport}) ➝ ${f.endCity} (${f.endAirport})
            </div>
        `;
        item.addEventListener('click', () => selectFlight(f));
        searchResults.appendChild(item);
    });

    // Show results
    searchResults.classList.add('active');
    searchBox.classList.add('has-results');
}

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length === 0) {
        searchResults.classList.remove('active');
        searchBox.classList.remove('has-results');
        return;
    }
    const results = filterFlights(query);
    renderSearchResults(results);
});

// Close search if clicked outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-panel')) {
        searchResults.classList.remove('active');
        searchBox.classList.remove('has-results');
    }
});

function selectFlight(flight) {
    selectedFlightId = flight.id;
    // Hide results
    searchResults.classList.remove('active');
    searchBox.classList.remove('has-results');
    searchInput.value = flight.id.toUpperCase();

    // Calculate smarter midpoint handling date-line crossing
    let startLng = flight.startLng;
    let endLng = flight.endLng;
    let dLng = endLng - startLng;

    // Adjust for shortest path (dateline crossing)
    if (Math.abs(dLng) > 180) {
        if (dLng > 0) dLng -= 360;
        else dLng += 360;
    }

    const midLng = startLng + dLng / 2;
    const midLat = (flight.startLat + flight.endLat) / 2;

    // Calculate distance for dynamic zoom (approximate in degrees)
    // Sqrt of squares matches the generateFlight logic roughly
    const dist = Math.sqrt(Math.pow(dLng, 2) + Math.pow(flight.endLat - flight.startLat, 2));

    // Dynamic altitude: Closer for short flights, further for long ones
    // Range: 0.1 (very close) to 2.5 (full earth)
    // Map dist 0->180 to alt 0.5->2.5
    let targetAlt = 0.5 + (dist / 180) * 2.0;
    targetAlt = Math.min(Math.max(targetAlt, 0.8), 2.5); // Clamp

    // Stop rotation
    autoRotate = false;
    btnRotate.classList.remove('active');

    // Smooth Fly-to
    world.pointOfView({
        lat: midLat,
        lng: midLng,
        altitude: targetAlt
    }, 2500); // 2.5s smooth transition

    // Highlight effect
    // We delay the heavy data update slightly to ensure the camera tween creates the first frame smoothly.
    setTimeout(() => {
        const highlightColor = '#ffcc00';
        world.arcColor(f => {
            if (f.id === flight.id) return highlightColor;
            return 'rgba(255, 255, 255, 0.05)'; // Ghostly dim for others
        });

        // Force arc update to apply colors
        world.arcsData(flights);
    }, 100);

    // Create details card if not exists
    showFlightDetails(flight);
}

// Update Loop
function update() {
    // Only respawn/churn flights if we are NOT focusing on a specific one.
    // This prevents jitter/lag during the "focused" view.
    if (!selectedFlightId) {
        // Slowly churn flights to simulate real-time schedule changes
        if (Math.random() < 0.1) {
            const idx = Math.floor(Math.random() * flights.length);
            flights[idx] = generateFlight();

            // Update data
            world.arcsData(flights);
            flightCountEl.innerText = flights.length.toLocaleString();
        }
    }

    // Auto Rotate
    if (autoRotate) {
        world.controls().autoRotate = true;
        world.controls().autoRotateSpeed = 0.5;
    } else {
        world.controls().autoRotate = false;
    }

    requestAnimationFrame(update);
}

function showFlightDetails(flight) {
    // Remove existing
    const existing = document.querySelector('.flight-details-card');
    if (existing) existing.remove();

    // --- 1. Generate Financial Data ---

    // Price History (30 Days)
    const priceHistory = [];
    let price = 400 + Math.random() * 400; // Base volatility
    for (let i = 0; i < 30; i++) {
        price += (Math.random() - 0.5) * 60;
        price = Math.max(250, Math.min(1200, price));
        priceHistory.push(Math.round(price));
    }
    const currentPrice = priceHistory[29];
    const avgPrice = Math.round(priceHistory.reduce((a, b) => a + b, 0) / 30);
    const minPrice = Math.min(...priceHistory);
    const maxPrice = Math.max(...priceHistory);

    // Cost Breakdown
    const baseFare = Math.round(currentPrice * 0.72);
    const taxes = Math.round(currentPrice * 0.18);
    const fees = currentPrice - baseFare - taxes;

    // Analytics Logic
    let dealRating = 'Fair';
    let dealColor = '#ffd700'; // Gold
    let advice = 'Monitor';

    if (currentPrice < avgPrice * 0.85) {
        dealRating = 'Excellent';
        dealColor = '#00ff88'; // Green
        advice = 'BOOK NOW - Price likely to rise';
    } else if (currentPrice > avgPrice * 1.15) {
        dealRating = 'Poor';
        dealColor = '#ff3366'; // Red
        advice = 'WAIT - Prices inflated';
    }

    // --- 2. Generate Chart SVG ---
    const range = maxPrice - minPrice || 1;
    const width = 280;
    const height = 70;
    const pathPoints = priceHistory.map((p, i) => {
        const x = (i / 29) * width;
        const y = height - ((p - minPrice) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const chartSVG = `
        <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <defs>
                <linearGradient id="chartGradient_${flight.id}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${dealColor}" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="${dealColor}" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <!-- Background Area -->
            <path d="M0,${height} ${pathPoints.split(' ').map(p => 'L' + p).join(' ')} V${height} Z" fill="url(#chartGradient_${flight.id})" />
            <!-- Line -->
            <path d="M0,0 ${pathPoints.split(' ').map(p => 'L' + p).join(' ')}" fill="none" stroke="${dealColor}" stroke-width="2" vector-effect="non-scaling-stroke"/>
            <!-- Average Line -->
            <line x1="0" y1="${height - ((avgPrice - minPrice) / range) * height}" x2="${width}" y2="${height - ((avgPrice - minPrice) / range) * height}" stroke="rgba(255,255,255,0.3)" stroke-dasharray="4" />
        </svg>
    `;

    // --- 3. Build HTML Structure ---
    const card = document.createElement('div');
    card.className = 'flight-details-card glass-panel expanded-card';
    card.innerHTML = `
        <div class="detail-header">
            <div style="display:flex; flex-direction:column; gap:2px;">
                 <h2>Flight ${flight.id.toUpperCase()}</h2>
                 <span style="font-size:0.8rem; color:var(--text-muted);">${flight.startCity} ➝ ${flight.endCity}</span>
            </div>
            <button class="close-btn" onclick="this.closest('.flight-details-card').remove(); clearSelection();">×</button>
        </div>

        <div class="financial-grid">
            <!-- Deal Rating -->
            <div class="deal-badge" style="border-color: ${dealColor}">
                <span class="rating-label" style="color: ${dealColor}">${dealRating} Value</span>
                <span class="current-price" style="font-size:1.4rem;">$${currentPrice}</span>
            </div>
            
            <!-- Advice Box -->
            <div class="advice-box">
                <span class="iconify" data-icon="carbon:idea" style="flex-shrink:0;"></span>
                <span style="font-size:0.85rem; line-height:1.2;">${advice}</span>
            </div>
        </div>

        <div class="chart-section" style="margin-top:1rem;">
            <div class="chart-header" style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                <span style="font-size:0.9rem; color:var(--text-muted);">30-Day Trend</span>
                <span style="font-size: 0.8rem; opacity: 0.7">Avg: $${avgPrice}</span>
            </div>
            <div class="chart-container" style="border-color: ${dealColor}40">
                ${chartSVG}
                <div class="chart-tooltip" style="display: none;"></div>
                <div class="chart-cursor" style="display: none;"></div>
            </div>
        </div>

        <div class="breakdown-section" style="margin-top:1.2rem;">
            <h3 style="font-size:0.95rem; color:var(--primary); margin-bottom:0.5rem;">Cost Breakdown</h3>
            <div class="cost-row" style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.3rem;">
                <span style="color:var(--text-muted);">Base Fare</span>
                <span>$${baseFare}</span>
            </div>
            <div class="cost-row" style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.3rem;">
                <span style="color:var(--text-muted);">Taxes & Levies</span>
                <span>$${taxes}</span>
            </div>
            <div class="cost-row" style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.3rem;">
                <span style="color:var(--text-muted);">Carrier Fees</span>
                <span>$${fees}</span>
            </div>
            <div class="divider"></div>
            <div class="cost-row total" style="display:flex; justify-content:space-between; font-size:1rem; font-weight:600;">
                <span>Total Cost</span>
                <span style="color: ${dealColor}">$${currentPrice}</span>
            </div>
        </div>
        
        <div class="action-section" style="margin-top:1.5rem; display:flex; gap:0.5rem;">
            <button class="action-btn" style="flex:1; background: ${dealColor}; color: #000; padding:0.8rem; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Book Ticket</button>
            <button class="action-btn secondary" style="flex:1; background:rgba(255,255,255,0.1); color:#fff; padding:0.8rem; border:1px solid rgba(255,255,255,0.1); border-radius:8px; font-weight:600; cursor:pointer;">Track Price</button>
        </div>
    `;

    document.querySelector('.ui-overlay').appendChild(card);

    // --- 4. Chart Interaction ---
    const chartContainer = card.querySelector('.chart-container');
    const tooltip = card.querySelector('.chart-tooltip');
    const cursor = card.querySelector('.chart-cursor');

    if (chartContainer) {
        chartContainer.addEventListener('mousemove', (e) => {
            const rect = chartContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const containerWidth = rect.width;

            const index = Math.min(29, Math.max(0, Math.floor((x / containerWidth) * 30)));
            const p = priceHistory[index];

            cursor.style.left = `${x}px`;
            cursor.style.display = 'block';

            // Tooltip bounds check
            let tooltipX = x;
            if (x > containerWidth - 50) tooltipX = containerWidth - 50;
            if (x < 50) tooltipX = 50;

            tooltip.style.left = `${tooltipX}px`;
            tooltip.innerText = `$${p}`;
            tooltip.style.display = 'block';
        });
        chartContainer.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
            cursor.style.display = 'none';
        });
    }

    // --- 5. Action Button Handlers ---
    const trackBtn = card.querySelector('.action-btn.secondary');
    if (trackBtn) {
        trackBtn.addEventListener('click', () => {
            // Build URL with flight parameters
            const trackUrl = `track.html?id=${encodeURIComponent(flight.id)}&from=${encodeURIComponent(flight.startCity)}&to=${encodeURIComponent(flight.endCity)}&fromCode=${encodeURIComponent(flight.startAirport)}&toCode=${encodeURIComponent(flight.endAirport)}`;
            window.open(trackUrl, '_blank');
        });
    }
}

window.clearSelection = function () {
    selectedFlightId = null;
    // Reset colors
    world.arcColor(f => f.color);
    world.arcsData(flights); // Apply reset colors

    // Restart rotation
    autoRotate = true;
    btnRotate.classList.add('active');
}

// Window Resize Handling
window.addEventListener('resize', () => {
    world.width(window.innerWidth);
    world.height(window.innerHeight);
});

// Start Animation Loop
update();
