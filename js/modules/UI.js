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
        this.enableResizeCheckbox = document.getElementById('enableResize');
        this.resizeControls = document.getElementById('resizeControls');
        
        this.initializeResizeControls();
    }

    /**
     * Initialize resize control event listeners
     */
    initializeResizeControls() {
        if (this.enableResizeCheckbox) {
            this.enableResizeCheckbox.addEventListener('change', (e) => {
                this.resizeControls.style.display = e.target.checked ? 'block' : 'none';
            });
        }
    }

    /**
     * Get resize options from the UI
     * @returns {Object|null} Resize options or null if resize is disabled
     */
    getResizeOptions() {
        if (!this.enableResizeCheckbox || !this.enableResizeCheckbox.checked) {
            return null;
        }

        const width = document.getElementById('resizeWidth').value;
        const height = document.getElementById('resizeHeight').value;
        const fit = document.getElementById('resizeFit').value;

        // Only return options if at least one dimension is specified
        if (!width && !height) {
            return null;
        }

        const options = {};
        if (width) options.width = parseInt(width);
        if (height) options.height = parseInt(height);
        if (fit) options.fit = fit;

        return options;
    }

    /**
     * Validate resize options
     * @returns {boolean} True if resize options are valid
     */
    validateResizeOptions() {
        if (!this.enableResizeCheckbox || !this.enableResizeCheckbox.checked) {
            return true; // Resize is disabled, so it's valid
        }

        const width = document.getElementById('resizeWidth').value;
        const height = document.getElementById('resizeHeight').value;

        if (!width && !height) {
            alert('Please specify at least one dimension (width or height) when resize is enabled.');
            return false;
        }

        if (width && parseInt(width) <= 0) {
            alert('Width must be greater than 0.');
            return false;
        }

        if (height && parseInt(height) <= 0) {
            alert('Height must be greater than 0.');
            return false;
        }

        return true;
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
     * @param {Object} resizeOptions - Resize options used (if any)
     */
    async displayConversionResult(index, result, format, resizeOptions = null) {
        const { dataUrl, originalSize, convertedSize, reductionPercentage, fileName } = result;
        
        // Update file info
        const fileInfoElement = document.getElementById(`file-info-${index}`);
        const sizeClass = reductionPercentage > 0 ? 'size-reduction' : 'size-increase';
        const sizeText = reductionPercentage > 0 ? 'reduced' : 'increased';
        const formatUpper = format.toUpperCase();
        
        let resizeInfo = '';
        if (resizeOptions) {
            const dimensions = [];
            if (resizeOptions.width) dimensions.push(`${resizeOptions.width}px`);
            if (resizeOptions.height) dimensions.push(`${resizeOptions.height}px`);
            if (dimensions.length > 0) {
                resizeInfo = ` | Resized to ${dimensions.join(' × ')} (${resizeOptions.fit})`;
            }
        }
        
        fileInfoElement.innerHTML = `
            Original: ${(originalSize / 1024).toFixed(1)} KB | 
            ${formatUpper}: ${(convertedSize / 1024).toFixed(1)} KB | 
            <span class="${sizeClass}">${sizeText} by ${Math.abs(reductionPercentage)}%</span>
            ${resizeInfo}
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