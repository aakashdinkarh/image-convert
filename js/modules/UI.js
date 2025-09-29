/**
 * Handles all UI interactions and updates
 */
export class UI {
    constructor() {
        this.fileInput = document.getElementById('fileInput');
        this.convertButton = document.getElementById('convertButton');
        this.output = document.getElementById('output');
        this.progressContainer = document.getElementById('progressContainer');
        this.fileList = document.getElementById('fileList');
        this.instructionsSection = document.getElementById('instructionsSection');
        this.instructionsHeader = document.getElementById('instructionsHeader');
        this.collapseToggle = document.getElementById('collapseToggle');

        this.initializeInstructions();
    }

    /**
     * Initialize instructions section with localStorage functionality
     */
    initializeInstructions() {
        const visitCount = this.getVisitCount();

        // If user has visited more than once, collapse instructions by default
        if (visitCount > 1) {
            this.collapseInstructions();
        }

        // Add click event listener to toggle instructions
        this.instructionsHeader.addEventListener('click', () => {
            this.toggleInstructions();
        });
    }

    /**
     * Get visit count from localStorage
     * @returns {number} Number of times user has visited
     */
    getVisitCount() {
        const count = localStorage.getItem('imageConvert_visitCount');
        return count ? parseInt(count, 10) : 0;
    }

    /**
     * Increment visit count in localStorage
     */
    incrementVisitCount() {
        const currentCount = this.getVisitCount();
        localStorage.setItem('imageConvert_visitCount', (currentCount + 1).toString());

        // If this is the second visit, collapse instructions
        if (currentCount === 1) {
            this.collapseInstructions();
        }
    }

    /**
     * Toggle instructions visibility
     */
    toggleInstructions() {
        if (this.instructionsSection.classList.contains('collapsed')) {
            this.expandInstructions();
        } else {
            this.collapseInstructions();
        }
    }

    /**
     * Collapse instructions section
     */
    collapseInstructions() {
        this.instructionsSection.classList.add('collapsed');
    }

    /**
     * Expand instructions section
     */
    expandInstructions() {
        this.instructionsSection.classList.remove('collapsed');
    }

    /**
     * Show progress container
     */
    showProgress() {
        this.progressContainer.style.display = 'block';
        this.convertButton.disabled = true;
    }

    /**
     * Hide progress container
     */
    hideProgress() {
        this.progressContainer.style.display = 'none';
    }

    /**
     * Enable convert button
     */
    enableConvertButton() {
        this.convertButton.disabled = false;
    }

    /**
     * Reset file list
     */
    resetFileList() {
        this.fileList.innerHTML = '';
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.output.innerHTML = `<h3 style="color: #f44336;">${message}</h3>`;
    }

    /**
     * Show converted message
     */
    showConvertedMessage() {
        this.output.innerHTML = '<h3>All images have been processed</h3>';
    }

    /**
     * Show converting message
     */
    showConvertingMessage() {
        this.output.innerHTML = '<h3>Converting your images...</h3>';
    }

    /**
     * Show conversion method information
     * @param {string} format - Target format (webp or avif)
     * @param {boolean} webpSupported - Whether WebP is supported in browser
     */
    showConversionMethodInfo(format, webpSupported) {
        let message = '';

        if (format === 'webp' && webpSupported) {
            message = `
                <div class="conversion-info browser-info">
                    <h3>🌐 Browser Conversion</h3>
                    <p>Your browser supports WebP conversion. Images will be converted locally without any server uploads.</p>
                </div>
            `;
        } else if (format === 'webp' && !webpSupported) {
            message = `
                <div class="conversion-info server-info">
                    <h3>☁️ Server Conversion</h3>
                    <p>Your browser doesn't support WebP conversion. Images will be uploaded to our server for conversion.</p>
                </div>
            `;
        } else if (format === 'avif') {
            message = `
                <div class="conversion-info server-info">
                    <h3>☁️ Server Conversion</h3>
                    <p>AVIF conversion requires server processing. Images will be uploaded to our server for conversion.</p>
                </div>
                <div class="conversion-info avif-limits">
                    <h3>⚠️ AVIF Processing Limits</h3>
                    <p>Due to free server limitations, AVIF conversion may fail for bigger files. For reliable conversion, use WebP format or try smaller files.</p>
                </div>
            `;
        }

        this.output.innerHTML = message;
    }

    /**
     * Show reading message
     */
    hideConvertedMessage() {
        this.output.innerHTML = '';
    }

    /**
     * Create file item element
     * @param {File} file - File object
     * @param {number} index - File index
     * @returns {HTMLElement} File item element
     */
    createFileItem(file, index) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div>
                <strong>${file.name}</strong>
                <div class="file-status loading" id="status-${index}">Reading file...</div>
                <div class="file-info" id="file-info-${index}"></div>
            </div>
            <div>${(file.size / 1024).toFixed(1)} KB</div>
        `;
        return fileItem;
    }

    /**
     * Add file item to the list
     * @param {File} file - File object
     * @param {number} index - File index
     */
    addFileItem(file, index) {
        const fileItem = this.createFileItem(file, index);
        this.fileList.appendChild(fileItem);
    }

    /**
     * Update file status
     * @param {number} index - File index
     * @param {string} status - Status message
     * @param {string} className - CSS class name
     */
    updateFileStatus(index, status, className) {
        const statusElement = document.getElementById(`status-${index}`);
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `file-status ${className}`;
        }
    }

    /**
     * Display conversion result
     * @param {number} index - File index
     * @param {Object} result - Conversion result
     * @param {string} format - Target format (webp or avif)
     */
    async displayConversionResult(index, result, format) {
        const { dataUrl, originalSize, convertedSize, reductionPercentage, fileName, conversionMethod } = result;

        // Update file info
        const fileInfoElement = document.getElementById(`file-info-${index}`);
        const sizeClass = reductionPercentage > 0 ? 'size-reduction' : 'size-increase';
        const sizeText = reductionPercentage > 0 ? 'reduced' : 'increased';
        const formatUpper = format.toUpperCase();

        fileInfoElement.innerHTML = `
            Original: ${(originalSize / 1024).toFixed(1)} KB | 
            ${formatUpper}: ${(convertedSize / 1024).toFixed(1)} KB | 
            <span class="${sizeClass}">${sizeText} by ${Math.abs(reductionPercentage)}%</span>
        `;

        // Create action links
        const actionLinks = await this.createActionLinks(dataUrl, fileName, format);

        // Update status with action links
        const statusElement = document.getElementById(`status-${index}`);
        statusElement.innerHTML = 'Converted successfully ';
        statusElement.appendChild(actionLinks);
        statusElement.className = 'file-status completed';
    }

    /**
     * Create action links for download and view
     * @param {string} dataUrl - Data URL of converted image
     * @param {string} fileName - Name of the file
     * @param {string} format - Target format (webp or avif)
     * @returns {Promise<HTMLElement>} Action links container
     */
    async createActionLinks(dataUrl, fileName, format) {
        const actionLinks = document.createElement('div');
        actionLinks.className = 'action-links';

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        downloadLink.download = fileName;
        downloadLink.textContent = `Download ${format.toUpperCase()}`;
        downloadLink.className = 'download-link';

        // Create view link
        const viewLink = document.createElement('a');
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        viewLink.href = blobUrl;
        viewLink.target = '_blank';
        viewLink.textContent = `View ${format.toUpperCase()}`;
        viewLink.className = 'view-link';

        actionLinks.appendChild(downloadLink);
        actionLinks.appendChild(viewLink);

        return actionLinks;
    }
} 