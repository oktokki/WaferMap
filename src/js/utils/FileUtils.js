/**
 * File Utilities
 * Handles file extension detection, filename parsing, and file validation
 * Version: 1.0
 * Created: 2025-01-27
 */

export class FileUtils {
    /**
     * Get file extension from filename
     * @param {string} fileName - File name
     * @returns {string} File extension
     */
    static getFileExtension(fileName) {
        if (!fileName || typeof fileName !== 'string') {
            return '';
        }

        const lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return '';
        }

        const extension = fileName.substring(lastDotIndex).toLowerCase();
        
        // Handle double extensions like .stdf.gz
        if (extension === '.gz') {
            const secondLastDotIndex = fileName.lastIndexOf('.', lastDotIndex - 1);
            if (secondLastDotIndex !== -1) {
                const doubleExtension = fileName.substring(secondLastDotIndex).toLowerCase();
                return doubleExtension;
            }
        }

        return extension;
    }

    /**
     * Normalize file extension
     * @param {string} extension - File extension
     * @returns {string} Normalized extension
     */
    static normalizeExtension(extension) {
        if (!extension) return '';
        
        const normalizedExtension = extension.toLowerCase();
        
        // Extension mapping for common variations
        const extensionMap = {
            '.lotsumtxt': '.lotSumTXT',
            '.stdf.gz': '.stdf.gz',
            '.stdf': '.stdf'
        };
        
        return extensionMap[normalizedExtension] || normalizedExtension;
    }

    /**
     * Extract lot number from filename or file content
     * @param {string} fileName - File name
     * @param {string} fileContent - File content (optional)
     * @returns {string} Lot number or null
     */
    static extractLotNumberFromFileName(fileName, fileContent = null) {
        if (!fileName || typeof fileName !== 'string') {
            return null;
        }

        // First, try to extract from file content if available
        if (fileContent && typeof fileContent === 'string') {
            const contentMatch = fileContent.match(/Lot_number\s*:\s*([A-Z0-9\-]+(?:-[A-Z0-9]+)*)/);
            if (contentMatch && contentMatch[1]) {
                return contentMatch[1];
            }
        }

        // Try multiple patterns for lot number extraction from filename
        const patterns = [
            // Pattern for files like: FT_MCSLOGIC_GAPM9000-E-01S13_P1_20250530_210044.lotSumTXT
            /FT_MCSLOGIC_([A-Z0-9\-]+(?:-[A-Z0-9]+)*)_[PR]\d+_/,
            // Pattern for files like: FT_MCSLOGIC_S95WR000C-09_R1_20250521_120733.lotSumTXT
            /FT_MCSLOGIC_([A-Z0-9]+(?:[A-Z0-9\-]+)*)_[PR]\d+_/,
            // Pattern for files like: FT_MCSLOGIC_S95WSA00D-03_P1_20250522_033348.lotSumTXT
            /FT_MCSLOGIC_([A-Z0-9]+(?:[A-Z0-9\-]+)*)_[PR]\d+_/,
            // Generic pattern without FT_MCSLOGIC prefix
            /([A-Z0-9\-]+(?:-[A-Z0-9]+)*)_[PR]\d+_/,
            // Pattern with dot instead of underscore
            /([A-Z0-9\-]+(?:-[A-Z0-9]+)*)_[PR]\d+\./,
            // Minimal pattern
            /([A-Z0-9\-]+(?:-[A-Z0-9]+)*)_[PR]\d/
        ];
        
        for (const pattern of patterns) {
            const match = fileName.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        
        // If no lot number found, create a unique identifier from filename
        return this.createUniqueIdentifier(fileName);
    }

    /**
     * Create unique identifier from filename when lot number is not found
     * @param {string} fileName - File name
     * @returns {string} Unique identifier
     */
    static createUniqueIdentifier(fileName) {
        // Remove extension and create hash-like identifier
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
        const testType = this.extractTestType(fileName);
        
        // Create unique identifier: filename_hash + testType
        const hash = this.simpleHash(nameWithoutExt);
        return `${nameWithoutExt}_${testType}_${hash}`;
    }

    /**
     * Simple hash function for creating unique identifiers
     * @param {string} str - String to hash
     * @returns {string} Hash string
     */
    static simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36).substring(0, 6);
    }

    /**
     * Extract test type from filename
     * @param {string} fileName - File name
     * @returns {string} Test type (P1, R1, R2, etc.) or 'Unknown'
     */
    static extractTestType(fileName) {
        if (!fileName || typeof fileName !== 'string') {
            return 'Unknown';
        }

        // Try multiple patterns for test type extraction
        const patterns = [
            /_([PR]\d+)_/,  // Standard pattern: _P1_, _R1_, etc.
            /_([PR]\d+)\./, // Pattern with dot: _P1., _R1., etc.
            /([PR]\d+)_/,   // Pattern without leading underscore: P1_, R1_, etc.
            /([PR]\d+)\./   // Pattern without leading underscore and with dot: P1., R1., etc.
        ];
        
        for (const pattern of patterns) {
            const match = fileName.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        
        return 'Unknown';
    }

    /**
     * Compare test sequence order
     * @param {string} a - First test type
     * @param {string} b - Second test type
     * @returns {number} Comparison result
     */
    static compareTestSequence(a, b) {
        const getOrder = (type) => {
            if (type.startsWith('P')) return 0; // Primary test first
            const num = parseInt(type.substring(1));
            return num; // R1=1, R2=2, etc.
        };
        
        return getOrder(a) - getOrder(b);
    }

    /**
     * Validate file type
     * @param {string} fileName - File name
     * @param {Array} supportedFormats - Array of supported formats
     * @returns {boolean} True if file type is supported
     */
    static validateFileType(fileName, supportedFormats) {
        const extension = this.getFileExtension(fileName);
        return supportedFormats.includes(extension);
    }

    /**
     * Parse date time string
     * @param {string} dateTimeStr - Date time string (YYYYMMDDHHMM)
     * @returns {string} Formatted date time
     */
    static parseDateTime(dateTimeStr) {
        if (!dateTimeStr || dateTimeStr.length !== 12) return dateTimeStr;
        
        const year = dateTimeStr.substring(0, 4);
        const month = dateTimeStr.substring(4, 6);
        const day = dateTimeStr.substring(6, 8);
        const hour = dateTimeStr.substring(8, 10);
        const minute = dateTimeStr.substring(10, 12);
        
        return `${year}-${month}-${day} ${hour}:${minute}`;
    }
}

if (typeof window !== 'undefined') window.FileUtils = FileUtils; 