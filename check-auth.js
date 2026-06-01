// Check authentication for protected pages
function checkAuthentication() {
    const token = localStorage.getItem('vasma_token');
    const user = localStorage.getItem('vasma_user');
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return false;
    }
    
    // Optional: Verify token with server
    fetch('/api/auth/verify', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).catch(() => {
        // If verification fails, logout
        localStorage.clear();
        window.location.href = 'login.html';
    });
    
    return true;
}

// Call on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuthentication);
} else {
    checkAuthentication();
}