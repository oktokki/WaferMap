/**
 * STDF File Handler - Refactored Version
 * Handles parsing of STDF files, summary files, and compressed files
 * Version: 3.0
 * Created: 2025-01-27
 * Updated: 2025-06-22 - Added STDFParser and ExcelParser integration
 */

import { FileUtils } from './utils/FileUtils.js';
import { CalculationUtils } from './utils/CalculationUtils.js';
import { SummaryFileParser } from './modules/SummaryFileParser.js';
import { STDFParser } from './modules/STDFParser.js';
import { ExcelParser } from './modules/ExcelParser.js';
import { Analytics } from './modules/Analytics.js';
import { UI } from './modules/UI.js';

export class STDFFileHandler {
    constructor() {
        this.supportedFormats = ['.stdf', '.stdf.gz', '.lotSumTXT', '.lotsumtxt', '.xlsx', '.xls'];
        this.parsers = {
            '.lotSumTXT': this.parseSummaryFile.bind(this),
            '.lotsumtxt': this.parseSummaryFile.bind(this),
            '.stdf': this.parseSTDFFile.bind(this),
            '.stdf.gz': this.parseCompressedSTDF.bind(this),
            '.xlsx': this.parseExcelFile.bind(this),
            '.xls': this.parseExcelFile.bind(this)
        };
        this.processedFiles = new Map(); // Store multiple files
        this.testSequences = new Map(); // Store test sequences by lot
        
        // Initialize specialized parsers
        this.stdfParser = new STDFParser();
        this.excelParser = new ExcelParser();
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
     * Parse STDF file using new STDFParser
     * @param {File} file - STDF file to parse
     * @returns {Promise<Object>} Parsed data
     */
    async parseSTDFFile(file) {
        try {
            console.log(`Parsing STDF file: ${file.name}`);
            const result = await this.stdfParser.parseSTDFFile(file);
            
            // Add file metadata
            result.fileName = file.name;
            result.fileSize = file.size;
            result.parseTime = new Date().toISOString();
            
            console.log(`STDF parsing completed for: ${file.name}`);
            return result;
        } catch (error) {
            console.error(`Error in parseSTDFFile:`, error);
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
            console.log(`Parsing compressed STDF file: ${file.name}`);
            const result = await this.stdfParser.parseSTDFFile(file);
            
            // Add file metadata
            result.fileName = file.name;
            result.fileSize = file.size;
            result.parseTime = new Date().toISOString();
            
            console.log(`Compressed STDF parsing completed for: ${file.name}`);
            return result;
        } catch (error) {
            console.error(`Error in parseCompressedSTDF:`, error);
            throw error;
        }
    }

    /**
     * Parse Excel file using new ExcelParser
     * @param {File} file - Excel file to parse
     * @returns {Promise<Object>} Parsed data
     */
    async parseExcelFile(file) {
        try {
            console.log(`Parsing Excel file: ${file.name}`);
            const result = await this.excelParser.parseExcelFile(file);
            
            // Add file metadata
            result.fileName = file.name;
            result.fileSize = file.size;
            result.parseTime = new Date().toISOString();
            
            console.log(`Excel parsing completed for: ${file.name}`);
            return result;
        } catch (error) {
            console.error(`Error in parseExcelFile:`, error);
            throw error;
        }
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

    /**
     * Get file type statistics
     * @returns {Object} File type statistics
     */
    getFileTypeStatistics() {
        const files = this.getAllProcessedFiles();
        const stats = {
            total: files.length,
            byType: {},
            byStatus: { success: 0, failed: 0 }
        };
        
        files.forEach(file => {
            // Count by file type
            if (!stats.byType[file.fileType]) {
                stats.byType[file.fileType] = 0;
            }
            stats.byType[file.fileType]++;
            
            // Count by status
            if (file.success) {
                stats.byStatus.success++;
            } else {
                stats.byStatus.failed++;
            }
        });
        
        return stats;
    }

    /**
     * Get STDF parser instance
     * @returns {STDFParser} STDF parser instance
     */
    getSTDFParser() {
        return this.stdfParser;
    }

    /**
     * Get Excel parser instance
     * @returns {ExcelParser} Excel parser instance
     */
    getExcelParser() {
        return this.excelParser;
    }

    /**
     * Export all processed data
     * @param {string} format - Export format
     * @returns {string} Exported data
     */
    exportAllData(format = 'json') {
        const allData = {
            fileHandler: {
                supportedFormats: this.supportedFormats,
                fileTypeStats: this.getFileTypeStatistics(),
                processedFiles: this.getAllProcessedFiles()
            },
            stdfData: this.stdfParser ? this.stdfParser.parsedData : null,
            excelData: this.excelParser ? this.excelParser.parsedData : null
        };
        
        switch (format) {
            case 'json':
                return JSON.stringify(allData, null, 2);
            case 'summary':
                return JSON.stringify({
                    fileTypeStats: this.getFileTypeStatistics(),
                    stdfSummary: this.stdfParser ? this.stdfParser.getSummary() : null,
                    excelSummary: this.excelParser ? this.excelParser.parsedData.summary : null
                }, null, 2);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { STDFFileHandler };
} 