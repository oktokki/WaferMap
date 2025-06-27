/**
 * Real STDF Parser Module - Phase 4 Implementation
 * Handles actual parsing of STDF files with comprehensive data extraction
 * Version: 4.0
 * Created: 2025-01-27
 */

export class RealSTDFParser {
    constructor() {
        this.supportedFormats = ['.stdf', '.stdf.gz'];
        this.recordTypes = {
            0: 'FAR',    // File Attributes Record
            1: 'ATR',    // Audit Trail Record
            2: 'MIR',    // Master Information Record
            5: 'MRR',    // Master Results Record
            10: 'PCR',   // Part Count Record
            15: 'PTR',   // Parametric Test Record
            20: 'PRR',   // Part Results Record
            25: 'FTR',   // Functional Test Record
            30: 'MPR',   // Multiple Parametric Test Record
            40: 'TSR',   // Test Synopsis Record
            50: 'HBR',   // Hardware Bin Record
            60: 'SBR'    // Software Bin Record
        };
        
        this.parsedData = {
            fileInfo: {},
            lotInfo: {},
            testResults: [],
            parametricData: [],
            partResults: [],
            binningData: {
                hardBins: [],
                softBins: []
            },
            multiSiteData: new Map(),
            summary: {},
            rawRecords: [],
            recordTypes: {}
        };
    }

    /**
     * Main parsing method for STDF files
     * @param {File} file - STDF file to parse
     * @returns {Promise<Object>} Parsed STDF data
     */
    async parseSTDFFile(file) {
        try {
            console.log(`🔄 Starting real STDF parsing for: ${file.name}`);
            
            // Reset parsed data for new file
            this.resetParsedData();
            
            // Check if file is compressed
            if (file.name.endsWith('.gz')) {
                return await this.parseCompressedSTDF(file);
            }
            
            const arrayBuffer = await file.arrayBuffer();
            const dataView = new DataView(arrayBuffer);
            
            // Parse STDF header and records
            await this.parseSTDFRecords(dataView);
            
            // Generate summary statistics
            this.generateSummary();
            
            // Add file metadata
            this.parsedData.fileInfo = {
                fileName: file.name,
                fileSize: file.size,
                parseTime: new Date().toISOString(),
                recordCount: this.parsedData.rawRecords.length,
                version: '4.0'
            };
            
            console.log(`✅ Real STDF parsing completed. Records: ${this.parsedData.rawRecords.length}, Tests: ${this.parsedData.testResults.length}`);
            
            return this.parsedData;
            
        } catch (error) {
            console.error('❌ Error in real STDF parsing:', error);
            throw new Error(`Real STDF parsing failed: ${error.message}`);
        }
    }

    /**
     * Parse compressed STDF file
     */
    async parseCompressedSTDF(file) {
        try {
            console.log('🔄 Decompressing STDF file...');
            
            if (typeof pako === 'undefined') {
                throw new Error('Pako library not available for decompression');
            }
            
            const compressedData = await file.arrayBuffer();
            const decompressedData = pako.inflate(new Uint8Array(compressedData));
            
            const dataView = new DataView(decompressedData.buffer);
            await this.parseSTDFRecords(dataView);
            
            this.generateSummary();
            
            this.parsedData.fileInfo = {
                fileName: file.name,
                fileSize: file.size,
                originalSize: compressedData.byteLength,
                decompressedSize: decompressedData.byteLength,
                parseTime: new Date().toISOString(),
                recordCount: this.parsedData.rawRecords.length,
                compressed: true,
                version: '4.0'
            };
            
            console.log(`✅ Compressed STDF parsing completed`);
            return this.parsedData;
            
        } catch (error) {
            console.error('❌ Error decompressing STDF file:', error);
            throw error;
        }
    }

