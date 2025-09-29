import { FileProcessor } from './modules/FileProcessor.js';
import { UI } from './modules/UI.js';
import { ImageConverter } from './modules/ImageConverter.js';

/**
 * Main application class that orchestrates the image conversion process
 */
class ImageConverterApp {
    constructor() {
        this.fileProcessor = new FileProcessor();
        this.ui = new UI();
        this.imageConverter = new ImageConverter();

        // Connect UI to FileProcessor
        this.fileProcessor.setUI(this.ui);

        // Increment visit count on page load
        this.ui.incrementVisitCount();

        this.initializeEventListeners();
        this.initializeConversionInfo();
    }

    /**
     * Initialize event listeners for user interactions
     */
    initializeEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const convertButton = document.getElementById('convertButton');

        fileInput.addEventListener('change', (event) => this.handleFileSelect(event));
        convertButton.addEventListener('click', () => this.handleConvert());

        // Add format change listener
        const formatSelect = document.getElementById('formatSelect');
        formatSelect.addEventListener('change', () => this.updateConversionInfo());
    }

    /**
     * Initialize conversion method information
     */
    initializeConversionInfo() {
        this.updateConversionInfo();
    }

    /**
     * Update conversion method information based on selected format
     */
    updateConversionInfo() {
        const selectedFormat = this.getSelectedFormat();
        const webpSupported = this.imageConverter.webpSupported;
        this.ui.showConversionMethodInfo(selectedFormat, webpSupported);
    }

    /**
     * Get the currently selected format
     * @returns {string} Selected format (webp or avif)
     */
    getSelectedFormat() {
        const formatSelect = document.getElementById('formatSelect');
        return formatSelect.value;
    }

    /**
     * Handle file selection from input
     * @param {Event} event - File input change event
     */
    async handleFileSelect(event) {
        const files = event.target.files;
        if (files.length === 0) return;

        this.ui.showProgress();
        this.ui.resetFileList();
        this.ui.hideConvertedMessage();

        try {
            await this.fileProcessor.processFiles(files);
            this.ui.hideProgress();
            this.ui.enableConvertButton();
        } catch (error) {
            console.error('Error processing files:', error);
            this.ui.hideProgress();
            this.ui.showError('Error processing files');
        }
    }

    /**
     * Handle convert button click
     */
    async handleConvert() {
        const processedFiles = this.fileProcessor.getProcessedFiles();
        const selectedFormat = this.getSelectedFormat();

        if (processedFiles.length === 0) {
            alert('No files to convert. Please select files first.');
            return;
        }

        this.ui.showConvertingMessage();
        let resolveWaitForAllFilesToBeConverted;
        const waitForAllFilesToBeConverted = new Promise((resolve) => {
            resolveWaitForAllFilesToBeConverted = resolve;
        });

        let convertedFilesCount = 0;
        processedFiles.forEach(async (fileData) => {
            try {
                this.ui.updateFileStatus(fileData.index, `Converting to ${selectedFormat.toUpperCase()}...`, 'loading');

                const result = await this.imageConverter.convertToFormat(fileData, selectedFormat);
                this.ui.displayConversionResult(fileData.index, result, selectedFormat);

            } catch (error) {
                console.error('Error converting file:', fileData.file.name, error);
                this.ui.updateFileStatus(fileData.index, 'Conversion failed', 'error');
            } finally {
                convertedFilesCount++;
                if (convertedFilesCount === processedFiles.length) {
                    resolveWaitForAllFilesToBeConverted();
                }
            }
        });

        waitForAllFilesToBeConverted.then(() => {
            this.ui.showConvertedMessage();
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageConverterApp();
}); 