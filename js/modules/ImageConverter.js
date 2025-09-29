/**
 * Handles image conversion operations
 */
export class ImageConverter {
    constructor() {
        // this.apiEndpoint = 'https://central-server-app.vercel.app/api/image-convert';
        this.apiEndpoint = 'http://localhost:3001/api/image-convert';
    }

    /**
     * Convert image to a specific format with optional resize
     * @param {Object} fileData - File data object containing file and metadata
     * @param {string} format - Target format (e.g., 'webp', 'avif')
     * @param {Object} resizeOptions - Optional resize options
     * @param {number} [resizeOptions.width] - Target width in pixels
     * @param {number} [resizeOptions.height] - Target height in pixels
     * @param {string} [resizeOptions.fit] - Fit strategy ('cover', 'contain', 'fill', 'inside', 'outside')
     * @returns {Promise<{
     *   originalSize: number,
     *   convertedSize: number,
     *   reductionPercentage: number,
     *   dataUrl: string,
     *   format: string,
     *   fileName: string
     * }>} Conversion result
     */
    async convertToFormat(fileData, format, resizeOptions = null) {
        const formData = new FormData();
        formData.append('image', fileData.file);
        formData.append('format', format);

        // Add resize parameters if provided
        if (resizeOptions) {
            if (resizeOptions.width) {
                formData.append('width', resizeOptions.width.toString());
            }
            if (resizeOptions.height) {
                formData.append('height', resizeOptions.height.toString());
            }
            if (resizeOptions.fit) {
                formData.append('fit', resizeOptions.fit);
            }
        }

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
}