    /**
     * Parse STDF records from DataView
     */
    async parseSTDFRecords(dataView) {
        let offset = 0;
        let recordCount = 0;
        
        while (offset < dataView.byteLength - 4) {
            try {
                // Read record header (4 bytes)
                const recordLength = dataView.getUint16(offset, true); // Little endian
                const recordType = dataView.getUint8(offset + 2);
                const recordSubType = dataView.getUint8(offset + 3);
                
                // Validate record
                if (recordLength < 4 || recordLength > 65535) {
                    console.warn(`Invalid record length at offset ${offset}: ${recordLength}`);
                    offset += 4;
                    continue;
                }
                
                if (offset + recordLength > dataView.byteLength) {
                    console.warn(`Record extends beyond file at offset ${offset}`);
                    break;
                }
                
                // Parse record based on type
                const recordData = this.parseRecord(dataView, offset, recordType, recordSubType, recordLength);
                
                if (recordData) {
                    this.processRecord(recordData);
                    recordCount++;
                }
                
                offset += recordLength;
                
                // Progress logging for large files
                if (recordCount % 10000 === 0) {
                    console.log(`📊 Processed ${recordCount} records...`);
                }
                
            } catch (error) {
                console.warn(`⚠️ Error parsing record at offset ${offset}:`, error);
                offset += 4; // Skip to next potential record
            }
        }
        
        console.log(`📈 Total records processed: ${recordCount}`);
    }

    /**
     * Parse individual STDF record
     */
    parseRecord(dataView, offset, recordType, recordSubType, recordLength) {
        const recordKey = (recordType << 8) | recordSubType;
        const recordName = this.getRecordTypeName(recordKey);
        
        const recordData = {
            type: recordName,
            recordType: recordType,
            recordSubType: recordSubType,
            length: recordLength,
            offset: offset,
            data: {}
        };
        
        try {
            // Parse based on record type and subtype combination
            switch (recordKey) {
                case 0x000: // FAR - File Attributes Record
                    this.parseFAR(dataView, offset, recordData);
                    break;
                case 0x018: // ATR - Audit Trail Record  
                    this.parseATR(dataView, offset, recordData);
                    break;
                case 0x00A: // MIR - Master Information Record
                    this.parseMIR(dataView, offset, recordData);
                    break;
                case 0x00F: // MRR - Master Results Record
                    this.parseMRR(dataView, offset, recordData);
                    break;
                case 0x00E: // PCR - Part Count Record
                    this.parsePCR(dataView, offset, recordData);
                    break;
                case 0x00F: // PTR - Parametric Test Record
                    this.parsePTR(dataView, offset, recordData);
                    break;
                case 0x005: // PRR - Part Results Record
                    this.parsePRR(dataView, offset, recordData);
                    break;
                case 0x00F: // FTR - Functional Test Record
                    this.parseFTR(dataView, offset, recordData);
                    break;
                default:
                    // Store unknown records for analysis
                    this.parseUnknownRecord(dataView, offset, recordData);
            }
            
            return recordData;
            
        } catch (error) {
            console.warn(`⚠️ Error parsing ${recordName} record:`, error);
            return null;
        }
    }

    /**
     * Parse File Attributes Record (FAR)
     */
    parseFAR(dataView, offset, recordData) {
        let pos = offset + 4;
        
        recordData.data.CPU_TYPE = dataView.getUint8(pos);
        recordData.data.STDF_VER = dataView.getUint8(pos + 1);
        
        console.log(`📋 FAR: CPU Type=${recordData.data.CPU_TYPE}, STDF Version=${recordData.data.STDF_VER}`);
    }

