/**
 * @typedef {Object} FileData
 * @property {File} file The image file to convert
 * @property {string} imageUrl URL of the original image
 * @property {number} index Index of the file in the queue
 */

/**
 * Handles file processing and reading operations
 */
export class FileProcessor {
    constructor() {
        /** @type {FileData[]} */
        this.processedFiles = [];
        /** @type {number} */
        this.totalFiles = 0;
        /** @type {number} */
        this.processedCount = 0;
        /** @type {UI|null} */
        this.ui = null;
    }

    /**
     * Set UI reference for file item creation
     * @param {UI} ui - UI instance
     */
    setUI(ui) {
        this.ui = ui;
    }

    /**
     * Process multiple files and read them as data URLs
     * @param {FileList} files - List of files to process
     * @returns {Promise<void>}
     */
    async processFiles(files) {
        this.processedFiles = [];
        this.totalFiles = files.length;
        this.processedCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Create file item in UI if available
            if (this.ui) {
                this.ui.addFileItem(file, i);
            }
            
            try {
                const imageUrl = await this.readFileAsDataURL(file);
                this.processedFiles.push({
                    file: file,
                    imageUrl: imageUrl,
                    index: i
                });
                
                // Update status in UI if available
                if (this.ui) {
                    this.ui.updateFileStatus(i, 'File read successfully', 'completed');
                }
                
                this.processedCount++;
                this.updateProgress();
                
            } catch (error) {
                console.error('Error reading file:', file.name, error);
                if (this.ui) {
                    this.ui.updateFileStatus(i, 'Error reading file', 'error');
                }
                throw error;
            }
        }
    }

    /**
     * Read a file as a data URL
     * @param {File} file - File to read
     * @returns {Promise<string>} Data URL of the file
     */
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Update progress tracking
     */
    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill && progressText) {
            const percentage = (this.processedCount / this.totalFiles) * 100;
            progressFill.style.width = percentage + '%';
            progressText.textContent = `${this.processedCount} / ${this.totalFiles} files processed`;
        }
    }

    /**
     * Get the list of processed files
     * @returns {FileData[]} Array of processed file data
     */
    getProcessedFiles() {
        return this.processedFiles;
    }

    /**
     * Get progress information
     * @returns {{processedCount: number, totalFiles: number}} Progress info
     */
    getProgress() {
        return {
            processedCount: this.processedCount,
            totalFiles: this.totalFiles
        };
    }
} 