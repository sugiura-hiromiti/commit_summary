# 📊 Commit Summary Dashboard

A powerful, modern dashboard that serves as a search hub and statistics center for commit summary HTML files generated from multiple GitHub repositories.

## 🚀 Features

- **Repository Overview**: Display repository cards with key statistics
- **Search Hub**: Multi-criteria search across repositories, commits, and content
- **Statistics Dashboard**: Comprehensive analytics and metrics
- **Dark Mode**: Full theme support with user toggle
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Updates**: Automated manifest generation via GitHub Actions

## 📁 Project Structure

```
/
├── index.html                          # Main dashboard entry point
├── docs/                               # GitHub Pages source directory
│   ├── summaries/                      # Organized HTML files
│   │   ├── commit_summary/            # Commit summary files
│   │   ├── config/                    # Config repository files
│   │   └── oso/                       # OSO repository files
│   ├── data/                          # Generated data files
│   │   └── manifest.json              # File listing and metadata
│   └── assets/                        # Static assets
│       ├── css/
│       │   └── main.css               # Core styles
│       └── js/
│           └── dashboard.js           # Main dashboard logic
├── .github/
│   ├── workflows/
│   │   └── build-dashboard.yml        # Automated build process
│   └── scripts/
│       └── generate-manifest.sh       # Manifest generation script
└── README.md                          # This file
```

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+ Modules)
- **Styling**: CSS Grid + Flexbox + Custom Properties
- **Build Process**: GitHub Actions
- **Deployment**: GitHub Pages
- **Data Format**: JSON manifest with metadata

## 📊 Dashboard Features

### Repository Cards
- Total summaries count per repository
- File size statistics
- Date range information
- Direct links to GitHub repositories
- Quick access to individual summaries

### Search Functionality
- Real-time search with debouncing
- Search across repository names, filenames, and content
- Clear search functionality
- No results state with helpful messaging

### Statistics Overview
- Total summaries across all repositories
- Repository count
- Last updated timestamp
- Animated number counters

### Theme Support
- Light and dark mode toggle
- Persistent theme preference
- Smooth transitions
- Keyboard shortcuts (Ctrl/Cmd + D)

## 🚀 Getting Started

### Local Development

1. Clone the repository
2. Open `index.html` in a web browser
3. The dashboard will automatically load the manifest and display repositories

### GitHub Pages Deployment

The dashboard is automatically deployed via GitHub Actions:

1. Push changes to the main branch
2. GitHub Actions generates the manifest
3. Dashboard is deployed to GitHub Pages
4. Access via your GitHub Pages URL

## 🔧 Configuration

### Repository Configuration

Edit `.github/scripts/generate-manifest.sh` to add or modify repositories:

```bash
# Add new repository
process_repo "new_repo" "Display Name" "https://github.com/username/new_repo" "false"
```

### Styling Customization

Modify CSS custom properties in `docs/assets/css/main.css`:

```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --secondary-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    /* ... other variables */
}
```

## 📱 Responsive Design

The dashboard is fully responsive with:
- Mobile-first approach
- Touch-optimized interactions
- Collapsible sections on small screens
- Optimized typography and spacing

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + K`: Focus search input
- `Ctrl/Cmd + D`: Toggle dark mode

## 🔍 Search Features

- **Repository Search**: Find repositories by name or display name
- **Filename Search**: Search within commit summary filenames
- **Real-time Results**: Instant filtering as you type
- **Debounced Input**: Optimized performance with 300ms debounce

## 📈 Statistics

The dashboard provides comprehensive statistics:
- Total number of commit summaries
- Repository count
- File size analytics
- Date range information
- Last updated timestamps

## 🎨 Design System

### Color Scheme
- Primary gradient: Blue to purple
- Secondary gradient: Light blue to cyan
- Accent gradient: Green to teal
- Warning gradient: Pink to yellow

### Typography
- System fonts for optimal performance
- Responsive font sizes
- Proper contrast ratios for accessibility

### Layout
- CSS Grid for main layout
- Flexbox for component alignment
- Consistent spacing using CSS custom properties

## 🚀 Performance

- **Fast Loading**: Minimal dependencies, optimized assets
- **Efficient Search**: Debounced input, optimized filtering
- **Smooth Animations**: Hardware-accelerated transitions
- **Responsive Images**: Optimized for different screen sizes

## 🔧 Build Process

The GitHub Actions workflow:

1. **Checkout**: Get latest repository code
2. **Generate Manifest**: Scan HTML files and create metadata
3. **Build**: Prepare assets for deployment
4. **Deploy**: Push to GitHub Pages

## 📝 File Naming Convention

Normalized filename format:
- `{repository}_{YYYY}_{MM}_{DD}_{HH}_{MM}_{SS}.html`
- Example: `commit_summary_2025_07_15_12_54_22.html`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Links

- [GitHub Repository](https://github.com/sugiura-hiromiti/commit_summary)
- [Live Dashboard](https://sugiura-hiromiti.github.io/commit_summary)
- [Documentation](./RDD.md)
- [Technology Selection](./technology_selection.md)

## 📞 Support

If you encounter any issues or have questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include browser information and steps to reproduce

---

**Last Updated**: July 15, 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready
