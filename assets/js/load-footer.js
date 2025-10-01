// Footer Loader - Loads footer from external footer.html file
(function() {
    'use strict';
    
    function loadFooter() {
        // Create placeholder for footer if it doesn't exist
        let footerContainer = document.getElementById('footer-placeholder');
        
        if (!footerContainer) {
            // Create footer placeholder at the end of body
            footerContainer = document.createElement('div');
            footerContainer.id = 'footer-placeholder';
            document.body.appendChild(footerContainer);
        }
        
        // Fetch footer content
        fetch('footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Footer file not found');
                }
                return response.text();
            })
            .then(html => {
                footerContainer.innerHTML = html;
            })
            .catch(error => {
                console.warn('Could not load footer:', error);
                // Fallback footer content
                footerContainer.innerHTML = `
                    <footer>
                        <div class="container">
                            <div class="row">
                                <div class="copyright span12">
                                    <p style="text-align: center;">©2020 S.P Industries - All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    </footer>
                `;
            });
    }
    
    // Load footer when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadFooter);
    } else {
        loadFooter();
    }
    
})();
