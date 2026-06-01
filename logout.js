// logout.js - Complete logout functionality

// Main logout function
function logout() {
    if (confirm('Are you sure you want to logout from VASMA System?')) {
        // Clear all session data
        localStorage.removeItem('vasma_token');
        localStorage.removeItem('vasma_user');
        localStorage.removeItem('vasma_login_time');
        
        // Clear any other application data
        sessionStorage.clear();
        
        // Clear any cached data
        if (window.caches) {
            caches.keys().then(function(names) {
                for (let name of names) {
                    caches.delete(name);
                }
            });
        }
        
        // Redirect to login page
        window.location.replace('login.html');
    }
}

// Make logout available globally
window.logout = logout;

// Auto logout after 30 minutes of inactivity
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        // Don't logout if on login page
        if (!window.location.pathname.includes('login.html')) {
            const token = localStorage.getItem('vasma_token');
            if (token) {
                logout();
                alert('You have been logged out due to inactivity.');
            }
        }
    }, 30 * 60 * 1000); // 30 minutes
}

// Track user activity
function initActivityTracking() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'click', 'touchstart', 'touchmove'];
    events.forEach(event => {
        document.addEventListener(event, resetInactivityTimer);
    });
    resetInactivityTimer();
}

// Initialize activity tracking when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initActivityTracking);
} else {
    initActivityTracking();
}

// Also logout when window is closed (optional)
window.addEventListener('beforeunload', () => {
    // Don't clear on refresh, only on close
    // This is handled by session expiry
});

console.log('Logout module loaded');