/**
 * Handles image conversion operations
 */
export class ImageConverter {
    constructor() {
        this.apiEndpoint = 'http://localhost:3001/api/image-convert';
    }

    /**
     * Convert image to WebP format
     * @param {Object} fileData - File data object containing file and metadata
     * @returns {Promise<{
     *   originalSize: number,
     *   convertedSize: number,
     *   reductionPercentage: number,
     *   dataUrl: string,
     *   format: string,
     *   fileName: string
     * }>} Conversion result
     */
    async convertToWebP(fileData) {
        const formData = new FormData();
        formData.append('image', fileData.file);
        formData.append('format', 'webp');

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
            console.error('Error converting image:', error);
            throw error;
        }
    }

    /**
     * Convert image to a specific format
     * @param {Object} fileData - File data object
     * @param {string} format - Target format (e.g., 'webp', 'png', 'jpg')
     * @returns {Promise<Object>} Conversion result
     */
    async convertToFormat(fileData, format) {
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
     * Set the API endpoint
     * @param {string} endpoint - New API endpoint URL
     */
    setApiEndpoint(endpoint) {
        this.apiEndpoint = endpoint;
    }

    /**
     * Get the current API endpoint
     * @returns {string} Current API endpoint
     */
    getApiEndpoint() {
        return this.apiEndpoint;
    }
} 