    /**
     * Parse Master Information Record (MIR)
     */
    parseMIR(dataView, offset, recordData) {
        let pos = offset + 4;
        
        // Setup time
        recordData.data.SETUP_T = dataView.getUint32(pos, true);
        pos += 4;
        
        // Start time
        recordData.data.START_T = dataView.getUint32(pos, true);
        pos += 4;
        
        // Station number
        recordData.data.STAT_NUM = dataView.getUint8(pos);
        pos += 1;
        
        // Mode code
        recordData.data.MODE_COD = this.readString(dataView, pos, 1);
        pos += 1;
        
        // Retest code
        recordData.data.RTST_COD = this.readString(dataView, pos, 1);
        pos += 1;
        
        // Protection code
        recordData.data.PROT_COD = this.readString(dataView, pos, 1);
        pos += 1;
        
        // Burn-in time
        recordData.data.BURN_TIM = dataView.getUint16(pos, true);
        pos += 2;
        
        // Command mode code
        recordData.data.CMOD_COD = this.readString(dataView, pos, 1);
        pos += 1;
        
        // Parse variable length strings
        recordData.data.LOT_ID = this.readVariableString(dataView, pos);
        pos += 1 + recordData.data.LOT_ID.length;
        
        recordData.data.PART_TYP = this.readVariableString(dataView, pos);
        pos += 1 + recordData.data.PART_TYP.length;
        
        recordData.data.NODE_NAM = this.readVariableString(dataView, pos);
        pos += 1 + recordData.data.NODE_NAM.length;
        
        recordData.data.TSTR_TYP = this.readVariableString(dataView, pos);
        pos += 1 + recordData.data.TSTR_TYP.length;
        
        recordData.data.JOB_NAM = this.readVariableString(dataView, pos);
        pos += 1 + recordData.data.JOB_NAM.length;
        
        console.log(`📋 MIR: Lot=${recordData.data.LOT_ID}, Part=${recordData.data.PART_TYP}`);
    }

    /**
     * Parse Parametric Test Record (PTR)
     */
    parsePTR(dataView, offset, recordData) {
        let pos = offset + 4;
        
        recordData.data.TEST_NUM = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.data.HEAD_NUM = dataView.getUint8(pos);
        pos += 1;
        
        recordData.data.SITE_NUM = dataView.getUint8(pos);
        pos += 1;
        
        recordData.data.TEST_FLG = dataView.getUint8(pos);
        pos += 1;
        
        recordData.data.PARM_FLG = dataView.getUint8(pos);
        pos += 1;
        
        recordData.data.RESULT = dataView.getFloat32(pos, true);
        pos += 4;
        
        // Parse test name
        recordData.data.TEST_TXT = this.readVariableString(dataView, pos);
        pos += 1 + recordData.data.TEST_TXT.length;
        
        // Parse alarm ID
        recordData.data.ALARM_ID = this.readVariableString(dataView, pos);
        pos += 1 + recordData.data.ALARM_ID.length;
        
        // Parse optional fields based on PARM_FLG
        if (recordData.data.PARM_FLG & 0x01) {
            recordData.data.OPT_FLAG = dataView.getUint8(pos);
            pos += 1;
        }
        
        if (recordData.data.PARM_FLG & 0x10) {
            recordData.data.LO_LIMIT = dataView.getFloat32(pos, true);
            pos += 4;
        }
        
        if (recordData.data.PARM_FLG & 0x20) {
            recordData.data.HI_LIMIT = dataView.getFloat32(pos, true);
            pos += 4;
        }
        
        if (recordData.data.PARM_FLG & 0x40) {
            recordData.data.UNITS = this.readVariableString(dataView, pos);
            pos += 1 + recordData.data.UNITS.length;
        }
    }

    /**
     * Parse Part Results Record (PRR)
     */
    parsePRR(dataView, offset, recordData) {
        let pos = offset + 4;
        
        recordData.data.HEAD_NUM = dataView.getUint8(pos);
        pos += 1;
        
        recordData.data.SITE_NUM = dataView.getUint8(pos);
        pos += 1;
        
        recordData.data.PART_FLG = dataView.getUint8(pos);
        pos += 1;
        
        recordData.data.NUM_TEST = dataView.getUint16(pos, true);
        pos += 2;
        
        recordData.data.HARD_BIN = dataView.getUint16(pos, true);
        pos += 2;
        
        recordData.data.SOFT_BIN = dataView.getUint16(pos, true);
        pos += 2;
        
        recordData.data.X_COORD = dataView.getInt16(pos, true);
        pos += 2;
        
        recordData.data.Y_COORD = dataView.getInt16(pos, true);
        pos += 2;
        
        recordData.data.TEST_T = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.data.PART_ID = this.readVariableString(dataView, pos);
        pos += 1 + recordData.data.PART_ID.length;
        
        recordData.data.PART_TXT = this.readVariableString(dataView, pos);
        pos += 1 + recordData.data.PART_TXT.length;
        
        recordData.data.PART_FIX = this.readVariableString(dataView, pos);
    }

