document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or use system preference
    const currentTheme = localStorage.getItem('theme') || 
                        (prefersDarkScheme.matches ? 'dark' : 'light');
    
    // Apply the theme
    document.body.classList.toggle('dark-theme', currentTheme === 'dark');
    if (themeToggle) {
        themeToggle.checked = currentTheme === 'dark';
    }
    
    // Save preference to localStorage and update UI
    function toggleTheme() {
        const newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', newTheme);
        
        // Send to server if user is logged in
        if (document.body.dataset.userId) {
            fetch('/users/theme', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ theme: newTheme })
            });
        }
    }
    
    // Event listener for toggle
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }
});