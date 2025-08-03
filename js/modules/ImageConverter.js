/**
 * Handles image conversion operations
 */
export class ImageConverter {
    constructor() {
        this.apiEndpoint = 'https://central-server-app.vercel.app/api/image-convert';
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
}
