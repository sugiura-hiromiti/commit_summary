#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configuration
const SUMMARIES_DIR = 'docs/summaries';
const DATA_DIR = 'docs/data';
const OUTPUT_MANIFEST = path.join(DATA_DIR, 'manifest.json');
const OUTPUT_SEARCH_INDEX = path.join(DATA_DIR, 'search-index.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Repository configuration
const REPO_CONFIG = {
    'commit_summary': {
        display_name: 'Commit Summary',
        github_url: 'https://github.com/sugiura-hiromiti/commit_summary'
    },
    'config': {
        display_name: 'Config',
        github_url: 'https://github.com/sugiura-hiromiti/.config'
    },
    'oso': {
        display_name: 'OSO',
        github_url: 'https://github.com/sugiura-hiromiti/oso'
    }
};

// Parse HTML file to extract metadata
function parseHtmlFile(filePath, repoName) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(content);
        
        // Extract title
        const title = $('title').text() || path.basename(filePath, '.html');
        
        // Extract repository URL
        const repoLink = $('a[href*="github.com"]').first().attr('href') || REPO_CONFIG[repoName]?.github_url || '';
        
        // Extract tags
        const tags = [];
        $('.tag').each((i, el) => {
            const tagText = $(el).text().trim();
            if (tagText) tags.push(tagText);
        });
        
        // Extract commit count
        const commitCards = $('.commit-card').length;
        
        // Extract searchable text content
        const searchableText = $('body').text()
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .substring(0, 1000); // Limit for performance
            
        // Parse date from filename
        const dateMatch = path.basename(filePath).match(/(\d{4})_(\d{2})_(\d{2})_(\d{2})_(\d{2})_(\d{2})/);
        let date = new Date().toISOString();
        if (dateMatch) {
            const [, year, month, day, hour, minute, second] = dateMatch;
            date = new Date(year, month - 1, day, hour, minute, second).toISOString();
        }
        
        return {
            filename: path.relative('docs/summaries', filePath),
            date: date,
            title: title,
            commit_count: commitCards,
            tags: tags,
            file_size: fs.statSync(filePath).size,
            repository: repoName,
            github_url: repoLink,
            searchable_text: searchableText
        };
    } catch (error) {
        console.error(`Error parsing ${filePath}:`, error.message);
        return null;
    }
}

// Scan directory for HTML files
function scanDirectory(dirPath, repoName) {
    const files = [];
    
    if (!fs.existsSync(dirPath)) {
        return files;
    }
    
    const entries = fs.readdirSync(dirPath);
    
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile() && entry.endsWith('.html')) {
            const metadata = parseHtmlFile(fullPath, repoName);
            if (metadata) {
                files.push(metadata);
            }
        }
    }
    
    return files.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Generate manifest
function generateManifest() {
    const manifest = {
        last_updated: new Date().toISOString(),
        version: '1.0',
        repositories: {},
        global_stats: {
            total_summaries: 0,
            total_repositories: 0,
            date_range: {
                first: null,
                last: null
            }
        }
    };
    
    const searchIndex = {
        repositories: [],
        tags: new Set(),
        date_index: {},
        content_index: {}
    };
    
    // Process each repository
    for (const [repoName, repoConfig] of Object.entries(REPO_CONFIG)) {
        const repoDir = path.join(SUMMARIES_DIR, repoName);
        const summaries = scanDirectory(repoDir, repoName);
        
        if (summaries.length > 0) {
            // Repository stats
            const dates = summaries.map(s => new Date(s.date)).sort();
            const firstDate = dates[0];
            const lastDate = dates[dates.length - 1];
            
            manifest.repositories[repoName] = {
                display_name: repoConfig.display_name,
                github_url: repoConfig.github_url,
                total_summaries: summaries.length,
                date_range: {
                    first: firstDate.toISOString(),
                    last: lastDate.toISOString()
                },
                summaries: summaries
            };
            
            // Update global stats
            manifest.global_stats.total_summaries += summaries.length;
            
            if (!manifest.global_stats.date_range.first || firstDate < new Date(manifest.global_stats.date_range.first)) {
                manifest.global_stats.date_range.first = firstDate.toISOString();
            }
            
            if (!manifest.global_stats.date_range.last || lastDate > new Date(manifest.global_stats.date_range.last)) {
                manifest.global_stats.date_range.last = lastDate.toISOString();
            }
            
            // Build search index
            searchIndex.repositories.push(repoName);
            
            summaries.forEach(summary => {
                // Add tags
                summary.tags.forEach(tag => searchIndex.tags.add(tag));
                
                // Add to date index
                const dateKey = summary.date.substring(0, 7); // YYYY-MM
                if (!searchIndex.date_index[dateKey]) {
                    searchIndex.date_index[dateKey] = [];
                }
                searchIndex.date_index[dateKey].push(summary.filename);
                
                // Add to content index
                searchIndex.content_index[summary.filename] = {
                    title: summary.title,
                    tags: summary.tags,
                    repository: summary.repository,
                    date: summary.date,
                    searchable_text: summary.searchable_text
                };
            });
        }
    }
    
    manifest.global_stats.total_repositories = Object.keys(manifest.repositories).length;
    
    // Convert Set to Array for JSON serialization
    searchIndex.tags = Array.from(searchIndex.tags).sort();
    
    // Write files
    fs.writeFileSync(OUTPUT_MANIFEST, JSON.stringify(manifest, null, 2));
    fs.writeFileSync(OUTPUT_SEARCH_INDEX, JSON.stringify(searchIndex, null, 2));
    
    console.log(`✅ Generated manifest with ${manifest.global_stats.total_summaries} summaries from ${manifest.global_stats.total_repositories} repositories`);
    console.log(`📁 Manifest: ${OUTPUT_MANIFEST}`);
    console.log(`🔍 Search Index: ${OUTPUT_SEARCH_INDEX}`);
    
    return manifest;
}

// Run if called directly
if (require.main === module) {
    try {
        generateManifest();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error generating manifest:', error);
        process.exit(1);
    }
}

module.exports = { generateManifest };
