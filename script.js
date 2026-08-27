// Tab Switching Logic
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

// Theme Toggling Logic
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.src = 'assets/sun.png';
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.src = 'assets/moon.png';
    }
}

// Utility function to copy text to clipboard
function copyToClipboard(text, successMessage) {
    navigator.clipboard.writeText(text).then(() => {
        alert(successMessage);
    }).catch(err => {
        alert('Failed to copy.');
        console.error('Clipboard error:', err);
    });
}

// Render the Extension Cards
function renderExtensions(extensionsData) {
    const container = document.getElementById('card-container');
    container.innerHTML = ''; // Clear container

    extensionsData.forEach(ext => {
        // The URL constructor safely converts relative paths into absolute URLs 
        // specifically matching your GitHub Pages domain and repository path.
        const fullFileUrl = new URL(ext.file, window.location.href).href;
        const encodedUrl = encodeURIComponent(fullFileUrl);
        const guiUrl = `https://obeyorbehacked750-jpg.github.io/chipywarp-gui/?extension=${encodedUrl}`;

        const card = document.createElement('div');
        card.className = 'card';
        
        // Handle missing banners / authors
        const bannerSrc = ext.banner ? ext.banner : 'https://obeyorbehacked750-jpg.github.io/chipywarp-lab/banners/unknown.png';
        const authorText = ext.author ? `by ${ext.author}` : 'by ???';
        const badgeClass = ext.unsandboxed ? 'unsandboxed' : 'sandboxed';
        const badgeText = ext.unsandboxed ? 'Unsandboxed' : 'Sandboxed';

        card.innerHTML = `
            <img src="${bannerSrc}" class="card-banner" alt="${ext.name} Banner" onerror="this.src='https://obeyorbehacked750-jpg.github.io/chipywarp-lab/banners/unknown.png'">
            <div class="card-body">
                <h3>${ext.name}</h3>
                <p class="author">${authorText}</p>
                <p class="desc">${ext.description || 'No description provided.'}</p>
                <span class="badge ${badgeClass}">${badgeText}</span>
            </div>
            <div class="card-footer">
                <button onclick="copyToClipboard('// Code for ${ext.name}\\nfetch(\\'${fullFileUrl}\\').then(r=>r.text()).then(eval);', 'Code copied!')">Copy Code</button>
                <button onclick="copyToClipboard('${fullFileUrl}', 'URL Copied!')">Copy Url</button>
                <button onclick="window.open('${guiUrl}', '_blank')">Open Extension</button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Fetch the JSON file and initialize
async function loadExtensions() {
    try {
        const response = await fetch('extensions.json');
        if (!response.ok) throw new Error('Crash! Please report that error');
        
        const extensionsData = await response.json();
        renderExtensions(extensionsData);
    } catch (error) {
        console.error('Error loading extensions:', error);
        document.getElementById('card-container').innerHTML = 
            '<p style="color: red;">Failed to load extensions!</p>';
    }
}

// Initialize on page load
window.onload = () => {
    loadExtensions();
};
