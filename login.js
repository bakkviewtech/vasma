// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    
    // Clear previous error
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    
    // Validate inputs
    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }
    
    // Show loading state
    const loginBtn = document.querySelector('.login-btn');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;
    
    try {
        // Attempt login
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Store user session
            localStorage.setItem('vasma_token', data.token);
            localStorage.setItem('vasma_user', JSON.stringify(data.user));
            localStorage.setItem('vasma_login_time', new Date().toISOString());
            
            // Redirect to dashboard
            window.location.href = 'index.html';
        } else {
            showError(data.message || 'Invalid username or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please check if the server is running.');
    } finally {
        // Reset button state
        loginBtn.textContent = originalText;
        loginBtn.disabled = false;
    }
});

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Check if user is already logged in
function checkExistingSession() {
    const token = localStorage.getItem('vasma_token');
    const user = localStorage.getItem('vasma_user');
    const loginTime = localStorage.getItem('vasma_login_time');
    
    if (token && user && loginTime) {
        // Check if session is less than 8 hours old
        const hoursSinceLogin = (new Date() - new Date(loginTime)) / (1000 * 60 * 60);
        if (hoursSinceLogin < 8) {
            // Redirect to dashboard
            window.location.href = 'index.html';
        } else {
            // Clear expired session
            logout();
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('vasma_token');
    localStorage.removeItem('vasma_user');
    localStorage.removeItem('vasma_login_time');
}

// Check session on page load
checkExistingSession();

// Add enter key support
document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});