const form = document.getElementById('login-form');

form.addEventListener('submit', async function(e) {
    
    e.preventDefault();

    // read users input
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // send request to server
    const response = await fetch('https://web-app-backend-qh5w.onrender.com/login', {
        
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    
    });

    // handle response
    const data = await response.json();

    if (data.success) {
        
        localStorage.setItem('user', data.username);
        window.location.href = 'welcome.html';
    
    } else {
        
        alert(data.message);
    
    }
});