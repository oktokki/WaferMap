/**
 * Excel Parser Module
 * Handles parsing of Excel files for packaging reports and LIS data
 * Version: 1.0
 * Created: 2025-06-22
 */

import { FileUtils } from '../utils/FileUtils.js';

export class ExcelParser {
    constructor() {
        this.supportedFormats = ['.xlsx', '.xls'];
        this.parsedData = {
            fileInfo: {},
            worksheets: [],
            summary: {}
        };
    }

    /**
     * Main parsing method for Excel files
     * @param {File} file - Excel file to parse
     * @returns {Promise<Object>} Parsed Excel data
     */
    async parseExcelFile(file) {
        try {
            console.log(`Starting Excel parsing for: ${file.name}`);
            
            // Check if XLSX library is available
            if (typeof XLSX === 'undefined') {
                throw new Error('XLSX library not available. Please include xlsx.full.min.js');
            }
            
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            // Parse all worksheets
            await this.parseWorksheets(workbook);
            
            // Detect file type and parse accordingly
            const fileType = this.detectFileType(file.name, workbook);
            if (fileType === 'packaging') {
                await this.parsePackagingReport(workbook);
            } else if (fileType === 'lis') {
                await this.parseLISReport(workbook);
            }
            
            // Generate summary
            this.generateSummary();
            
            // Add file metadata
            this.parsedData.fileInfo = {
                fileName: file.name,
                fileSize: file.size,
                fileType: fileType,
                parseTime: new Date().toISOString(),
                worksheetCount: workbook.SheetNames.length
            };
            
            console.log(`Excel parsing completed. Worksheets: ${workbook.SheetNames.length}`);
            
            return this.parsedData;
            
        } catch (error) {
            console.error('Error parsing Excel file:', error);
            throw new Error(`Excel parsing failed: ${error.message}`);
        }
    }

