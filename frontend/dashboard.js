const user = localStorage.getItem('user');
const token = localStorage.getItem('token');

// if no user saved, redirect to login
if (!user) {
    window.location.href = 'index.html';
}

// verify session with backend
fetch('/welcome', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            window.location.href = 'index.html';
        }
    });

document.getElementById('username').textContent = user;

function signOut() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

function renderTicker(tickerData) {
    const track = document.getElementById('ticker-track');
    const validItems = tickerData.filter(item => item.price !== null); // checking ticker data is valid

    // build the items twice b2b so the CSS animation can loop seamlessly
    const html = validItems.map(item => `
        <div class="ticker-item">
            <span class="name">${item.name}</span>
            <span class="price">$${item.price.toFixed(2)}</span>
            <span class="change ${item.up ? 'up' : 'down'}">${item.up ? '+' : ''}${item.changePercent.toFixed(2)}%</span>
        </div>
    `).join('');

    track.innerHTML = html + html;
}

async function loadTicker() {
    const response = await fetch('/api/market-summary');
    const data = await response.json();

    if (data.success) {
        renderTicker(data.data);
    }
}

loadTicker();
// refresh every 60 seconds
setInterval(loadTicker, 60000);
