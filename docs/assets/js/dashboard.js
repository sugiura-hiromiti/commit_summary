// Commit Summary Dashboard - Main Application

class CommitSummaryDashboard {
    constructor() {
        this.manifest = null;
        this.currentView = 'grid';
        this.searchTerm = '';
        this.theme = localStorage.getItem('theme') || 'light';
        this.searchDebounceTimer = null;
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.applyTheme();
        await this.loadManifest();
        this.renderDashboard();
    }
    
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Search with debouncing
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = setTimeout(() => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderRepositories();
            }, 300);
        });
        
        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        searchInput.focus();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                }
            }
        });
    }
    
    async loadManifest() {
        try {
            const response = await fetch('docs/data/manifest.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            this.manifest = await response.json();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading manifest:', error);
            this.showError(`Failed to load manifest: ${error.message}`);
        }
    }
    
    renderDashboard() {
        if (!this.manifest) return;
        
        this.renderStats();
        this.renderRepositories();
    }
    
    renderStats() {
        const stats = this.manifest.global_stats;
        
        // Animate numbers
        this.animateNumber('totalSummaries', stats.total_summaries);
        this.animateNumber('totalRepositories', stats.total_repositories);
        
        const lastUpdated = new Date(this.manifest.last_updated);
        document.getElementById('lastUpdated').textContent = this.formatRelativeTime(lastUpdated);
        document.getElementById('footerLastUpdated').textContent = this.formatDateTime(lastUpdated);
    }
    
    renderRepositories() {
        const container = document.getElementById('repositoriesGrid');
        container.innerHTML = '';
        
        if (!this.manifest) return;
        
        const repositories = Object.entries(this.manifest.repositories);
        const filteredRepos = this.filterRepositories(repositories);
        
        if (filteredRepos.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 20px;">🔍</div>
                    <h3>No repositories found</h3>
                    <p>Try adjusting your search terms or clear the search to see all repositories</p>
                    ${this.searchTerm ? `<button class="btn btn-secondary" onclick="dashboard.clearSearch()" style="margin-top: 15px;">Clear Search</button>` : ''}
                </div>
            `;
            return;
        }
        
        // Sort repositories by total summaries (descending)
        filteredRepos.sort((a, b) => b[1].total_summaries - a[1].total_summaries);
        
        filteredRepos.forEach(([repoName, repoData], index) => {
            const card = this.createRepositoryCard(repoName, repoData);
            // Stagger animation
            setTimeout(() => {
                container.appendChild(card);
            }, index * 100);
        });
    }
    
    filterRepositories(repositories) {
        if (!this.searchTerm) return repositories;
        
        return repositories.filter(([repoName, repoData]) => {
            const searchableText = [
                repoName,
                repoData.display_name,
                repoData.github_url,
                ...repoData.summaries.map(s => s.filename)
            ].join(' ').toLowerCase();
            
            return searchableText.includes(this.searchTerm);
        });
    }
    
    createRepositoryCard(repoName, repoData) {
        const card = document.createElement('div');
        card.className = 'repo-card fade-in';
        
        const latestSummary = repoData.summaries[0];
        const totalSize = repoData.summaries.reduce((sum, s) => sum + s.file_size, 0);
        const avgSize = Math.round(totalSize / repoData.summaries.length);
        
        // Calculate date range
        const dates = repoData.summaries.map(s => {
            // Extract date from filename
            const match = s.filename.match(/(\d{4})_(\d{2})_(\d{2})/);
            return match ? new Date(match[1], match[2] - 1, match[3]) : new Date();
        }).sort();
        
        const dateRange = dates.length > 1 ? 
            `${this.formatDate(dates[0])} - ${this.formatDate(dates[dates.length - 1])}` :
            this.formatDate(dates[0]);
        
        card.innerHTML = `
            <div class="repo-header">
                <div>
                    <h3 class="repo-title">${repoData.display_name}</h3>
                    <a href="${repoData.github_url}" target="_blank" rel="noopener" class="repo-url">
                        ${repoData.github_url.replace('https://github.com/', '')}
                    </a>
                </div>
            </div>
            
            <div class="repo-stats">
                <div class="repo-stat">
                    <div class="repo-stat-number">${repoData.total_summaries}</div>
                    <div class="repo-stat-label">Summaries</div>
                </div>
                <div class="repo-stat">
                    <div class="repo-stat-number">${this.formatFileSize(totalSize)}</div>
                    <div class="repo-stat-label">Total Size</div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px; padding: 15px; background: var(--bg-secondary); border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 5px;">Date Range</div>
                <div style="color: var(--text-primary); font-weight: 500;">${dateRange}</div>
            </div>
            
            <div class="repo-actions">
                <a href="${repoData.github_url}" target="_blank" rel="noopener" class="btn btn-primary">
                    🔗 Repository
                </a>
                <button class="btn btn-secondary" onclick="dashboard.showRepositorySummaries('${repoName}')">
                    📄 Summaries (${repoData.total_summaries})
                </button>
            </div>
        `;
        
        return card;
    }
    
    showRepositorySummaries(repoName) {
        const repoData = this.manifest.repositories[repoName];
        if (!repoData) return;
        
        // Sort summaries by filename (which includes date)
        const sortedSummaries = [...repoData.summaries].sort((a, b) => 
            b.filename.localeCompare(a.filename)
        );
        
        const summariesList = sortedSummaries.map(summary => {
            const size = this.formatFileSize(summary.file_size);
            const date = this.extractDateFromFilename(summary.filename);
            return `
                <li style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <a href="docs/summaries/${summary.filename}" target="_blank" style="font-weight: 600; color: #333; text-decoration: none;">
                                ${summary.filename.split('/')[1]}
                            </a>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 2px;">
                                ${date} • ${size}
                            </div>
                        </div>
                        <a href="docs/summaries/${summary.filename}" target="_blank" style="background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; text-decoration: none; font-size: 0.9rem;">
                            View
                        </a>
                    </div>
                </li>
            `;
        }).join('');
        
        const popup = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
        popup.document.write(`
            <html>
                <head>
                    <title>${repoData.display_name} - Commit Summaries</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                            padding: 20px; 
                            background: #f5f5f5;
                            margin: 0;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 20px;
                            border-radius: 12px;
                            margin-bottom: 20px;
                        }
                        ul { 
                            list-style: none; 
                            padding: 0; 
                        }
                        a:hover { 
                            opacity: 0.8; 
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2 style="margin: 0 0 10px 0;">${repoData.display_name} - Commit Summaries</h2>
                        <p style="margin: 0; opacity: 0.9;">${repoData.total_summaries} summaries • Total size: ${this.formatFileSize(repoData.summaries.reduce((sum, s) => sum + s.file_size, 0))}</p>
                    </div>
                    <ul>${summariesList}</ul>
                </body>
            </html>
        `);
    }
    
    switchView(view) {
        this.currentView = view;
        
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        if (view === 'timeline') {
            this.renderTimelineView();
        } else {
            this.renderRepositories();
        }
    }
    
    renderTimelineView() {
        const container = document.getElementById('repositoriesGrid');
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <div style="font-size: 3rem; margin-bottom: 20px;">📈</div>
                <h3>Timeline View</h3>
                <p>Timeline visualization is coming soon!</p>
                <p style="margin-top: 15px; font-size: 0.9rem;">This will show a chronological timeline of all commit summaries across repositories.</p>
            </div>
        `;
    }
    
    clearSearch() {
        document.getElementById('searchInput').value = '';
        this.searchTerm = '';
        this.renderRepositories();
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.theme);
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = this.theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
    
    hideLoading() {
        document.getElementById('loadingState').classList.add('hidden');
    }
    
    showError(message) {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorState').classList.remove('hidden');
    }
    
    // Utility methods
    animateNumber(elementId, targetNumber) {
        const element = document.getElementById(elementId);
        const duration = 1000;
        const start = 0;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (targetNumber - start) * progress);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    formatRelativeTime(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays <= 7) return `${diffDays}d ago`;
        if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}w ago`;
        
        return date.toLocaleDateString();
    }
    
    formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    formatDateTime(date) {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    extractDateFromFilename(filename) {
        const match = filename.match(/(\d{4})_(\d{2})_(\d{2})/);
        if (match) {
            const [, year, month, day] = match;
            return new Date(year, month - 1, day).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        return 'Unknown date';
    }
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new CommitSummaryDashboard();
});
