#!/usr/bin/env node

const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');
const http = require('http');
const { processCSS, processHTML, printDevServerInfo } = require('./build-utils');
const config = require('./build-config');

const rootPath = path.join(__dirname, '..');
const getPath = (_path) => path.join(rootPath, _path);

const outputDir = getPath(config.paths.devOutputDir);
const getOutputPath = (_path) => path.join(outputDir, _path);

async function startDevServer() {
    const port = config.devServer.port;
    const htmlPath = getPath(config.paths.htmlTemplate);
    const cssPath = getPath(config.paths.cssFile);
    const shouldMinifyCSS = process.argv.includes('--minify-css');

    console.log(`🚀 Dev server: http://localhost:${port}`);
    if (shouldMinifyCSS) {
        console.log('🔧 CSS minification enabled');
    }

    try {
        // Clean and create output directory
        await fs.remove(outputDir);
        await fs.ensureDir(outputDir);

        // Process CSS
        const cssPath = getPath(config.paths.cssFile);
        const cssContent = await processCSS(cssPath, shouldMinifyCSS);

        // Process HTML
        const htmlPath = getPath(config.paths.htmlTemplate);
        const htmlContent = await processHTML(htmlPath, cssContent, '/bundle.js', true, port);

        // Write the HTML file
        const outputHtmlPath = getOutputPath('index.html');
        await fs.writeFile(outputHtmlPath, htmlContent);

        // Start esbuild dev server

        const ctx = await esbuild.context({
            entryPoints: [getPath(config.paths.entryPoint)],
            outfile: getOutputPath('bundle.js'),
            ...config.esbuild
        });

        // Start the dev server
        await ctx.serve({
            servedir: getPath(config.devServer.servedir),
            port: port
        });

        // Create Server-Sent Events server for hot reload
        const sseServer = http.createServer((req, res) => {
            if (req.url === '/hot-reload') {
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Cache-Control'
                });

                // Send initial connection message
                res.write('data: {"type":"connected"}\n\n');

                // Store the response object for later use
                sseClients.push(res);

                req.on('close', () => {
                    const index = sseClients.indexOf(res);
                    if (index > -1) {
                        sseClients.splice(index, 1);
                    }
                });
            } else {
                res.writeHead(404);
                res.end();
            }
        });

        const sseClients = [];
        sseServer.listen(port + 1);

        // Print dev server info
        printDevServerInfo(port, shouldMinifyCSS);

        // Debounce timers and rebuild state
        let cssDebounceTimer = null;
        let htmlDebounceTimer = null;
        let isRebuilding = false;

        // Function to rebuild CSS and HTML
        async function rebuildAssets(fileType) {
            // Prevent concurrent rebuilds
            if (isRebuilding) {
                return;
            }

            isRebuilding = true;
            try {
                // Process CSS
                const cssContent = await processCSS(cssPath, shouldMinifyCSS);

                // Process HTML
                const htmlContent = await processHTML(htmlPath, cssContent, '/bundle.js', true, port);

                // Write the HTML file
                const outputHtmlPath = getOutputPath('index.html');
                await fs.writeFile(outputHtmlPath, htmlContent);

                console.log(`🔄 ${fileType} updated`);

                // Send hot reload message to all connected SSE clients
                sseClients.forEach(client => {
                    client.write(`data: ${JSON.stringify({
                        type: 'hot-reload',
                        fileType: fileType,
                        timestamp: Date.now()
                    })}\n\n`);
                });
            } catch (error) {
                console.error('❌ Failed to rebuild assets:', error);
            } finally {
                isRebuilding = false;
            }
        }

        // Watch for file changes including CSS and HTML
        await ctx.watch();

        // Watch CSS and HTML files using Node's built-in fs.watch
        // Watch CSS file
        fs.watch(cssPath, async (eventType, filename) => {
            if (eventType === 'change') {
                // Clear existing timer
                if (cssDebounceTimer) {
                    clearTimeout(cssDebounceTimer);
                }
                // Set new timer to debounce multiple events
                cssDebounceTimer = setTimeout(() => {
                    // Clear the timer reference
                    cssDebounceTimer = null;
                    rebuildAssets('CSS');
                }, 300);
            }
        });

        // Watch HTML template
        fs.watch(htmlPath, async (eventType, filename) => {
            if (eventType === 'change') {
                // Clear existing timer
                if (htmlDebounceTimer) {
                    clearTimeout(htmlDebounceTimer);
                }
                // Set new timer to debounce multiple events
                htmlDebounceTimer = setTimeout(() => {
                    // Clear the timer reference
                    htmlDebounceTimer = null;
                    rebuildAssets('HTML');
                }, 300);
            }
        });

    } catch (error) {
        console.error('❌ Failed to start development server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    process.exit(0);
});

startDevServer(); 