const form = document.getElementById('register-form');

// listen for form submission
form.addEventListener('submit', async function (e) {

    // prevent default form submission behavior (reload)
    e.preventDefault();

    // read user input
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // POST request to register endpoint
    const response = await fetch('https://web-app-backend-qh5w.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    // handle response
    const data = await response.json();

    if (data.success) {
        alert('Account created! Please sign in.');
        window.location.href = 'index.html';
    } else {
        alert(data.message); // show error message from backend as popup
    }
});