    /**
     * Parse unknown record
     */
    parseUnknownRecord(dataView, offset, recordData) {
        const dataLength = recordData.length - 4;
        recordData.data.RAW_DATA = new Uint8Array(dataView.buffer, offset + 4, dataLength);
    }

    /**
     * Read variable length string
     */
    readVariableString(dataView, offset) {
        const length = dataView.getUint8(offset);
        return this.readString(dataView, offset + 1, length);
    }

    /**
     * Read fixed length string
     */
    readString(dataView, offset, length) {
        if (length === 0) return '';
        
        try {
            const bytes = new Uint8Array(dataView.buffer, offset, length);
            let actualLength = length;
            
            // Handle null-terminated strings
            for (let i = 0; i < length; i++) {
                if (bytes[i] === 0) {
                    actualLength = i;
                    break;
                }
            }
            
            return new TextDecoder('utf-8').decode(bytes.slice(0, actualLength));
        } catch (error) {
            console.warn('⚠️ Error reading string:', error);
            return '';
        }
    }

    /**
     * Get record type name from record key
     */
    getRecordTypeName(recordKey) {
        const recordNames = {
            0x000: 'FAR',
            0x018: 'ATR', 
            0x00A: 'MIR',
            0x00F: 'MRR',
            0x00E: 'PCR',
            0x00F: 'PTR',
            0x005: 'PRR',
            0x00F: 'FTR'
        };
        
        return recordNames[recordKey] || `UNKNOWN_${recordKey.toString(16)}`;
    }

    /**
     * Process parsed record
     */
    processRecord(recordData) {
        this.parsedData.rawRecords.push(recordData);
        
        // Track record type counts
        if (!this.parsedData.recordTypes[recordData.type]) {
            this.parsedData.recordTypes[recordData.type] = 0;
        }
        this.parsedData.recordTypes[recordData.type]++;
        
        // Process by record type
        switch (recordData.type) {
            case 'MIR':
                this.parsedData.lotInfo = { ...this.parsedData.lotInfo, ...recordData.data };
                break;
            case 'PTR':
                this.processParametricTest(recordData);
                break;
            case 'PRR':
                this.processPartResult(recordData);
                break;
            case 'PCR':
                this.processPartCount(recordData);
                break;
        }
    }

    /**
     * Process parametric test
     */
    processParametricTest(recordData) {
        const testResult = {
            testNumber: recordData.data.TEST_NUM,
            testName: recordData.data.TEST_TXT || `Test_${recordData.data.TEST_NUM}`,
            result: recordData.data.RESULT,
            units: recordData.data.UNITS || '',
            lowLimit: recordData.data.LO_LIMIT,
            highLimit: recordData.data.HI_LIMIT,
            headNumber: recordData.data.HEAD_NUM,
            siteNumber: recordData.data.SITE_NUM,
            passed: this.isTestPassed(recordData.data),
            timestamp: new Date().toISOString()
        };
        
        this.parsedData.testResults.push(testResult);
        this.parsedData.parametricData.push(recordData);
    }