    /**
     * Parse all worksheets in the workbook
     * @param {Object} workbook - XLSX workbook object
     */
    async parseWorksheets(workbook) {
        this.parsedData.worksheets = [];
        
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            this.parsedData.worksheets.push({
                name: sheetName,
                data: sheetData,
                rowCount: sheetData.length,
                columnCount: sheetData.length > 0 ? sheetData[0].length : 0
            });
        });
    }

    /**
     * Detect file type based on filename and content
     * @param {string} fileName - File name
     * @param {Object} workbook - XLSX workbook object
     * @returns {string} File type ('packaging', 'lis', 'unknown')
     */
    detectFileType(fileName, workbook) {
        const fileNameLower = fileName.toLowerCase();
        
        // Check filename patterns
        if (fileNameLower.includes('packaging') || fileNameLower.includes('package')) {
            return 'packaging';
        }
        
        if (fileNameLower.includes('lis') || fileNameLower.includes('quality')) {
            return 'lis';
        }
        
        return 'unknown';
    }

    /**
     * Parse packaging monthly yield report
     * @param {Object} workbook - XLSX workbook object
     */
    async parsePackagingReport(workbook) {
        console.log('Parsing packaging report...');
        
        this.parsedData.packagingData = {
            lots: [],
            summary: {},
            waferToICMapping: new Map()
        };
        
        // Generate packaging summary
        this.generatePackagingSummary();
    }

    /**
     * Parse LIS monthly report
     * @param {Object} workbook - XLSX workbook object
     */
    async parseLISReport(workbook) {
        console.log('Parsing LIS report...');
        
        this.parsedData.lisData = {
            lots: [],
            qualityData: [],
            packingData: [],
            summary: {}
        };
        
        // Process the first worksheet (assuming it contains LIS data)
        if (this.parsedData.worksheets && this.parsedData.worksheets.length > 0) {
            const worksheet = this.parsedData.worksheets[0];
            await this.processLISWorksheet(worksheet);
        }
        
        // Generate LIS summary
        this.generateLISSummary();
    }

    /**
     * Process LIS worksheet data
     * @param {Object} worksheet - Worksheet data
     */
    async processLISWorksheet(worksheet) {
        if (!worksheet.data || worksheet.data.length < 2) {
            console.warn('LIS worksheet has insufficient data');
            return;
        }
        
        const headers = worksheet.data[0];
        const dataRows = worksheet.data.slice(1);
        
        console.log('LIS Headers:', headers);
        console.log('LIS Data Rows:', dataRows.length);
        
        // Map column indices
        const columnMap = {
            device: headers.findIndex(h => h && h.toLowerCase().includes('device')),
            pkgType: headers.findIndex(h => h && h.toLowerCase().includes('pkg type')),
            assySite: headers.findIndex(h => h && h.toLowerCase().includes('assy site')),
            lotId: headers.findIndex(h => h && h.toLowerCase().includes('lot id')),
            rejDate: headers.findIndex(h => h && h.toLowerCase().includes('rej date')),
            inQty: headers.findIndex(h => h && h.toLowerCase().includes('in qty')),
            outQty: headers.findIndex(h => h && h.toLowerCase().includes('out qty')),
            rejQty: headers.findIndex(h => h && h.toLowerCase().includes('rej qty')),
            yield: headers.findIndex(h => h && h.toLowerCase().includes('yield')),
            equipId: headers.findIndex(h => h && h.toLowerCase().includes('equip id'))
        };
        
        console.log('Column Map:', columnMap);
        
        // Process each data row
        dataRows.forEach((row, index) => {
            if (row.length === 0 || row.every(cell => cell === null || cell === undefined)) {
                return; // Skip empty rows
            }
            
            const lotData = {
                rowIndex: index + 2, // +2 because we skipped header and arrays are 0-indexed
                device: columnMap.device >= 0 ? row[columnMap.device] : null,
                pkgType: columnMap.pkgType >= 0 ? row[columnMap.pkgType] : null,
                assySite: columnMap.assySite >= 0 ? row[columnMap.assySite] : null,
                lotId: columnMap.lotId >= 0 ? row[columnMap.lotId] : null,
                rejDate: columnMap.rejDate >= 0 ? row[columnMap.rejDate] : null,
                inQty: columnMap.inQty >= 0 ? this.parseNumber(row[columnMap.inQty]) : null,
                outQty: columnMap.outQty >= 0 ? this.parseNumber(row[columnMap.outQty]) : null,
                rejQty: columnMap.rejQty >= 0 ? this.parseNumber(row[columnMap.rejQty]) : null,
                yield: columnMap.yield >= 0 ? this.parseNumber(row[columnMap.yield]) : null,
                equipId: columnMap.equipId >= 0 ? row[columnMap.equipId] : null
            };
            
            // Calculate derived fields
            if (lotData.inQty !== null && lotData.outQty !== null) {
                lotData.actualYield = lotData.inQty > 0 ? (lotData.outQty / lotData.inQty) * 100 : 0;
            }
            
            if (lotData.inQty !== null && lotData.rejQty !== null) {
                lotData.calculatedRejQty = lotData.inQty - lotData.outQty;
            }
            
            // Add to lots array
            this.parsedData.lisData.lots.push(lotData);
            
            // Add to quality data if it has quality-related information
            if (lotData.rejQty !== null || lotData.yield !== null) {
                this.parsedData.lisData.qualityData.push({
                    ...lotData,
                    dataType: 'quality'
                });
            }
            
            // Add to packing data if it has packing-related information
            if (lotData.pkgType || lotData.assySite) {
                this.parsedData.lisData.packingData.push({
                    ...lotData,
                    dataType: 'packing'
                });
            }
        });
        
        console.log(`Processed ${this.parsedData.lisData.lots.length} LIS lots`);
    }

    /**
     * Parse number value safely
     * @param {any} value - Value to parse
     * @returns {number|null} Parsed number or null
     */
    parseNumber(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }

    /**
     * Generate packaging summary
     */
    generatePackagingSummary() {
        const summary = this.parsedData.packagingData.summary;
        const lots = this.parsedData.packagingData.lots;
        
        summary.totalLots = lots.length;
        summary.totalQuantity = lots.reduce((sum, lot) => sum + (lot.quantity || 0), 0);
        summary.averageYield = lots.length > 0 ? 
            lots.reduce((sum, lot) => sum + (lot.yield || 0), 0) / lots.length : 0;
    }

    /**
     * Generate LIS summary
     */
    generateLISSummary() {
        const summary = this.parsedData.lisData.summary;
        const lots = this.parsedData.lisData.lots;
        
        summary.totalLots = lots.length;
        summary.qualityRecords = this.parsedData.lisData.qualityData.length;
        summary.packingRecords = this.parsedData.lisData.packingData.length;
    }

    /**
     * Generate overall summary
     */
    generateSummary() {
        const summary = this.parsedData.summary;
        
        summary.totalWorksheets = this.parsedData.worksheets.length;
        summary.totalRows = this.parsedData.worksheets.reduce((sum, sheet) => sum + sheet.rowCount, 0);
        
        if (this.parsedData.packagingData) {
            summary.packagingLots = this.parsedData.packagingData.lots.length;
        }
        
        if (this.parsedData.lisData) {
            summary.lisLots = this.parsedData.lisData.lots.length;
        }
    }

    /**
     * Get packaging data
     * @returns {Object} Packaging data
     */
    getPackagingData() {
        return this.parsedData.packagingData;
    }

    /**
     * Get LIS data
     * @returns {Object} LIS data
     */
    getLISData() {
        return this.parsedData.lisData;
    }

    /**
     * Export data in various formats
     * @param {string} format - Export format ('json', 'summary')
     * @returns {string} Exported data
     */
    exportData(format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(this.parsedData, null, 2);
            case 'summary':
                return JSON.stringify(this.parsedData.summary, null, 2);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
} 