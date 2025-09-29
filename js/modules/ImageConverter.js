/**
 * Handles image conversion operations
 */
export class ImageConverter {
    constructor() {
        this.apiEndpoint = 'https://central-server-app.vercel.app/api/image-convert';
        this.webpSupported = this.checkWebPSupport();
    }

    /**
     * Check if browser supports WebP conversion
     * @returns {boolean} True if WebP is supported
     */
    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    /**
     * Convert image to a specific format
     * @param {Object} fileData - File data object containing file and metadata
     * @param {string} format - Target format (e.g., 'webp', 'avif')
     * @returns {Promise<{
     *   originalSize: number,
     *   convertedSize: number,
     *   reductionPercentage: number,
     *   dataUrl: string,
     *   format: string,
     *   fileName: string
     * }>} Conversion result
     */
    async convertToFormat(fileData, format) {
        // Use browser conversion for WebP if supported
        if (format === 'webp' && this.webpSupported) {
            return await this.convertToWebPInBrowser(fileData);
        }

        // Use server API for AVIF or unsupported WebP
        return await this.convertViaServer(fileData, format);
    }

    /**
     * Convert image to WebP using browser Canvas API
     * @param {Object} fileData - File data object containing file and metadata
     * @returns {Promise<Object>} Conversion result
     */
    async convertToWebPInBrowser(fileData) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Draw the image onto the canvas
                    ctx.drawImage(img, 0, 0);

                    // Convert to WebP
                    const webpDataUrl = canvas.toDataURL('image/webp', 0.8);

                    // Calculate sizes
                    const originalSize = fileData.file.size;
                    const convertedSize = this.getDataUrlSize(webpDataUrl);
                    const reductionPercentage = Number((((originalSize - convertedSize) / originalSize) * 100).toFixed(2));

                    // Generate new filename
                    const fileName = this.generateFileName(fileData.file.name, 'webp');

                    resolve({
                        originalSize,
                        convertedSize,
                        reductionPercentage,
                        dataUrl: webpDataUrl,
                        format: 'webp',
                        fileName
                    });
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image for conversion'));
            };

            img.src = fileData.imageUrl;
        });
    }

    /**
     * Convert image via server API
     * @param {Object} fileData - File data object containing file and metadata
     * @param {string} format - Target format
     * @returns {Promise<Object>} Conversion result
     */
    async convertViaServer(fileData, format) {
        const formData = new FormData();
        formData.append('image', fileData.file);
        formData.append('format', format);

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error(`Error converting image to ${format}:`, error);
            throw error;
        }
    }

    /**
     * Calculate the size of a data URL in bytes
     * @param {string} dataUrl - Data URL string
     * @returns {number} Size in bytes
     */
    getDataUrlSize(dataUrl) {
        // Remove data URL prefix to get base64 content
        const base64 = dataUrl.split(',')[1];
        // Calculate size: base64 is 4/3 of original size, minus padding
        return Math.floor((base64.length * 3) / 4) - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
    }

    /**
     * Generate new filename with target extension
     * @param {string} originalName - Original filename
     * @param {string} format - Target format
     * @returns {string} New filename
     */
    generateFileName(originalName, format) {
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        return `${nameWithoutExt}.${format}`;
    }
}
