// Function to load footer
function loadFooter() {
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => {
            console.log('Error loading footer:', error);
        });
}

// Load footer when DOM is ready
document.addEventListener('DOMContentLoaded', loadFooter);