    /**
     * Process part result
     */
    processPartResult(recordData) {
        const partResult = {
            partId: recordData.data.PART_ID,
            headNumber: recordData.data.HEAD_NUM,
            siteNumber: recordData.data.SITE_NUM,
            xCoord: recordData.data.X_COORD,
            yCoord: recordData.data.Y_COORD,
            hardBin: recordData.data.HARD_BIN,
            softBin: recordData.data.SOFT_BIN,
            testCount: recordData.data.NUM_TEST,
            testTime: recordData.data.TEST_T,
            passed: !(recordData.data.PART_FLG & 0x08),
            timestamp: new Date().toISOString()
        };
        
        this.parsedData.partResults.push(partResult);
        
        // Add to multi-site data
        const siteKey = `Site_${recordData.data.SITE_NUM}`;
        if (!this.parsedData.multiSiteData.has(siteKey)) {
            this.parsedData.multiSiteData.set(siteKey, []);
        }
        this.parsedData.multiSiteData.get(siteKey).push(partResult);
        
        // Add to binning data
        this.addToBinningData(partResult);
    }

    /**
     * Process part count
     */
    processPartCount(recordData) {
        // Implementation for part count processing
    }

    /**
     * Check if test passed
     */
    isTestPassed(data) {
        if (data.TEST_FLG & 0x40) return false; // Fail flag
        if (data.LO_LIMIT !== undefined && data.RESULT < data.LO_LIMIT) return false;
        if (data.HI_LIMIT !== undefined && data.RESULT > data.HI_LIMIT) return false;
        return true;
    }

    /**
     * Add to binning data
     */
    addToBinningData(partResult) {
        // Add to hard bins
        const hardBin = this.parsedData.binningData.hardBins.find(bin => bin.binNumber === partResult.hardBin);
        if (hardBin) {
            hardBin.count++;
        } else {
            this.parsedData.binningData.hardBins.push({
                binNumber: partResult.hardBin,
                count: 1,
                description: this.getHardBinDescription(partResult.hardBin)
            });
        }
        
        // Add to soft bins  
        const softBin = this.parsedData.binningData.softBins.find(bin => bin.binNumber === partResult.softBin);
        if (softBin) {
            softBin.count++;
        } else {
            this.parsedData.binningData.softBins.push({
                binNumber: partResult.softBin,
                count: 1,
                description: this.getSoftBinDescription(partResult.softBin)
            });
        }
    }

    /**
     * Get hard bin description
     */
    getHardBinDescription(binNumber) {
        const descriptions = {
            1: 'Pass',
            2: 'Functional Fail',
            3: 'Parametric Fail',
            4: 'Leakage Fail',
            5: 'Continuity Fail'
        };
        return descriptions[binNumber] || `Hard Bin ${binNumber}`;
    }

    /**
     * Get soft bin description
     */
    getSoftBinDescription(binNumber) {
        const descriptions = {
            1: 'Pass',
            2: 'Retest Pass',
            3: 'Functional Fail',
            4: 'Parametric Fail'
        };
        return descriptions[binNumber] || `Soft Bin ${binNumber}`;
    }

    /**
     * Generate summary statistics
     */
    generateSummary() {
        const totalParts = this.parsedData.partResults.length;
        const passedParts = this.parsedData.partResults.filter(part => part.passed).length;
        
        this.parsedData.summary = {
            totalParts: totalParts,
            passedParts: passedParts,
            failedParts: totalParts - passedParts,
            yield: totalParts > 0 ? ((passedParts / totalParts) * 100).toFixed(2) : 0,
            totalRecords: this.parsedData.rawRecords.length,
            testCount: this.parsedData.testResults.length,
            parametricTestCount: this.parsedData.parametricData.length,
            siteCount: this.parsedData.multiSiteData.size,
            hardBinCount: this.parsedData.binningData.hardBins.length,
            softBinCount: this.parsedData.binningData.softBins.length,
            processingTime: new Date().toISOString()
        };
        
        console.log(`📊 Summary: ${totalParts} parts, ${passedParts} passed (${this.parsedData.summary.yield}%)`);
    }

    /**
     * Reset parsed data for new file
     */
    resetParsedData() {
        this.parsedData = {
            fileInfo: {},
            lotInfo: {},
            testResults: [],
            parametricData: [],
            partResults: [],
            binningData: {
                hardBins: [],
                softBins: []
            },
            multiSiteData: new Map(),
            summary: {},
            rawRecords: [],
            recordTypes: {}
        };
    }
} 