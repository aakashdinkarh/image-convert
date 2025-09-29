#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const config = require('./build-config');

/**
 * Simple CSS minifier function
 * @param {string} css - CSS content to minify
 * @returns {string} Minified CSS
 */
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*{\s*/g, '{') // Remove spaces around braces
        .replace(/\s*}\s*/g, '}') // Remove spaces around braces
        .replace(/\s*:\s*/g, ':') // Remove spaces around colons
        .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
        .replace(/\s*,\s*/g, ',') // Remove spaces around commas
        .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
        .trim(); // Remove leading/trailing whitespace
}

/**
 * Process CSS file and optionally minify it
 * @param {string} cssPath - Path to CSS file
 * @param {boolean} shouldMinify - Whether to minify the CSS
 * @returns {Promise<string>} Processed CSS content
 */
async function processCSS(cssPath, shouldMinify = false) {
    let cssContent = await fs.readFile(cssPath, 'utf8');

    if (shouldMinify) {
        cssContent = minifyCSS(cssContent);
    }

    return cssContent;
}

/**
 * Process HTML template and inline CSS
 * @param {string} htmlPath - Path to HTML template
 * @param {string} cssContent - CSS content to inline
 * @param {string} scriptSrc - Script source to use
 * @param {boolean} isDevelopment - Whether this is a development build
 * @param {number} port - Development server port for hot reload
 * @returns {Promise<string>} Processed HTML content
 */
async function processHTML(htmlPath, cssContent, scriptSrc, isDevelopment = false, port = 3000) {
    let htmlContent = await fs.readFile(htmlPath, 'utf8');

    // Inline CSS
    htmlContent = htmlContent.replace(
        config.htmlReplacements.cssLink,
        `<style>${cssContent}</style>`
    );

    // Replace module script with bundled script
    htmlContent = htmlContent.replace(
        config.htmlReplacements.moduleScript,
        `<script src="${scriptSrc}"></script>`
    );

    // Add hot reload script for development
    if (isDevelopment) {
        const hotReloadScript = `
    <!-- Hot Reload Script for Development -->
    <script>
        // Only enable hot reload in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const eventSource = new EventSource('http://localhost:${port + 1}/hot-reload');
            
            eventSource.onopen = function() {
                console.log('🔥 Hot reload connected');
            };
            
            eventSource.onmessage = function(event) {
                const data = JSON.parse(event.data);
                if (data.type === 'hot-reload') {
                    console.log('🔥 Hot reload triggered for ' + data.fileType);
                    // Reload the page to show changes
                    window.location.reload();
                }
            };
            
            eventSource.onerror = function(error) {
                console.log('🔥 Hot reload error:', error);
            };
        }
    </script>`;

        // Insert hot reload script before the closing body tag
        htmlContent = htmlContent.replace('</body>', `${hotReloadScript}\n</body>`);
    }

    return htmlContent;
}

/**
 * Get file size statistics
 * @param {string} filePath - Path to file
 * @returns {Object} File stats with size in KB
 */
function getFileStats(filePath) {
    const stats = fs.statSync(filePath);
    return {
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2)
    };
}

/**
 * Print build summary
 * @param {Object} options - Build options
 * @param {string} options.outputDir - Output directory
 * @param {string} options.htmlPath - HTML file path
 * @param {string} options.bundlePath - Bundle file path
 * @param {boolean} options.isProduction - Whether this is a production build
 * @param {boolean} options.cssMinified - Whether CSS was minified
 */
function printBuildSummary({ outputDir, htmlPath, bundlePath, isProduction, cssMinified }) {
    const bundleStats = getFileStats(bundlePath);
    const htmlStats = getFileStats(htmlPath);
    const totalSize = bundleStats.size + htmlStats.size;

    console.log('✅ Build completed successfully!');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📄 HTML file: ${htmlPath}`);
    console.log(`📦 Bundle size: ${bundleStats.sizeKB} KB`);
    console.log(`📄 HTML size: ${htmlStats.sizeKB} KB`);
    console.log(`📊 Total size: ${(totalSize / 1024).toFixed(2)} KB`);

    console.log('');
    console.log('📋 Build Summary:');
    console.log('   ✅ JavaScript modules bundled into bundle.js');
    console.log('   ✅ CSS inlined into HTML');
    if (isProduction || cssMinified) {
        console.log('   ✅ JavaScript and CSS minified');
    }
    console.log('   ✅ Single HTML file created');
    console.log('   ✅ Ready for deployment to any static hosting service');
}

/**
 * Print development server info
 * @param {number} port - Server port
 * @param {boolean} cssMinified - Whether CSS is minified
 */
function printDevServerInfo(port, cssMinified = false) {
    console.log('✅ Ready! Hot reload enabled');
    if (cssMinified) {
        console.log('🔧 CSS minified');
    }
}

module.exports = {
    minifyCSS,
    processCSS,
    processHTML,
    getFileStats,
    printBuildSummary,
    printDevServerInfo
}; 