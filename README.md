# Image to WebP Converter

A modular web application for converting images to WebP format with a clean, modern interface.

## Features

- 🖼️ Convert multiple images to WebP format
- 📊 Real-time progress tracking
- 💾 Download converted images
- 👁️ Preview converted images
- 📱 Responsive design
- 🚀 Single HTML file build
- 🔄 Hot Module Reload development
- 🤖 Automated deployment with GitHub Actions

## Quick Start

### Development

1. Clone the repository:

```bash
git clone https://github.com/aakashdinkarh/image-convert.git
cd image-convert
```

2. Install dependencies:

```bash
npm install
```

3. Start development server with hot module reload:

```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser

### Build Process

The project includes a modular build system that creates a single HTML file with all assets bundled and optimized.

#### Option 1: Production Build (Recommended)

```bash
npm run build
```

This creates an optimized, minified build in the `dist/` directory.

#### Option 2: Development Build

```bash
npm run build:dev
```

This creates a development build with source maps and readable code.

#### Option 3: Development Server with Minified CSS

```bash
npm run dev:minified
```

This starts the development server with minified CSS for testing production-like conditions.

## Automated Deployment

The project includes GitHub Actions workflows for automated building and deployment.

### Automatic Deployment

1. **Push to deploy**: Simply push to your `main` or `master` branch
2. **Automatic build**: GitHub Actions will build your project
3. **Deploy to branch**: Files are deployed to `gh-pages` branch (or custom branch)
4. **Ready to host**: Your app is ready for static hosting

### Manual Deployment

You can also trigger deployment manually:

1. Go to your repository's "Actions" tab
2. Select "Build and Deploy" workflow
3. Click "Run workflow"
4. Enter your target branch name
5. Click "Run workflow"

### GitHub Pages Setup

To enable GitHub Pages hosting:

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "Deploy from a branch"
4. Select `gh-pages` branch
5. Save

Your app will be available at: `https://username.github.io/repo-name/`

## Project Structure

```
image-convert/
├── index.html              # Main HTML file
├── js/
│   ├── app.js              # Main application entry point
│   └── modules/
│       ├── FileProcessor.js # File handling logic
│       ├── ImageConverter.js # Image conversion logic
│       └── UI.js           # User interface management
├── styles/
│   └── main.css            # Application styles
├── build/                  # Build system directory
│   ├── build-config.js     # Build configuration
│   ├── build-utils.js      # Shared build utilities
│   ├── build.js            # Production build script
│   └── dev-server.js       # Development server script
├── .github/workflows/      # GitHub Actions workflows
│   ├── build-and-deploy.yml # Automated deployment
│   ├── build.yml           # Build validation
│   └── README.md           # Workflow documentation
└── package.json            # Project configuration
```

## Build System Architecture

The build system is modular and organized in a dedicated `build/` directory:

### **Core Files:**

- **`build/build-config.js`** - Centralized configuration for all build settings
- **`build/build-utils.js`** - Shared utilities for CSS processing, HTML manipulation, and output formatting
- **`build/build.js`** - Production build script that creates optimized output
- **`build/dev-server.js`** - Development server with hot module reload

### **Build Configuration (`build/build-config.js`):**

- File paths and directories
- esbuild configuration for development and production
- Development server settings
- HTML template replacements

### **Build Utilities (`build/build-utils.js`):**

- CSS minification
- HTML template processing
- File size statistics
- Build summary formatting
- Development server info display

### **What the build process does:**

1. **Bundles JavaScript**: Combines all ES6 modules into a single `bundle.js` file
2. **Inlines CSS**: Embeds all styles directly into the HTML
3. **Optimizes**: Minifies JavaScript and CSS for production builds
4. **Creates single HTML**: Generates a self-contained HTML file

### Build Modes

- **Production Build** (`npm run build` or `npm run build:prod`):

  - JavaScript minified and optimized
  - CSS minified
  - No source maps
  - Smallest file sizes

- **Development Build** (`npm run build:dev`):

  - Readable JavaScript code
  - Unminified CSS
  - Source maps included
  - Larger file sizes for debugging

- **Development Server** (`npm run dev`):

  - Hot module reload
  - Source maps for debugging
  - Fast rebuilds on file changes
  - Readable CSS

- **Development Server with Minified CSS** (`npm run dev:minified`):
  - Hot module reload
  - Source maps for debugging
  - Fast rebuilds on file changes
  - Minified CSS (production-like)

### Output

After building, you get:

- A single `index.html` file that contains everything needed
- No external dependencies (except for the API endpoint)
- Ready to serve from any web server or opened directly in a browser

## Testing

### Local Testing

After building, test the application by opening the HTML file directly:

```bash
# Open the built file in your browser
open dist/index.html
```

Or simply double-click the `dist/index.html` file in your file explorer.

### Development Testing

For development with hot module reload:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser. Any changes to your files will automatically reload the browser.

### Production Testing

The built files can be served from any web server:

- Apache
- Nginx
- GitHub Pages
- Netlify
- Vercel
- Any static file hosting service

## Deployment

### Automated Deployment (Recommended)

The GitHub Actions workflow handles deployment automatically:

1. **Push to main branch** - Triggers automatic build and deployment
2. **Files deployed** - Built files are pushed to `gh-pages` branch
3. **Ready to host** - Your app is ready for static hosting

### Manual Deployment

If you prefer manual deployment:

```bash
# Build the application (production mode)
npm run build

# Copy dist contents to your deployment branch/location
cp -r dist/* /path/to/your/deployment/directory/
```

## API Requirements

The application expects a backend API endpoint at `http://localhost:3001/api/image-convert` that:

- Accepts POST requests with image files
- Returns JSON with conversion results
- Supports WebP format conversion

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the build process
5. Submit a pull request

## Troubleshooting

### Build Issues

- Ensure Node.js 14+ is installed
- Run `npm install` to install dependencies
- Check that all source files exist

### Runtime Issues

- Check browser console for JavaScript errors
- Ensure the API endpoint is running and accessible
- Verify CORS settings if testing locally

### Deployment Issues

- Check GitHub Actions logs for build errors
- Ensure repository has proper permissions
- Verify GitHub Pages settings if using GitHub Pages
