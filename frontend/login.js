const form = document.getElementById('login-form');

// listen for form submission
form.addEventListener('submit', async function (e) {

    // prevent default form submission behavior (reload)
    e.preventDefault();

    // read user input
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // POST request to login endpoint
    // https://web-app-backend-qh5w.onrender.com/login
    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    // handle response
    const data = await response.json();

    if (data.success) {
        localStorage.setItem('user', data.username);
        localStorage.setItem('token', data.token);
        window.location.href = 'welcome.html';
    } else {
        alert(data.message); // show error message from backend as popup
    }
});