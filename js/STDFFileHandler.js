/**
 * STDF File Handler - Refactored Version
 * Handles parsing of STDF files, summary files, and compressed files
 * Version: 2.0
 * Created: 2025-01-27
 * Updated: 2025-01-27 - Refactored to use modular structure
 */

import { FileUtils } from './utils/FileUtils.js';
import { CalculationUtils } from './utils/CalculationUtils.js';
import { SummaryFileParser } from './modules/SummaryFileParser.js';
import { Analytics } from './modules/Analytics.js';
import { UI } from './modules/UI.js';

export class STDFFileHandler {
    constructor() {
        this.supportedFormats = ['.stdf', '.stdf.gz', '.lotSumTXT', '.lotsumtxt'];
        this.parsers = {
            '.lotSumTXT': this.parseSummaryFile.bind(this),
            '.lotsumtxt': this.parseSummaryFile.bind(this),
            '.stdf': this.parseSTDFFile.bind(this),
            '.stdf.gz': this.parseCompressedSTDF.bind(this)
        };
        this.processedFiles = new Map(); // Store multiple files
        this.testSequences = new Map(); // Store test sequences by lot
    }

    /**
     * Main file loading method
     * @param {File} file - The file to parse
     * @returns {Promise<Object>} Parsed data object
     */
    async loadFile(file) {
        try {
            console.log(`Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);
            
            const extension = FileUtils.getFileExtension(file.name);
            console.log(`Detected extension: ${extension}`);
            
            if (!this.parsers[extension]) {
                throw new Error(`Unsupported file format: ${extension}`);
            }

            console.log(`Using parser for: ${extension}`);
            const result = await this.parsers[extension](file);
            
            // Store the result for multiple file support
            this.processedFiles.set(file.name, {
                success: true,
                fileName: file.name,
                fileType: extension,
                data: result,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                fileName: file.name,
                fileType: extension,
                data: result,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
            return {
                success: false,
                fileName: file.name,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get all processed files data
     * @returns {Array} Array of processed file data
     */
    getAllProcessedFiles() {
        return Array.from(this.processedFiles.values());
    }

    /**
     * Parse summary file
     * @param {File} file - Summary file to parse
     * @returns {Promise<Object>} Parsed data
     */
    async parseSummaryFile(file) {
        try {
            const content = await file.text();
            const parser = new SummaryFileParser();
            const result = parser.parseSummaryFile(content);
            
            // Use lot number from parsed content if available, otherwise fall back to filename
            if (result.lotInfo && result.lotInfo.Lot_number) {
                result.lotNumber = result.lotInfo.Lot_number;
            } else {
                // Fallback to filename extraction
                result.lotNumber = FileUtils.extractLotNumberFromFileName(file.name, content);
            }
            
            // Ensure device name is set
            if (result.lotInfo && result.lotInfo.Device_name) {
                result.deviceName = result.lotInfo.Device_name;
            } else {
                result.deviceName = 'Unknown';
            }
            
            // Add file metadata
            result.fileName = file.name;
            result.fileSize = file.size;
            result.parseTime = new Date().toISOString();
            
            console.log(`Parsed summary file: ${file.name}`);
            console.log(`Lot number: ${result.lotNumber}`);
            console.log(`Device name: ${result.deviceName}`);
            
            return result;
        } catch (error) {
            console.error(`Error in parseSummaryFile:`, error);
            throw error;
        }
    }

    /**
     * Parse compressed STDF file
     * @param {File} file - Compressed STDF file to parse
     * @returns {Promise<Object>} Parsed data
     */
    async parseCompressedSTDF(file) {
        try {
            const compressedData = await file.arrayBuffer();
            const decompressedData = pako.inflate(new Uint8Array(compressedData));
            
            // Create a new file object with decompressed data
            const decompressedFile = new File([decompressedData], file.name.replace('.gz', ''), {
                type: 'application/octet-stream'
            });
            
            return await this.parseSTDFFile(decompressedFile);
        } catch (error) {
            console.error(`Error in parseCompressedSTDF:`, error);
            throw error;
        }
    }

    /**
     * Parse STDF file
     * @param {File} file - STDF file to parse
     * @returns {Promise<Object>} Parsed data
     */
    async parseSTDFFile(file) {
        // Placeholder for STDF parsing - would need STDFRecordParser implementation
        console.log('STDF parsing not yet implemented');
        return {
            lotInfo: {},
            testResults: [],
            summary: {},
            analytics: {}
        };
    }

    /**
     * Get aggregated analytics
     * @returns {Object} Aggregated analytics
     */
    getAggregatedAnalytics() {
        const allFiles = this.getAllProcessedFiles();
        return Analytics.getAggregatedAnalytics(allFiles);
    }

    /**
     * Test sequence detection (for debugging)
     */
    testSequenceDetection() {
        const files = this.getAllProcessedFiles();
        const sequences = Analytics.detectTestSequences(files);
        
        console.log('=== Test Sequence Detection Results ===');
        Object.keys(sequences).forEach(lotNumber => {
            const sequence = sequences[lotNumber];
            console.log(`Lot ${lotNumber}: ${sequence.tests.length} tests`);
            sequence.tests.forEach(test => {
                console.log(`  ${test.testType}: ${test.fileName}`);
            });
        });
        
        return sequences;
    }

    /**
     * Test filename parsing (for debugging)
     * @param {string} fileName - File name to test
     */
    testFileNameParsing(fileName) {
        console.log('=== File Name Parsing Test ===');
        console.log('File name:', fileName);
        
        const lotNumber = FileUtils.extractLotNumberFromFileName(fileName);
        const testType = FileUtils.extractTestType(fileName);
        
        console.log('Extracted lot number:', lotNumber);
        console.log('Extracted test type:', testType);
        
        return { lotNumber, testType };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { STDFFileHandler };
} 