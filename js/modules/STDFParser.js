/**
 * STDF Parser Module
 * Handles parsing of STDF files with comprehensive data extraction
 * Version: 1.0
 * Created: 2025-06-22
 */

import { FileUtils } from '../utils/FileUtils.js';

export class STDFParser {
    constructor() {
        this.supportedFormats = ['.stdf', '.stdf.gz'];
        this.recordTypes = {
            'FAR': 'File Attributes Record',
            'ATR': 'Audit Trail Record',
            'MIR': 'Master Information Record',
            'MRR': 'Master Results Record',
            'PCR': 'Part Count Record',
            'HBR': 'Hardware Bin Record',
            'SBR': 'Software Bin Record',
            'PMR': 'Pin Map Record',
            'PGR': 'Pin Group Record',
            'PLR': 'Pin List Record',
            'TCR': 'Test Conditions Record',
            'DTR': 'Datalog Text Record',
            'PIR': 'Part Information Record',
            'PRR': 'Part Results Record',
            'TSR': 'Test Synopsis Record',
            'PTR': 'Parametric Test Record',
            'MPR': 'Multiple Parametric Test Record',
            'FTR': 'Functional Test Record',
            'BPS': 'Begin Program Section',
            'EPS': 'End Program Section',
            'GDR': 'Generic Data Record'
        };
        
        this.parsedData = {
            fileInfo: {},
            lotInfo: {},
            testResults: [],
            parametricData: [],
            binningData: {
                hardBins: [],
                softBins: []
            },
            multiSiteData: new Map(),
            summary: {},
            rawRecords: [], // Track all parsed records
            recordTypes: {} // Track record type counts
        };
    }

    /**
     * Main parsing method for STDF files
     * @param {File} file - STDF file to parse
     * @returns {Promise<Object>} Parsed STDF data
     */
    async parseSTDFFile(file) {
        try {
            console.log(`Starting STDF parsing for: ${file.name}`);
            
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
                recordCount: this.parsedData.testResults.length
            };
            
            console.log(`STDF parsing completed. Records parsed: ${this.parsedData.testResults.length}`);
            
            return this.parsedData;
            
        } catch (error) {
            console.error('Error parsing STDF file:', error);
            throw new Error(`STDF parsing failed: ${error.message}`);
        }
    }

    /**
     * Parse compressed STDF file
     * @param {File} file - Compressed STDF file
     * @returns {Promise<Object>} Parsed data
     */
    async parseCompressedSTDF(file) {
        try {
            console.log('Decompressing STDF file...');
            
            // Check if pako is available for decompression
            if (typeof pako === 'undefined') {
                throw new Error('Pako library not available for decompression. Please include pako.min.js');
            }
            
            const compressedData = await file.arrayBuffer();
            const decompressedData = pako.inflate(new Uint8Array(compressedData));
            
            // Create a new file object with decompressed data
            const decompressedFile = new File([decompressedData], file.name.replace('.gz', ''), {
                type: 'application/octet-stream'
            });
            
            return await this.parseSTDFFile(decompressedFile);
            
        } catch (error) {
            console.error('Error decompressing STDF file:', error);
            throw error;
        }
    }

    /**
     * Parse STDF records from DataView
     * @param {DataView} dataView - DataView containing STDF data
     */
    async parseSTDFRecords(dataView) {
        let offset = 0;
        
        while (offset < dataView.byteLength) {
            try {
                // Read record length (first 2 bytes)
                const recordLength = dataView.getUint16(offset, true);
                if (recordLength < 4) break; // Minimum record size
                
                // Read record type (next 2 bytes)
                const recordType = dataView.getUint16(offset + 2, true);
                const recordTypeName = this.getRecordTypeName(recordType);
                
                // Parse record based on type
                const recordData = this.parseRecord(dataView, offset, recordType, recordLength);
                
                if (recordData) {
                    this.processRecord(recordTypeName, recordData);
                }
                
                offset += recordLength;
                
            } catch (error) {
                console.warn(`Error parsing record at offset ${offset}:`, error);
                offset += 2; // Skip to next potential record
            }
        }
    }

    /**
     * Get record type name from numeric type
     * @param {number} recordType - Numeric record type
     * @returns {string} Record type name
     */
    getRecordTypeName(recordType) {
        const typeMap = {
            0: 'FAR', 1: 'ATR', 2: 'MIR', 5: 'MRR', 10: 'PCR',
            1: 'HBR', 2: 'SBR', 3: 'PMR', 4: 'PGR', 5: 'PLR',
            10: 'TCR', 15: 'DTR', 5: 'PIR', 6: 'PRR', 10: 'TSR',
            15: 'PTR', 6: 'MPR', 15: 'FTR', 10: 'BPS', 20: 'EPS',
            50: 'GDR', 15: 'DTR'
        };
        
        return typeMap[recordType] || `UNKNOWN_${recordType}`;
    }

    /**
     * Parse individual STDF record
     * @param {DataView} dataView - DataView containing record data
     * @param {number} offset - Record offset
     * @param {number} recordType - Record type
     * @param {number} recordLength - Record length
     * @returns {Object} Parsed record data
     */
    parseRecord(dataView, offset, recordType, recordLength) {
        const recordData = {
            type: recordType,
            length: recordLength,
            offset: offset
        };
        
        // Parse based on record type
        switch (recordType) {
            case 0: // FAR - File Attributes Record
                return this.parseFAR(dataView, offset, recordData);
            case 1: // ATR - Audit Trail Record
                return this.parseATR(dataView, offset, recordData);
            case 2: // MIR - Master Information Record
                return this.parseMIR(dataView, offset, recordData);
            case 5: // MRR - Master Results Record
                return this.parseMRR(dataView, offset, recordData);
            case 10: // PCR - Part Count Record
                return this.parsePCR(dataView, offset, recordData);
            case 15: // PTR - Parametric Test Record
                return this.parsePTR(dataView, offset, recordData);
            case 6: // MPR - Multiple Parametric Test Record
                return this.parseMPR(dataView, offset, recordData);
            case 15: // FTR - Functional Test Record
                return this.parseFTR(dataView, offset, recordData);
            default:
                // For unknown record types, extract raw data
                const rawData = new Uint8Array(dataView.buffer, offset + 4, recordLength - 4);
                recordData.rawData = Array.from(rawData);
                return recordData;
        }
    }

    /**
     * Parse File Attributes Record (FAR)
     */
    parseFAR(dataView, offset, recordData) {
        let pos = offset + 4;
        
        recordData.CPU_TYPE = dataView.getUint8(pos);
        pos += 1;
        
        recordData.STDF_VER = dataView.getUint8(pos);
        pos += 1;
        
        return recordData;
    }

    /**
     * Parse Master Information Record (MIR)
     */
    parseMIR(dataView, offset, recordData) {
        let pos = offset + 4;
        
        // Parse lot information
        const setupTime = dataView.getUint32(pos, true);
        recordData.SETUP_T = new Date(setupTime * 1000).toISOString();
        pos += 4;
        
        // Parse lot ID (variable length string)
        const lotIdLength = dataView.getUint8(pos);
        pos += 1;
        recordData.LOT_ID = this.readString(dataView, pos, lotIdLength);
        pos += lotIdLength;
        
        // Parse part type
        const partTypeLength = dataView.getUint8(pos);
        pos += 1;
        recordData.PART_TYP = this.readString(dataView, pos, partTypeLength);
        pos += partTypeLength;
        
        // Parse node name
        const nodeNameLength = dataView.getUint8(pos);
        pos += 1;
        recordData.NODE_NAM = this.readString(dataView, pos, nodeNameLength);
        pos += nodeNameLength;
        
        // Parse tester type
        const testerTypeLength = dataView.getUint8(pos);
        pos += 1;
        recordData.TSTR_TYP = this.readString(dataView, pos, testerTypeLength);
        pos += testerTypeLength;
        
        // Parse job name
        const jobNameLength = dataView.getUint8(pos);
        pos += 1;
        recordData.JOB_NAM = this.readString(dataView, pos, jobNameLength);
        pos += jobNameLength;
        
        // Parse job revision
        const jobRevLength = dataView.getUint8(pos);
        pos += 1;
        recordData.JOB_REV = this.readString(dataView, pos, jobRevLength);
        pos += jobRevLength;
        
        // Parse sublote name
        const subloteNameLength = dataView.getUint8(pos);
        pos += 1;
        recordData.SBLOT_ID = this.readString(dataView, pos, subloteNameLength);
        pos += subloteNameLength;
        
        // Parse operator name
        const operatorNameLength = dataView.getUint8(pos);
        pos += 1;
        recordData.OPER_NAM = this.readString(dataView, pos, operatorNameLength);
        pos += operatorNameLength;
        
        // Parse exec type
        const execTypeLength = dataView.getUint8(pos);
        pos += 1;
        recordData.EXEC_TYP = this.readString(dataView, pos, execTypeLength);
        pos += execTypeLength;
        
        // Parse exec version
        const execVerLength = dataView.getUint8(pos);
        pos += 1;
        recordData.EXEC_VER = this.readString(dataView, pos, execVerLength);
        pos += execVerLength;
        
        // Parse test code
        const testCodeLength = dataView.getUint8(pos);
        pos += 1;
        recordData.TEST_COD = this.readString(dataView, pos, testCodeLength);
        pos += testCodeLength;
        
        // Parse test temperature
        recordData.TST_TEMP = dataView.getInt16(pos, true);
        pos += 2;
        
        // Parse user text
        const userTextLength = dataView.getUint8(pos);
        pos += 1;
        recordData.USER_TXT = this.readString(dataView, pos, userTextLength);
        pos += userTextLength;
        
        // Parse aux file
        const auxFileLength = dataView.getUint8(pos);
        pos += 1;
        recordData.AUX_FILE = this.readString(dataView, pos, auxFileLength);
        pos += auxFileLength;
        
        // Parse package type
        const packageTypeLength = dataView.getUint8(pos);
        pos += 1;
        recordData.PKG_TYP = this.readString(dataView, pos, packageTypeLength);
        pos += packageTypeLength;
        
        // Parse family ID
        const familyIdLength = dataView.getUint8(pos);
        pos += 1;
        recordData.FAMLY_ID = this.readString(dataView, pos, familyIdLength);
        pos += familyIdLength;
        
        // Parse date code
        const dateCodeLength = dataView.getUint8(pos);
        pos += 1;
        recordData.DATE_COD = this.readString(dataView, pos, dateCodeLength);
        pos += dateCodeLength;
        
        // Parse facility ID
        const facilityIdLength = dataView.getUint8(pos);
        pos += 1;
        recordData.FACIL_ID = this.readString(dataView, pos, facilityIdLength);
        pos += facilityIdLength;
        
        // Parse floor ID
        const floorIdLength = dataView.getUint8(pos);
        pos += 1;
        recordData.FLOOR_ID = this.readString(dataView, pos, floorIdLength);
        pos += floorIdLength;
        
        // Parse process ID
        const processIdLength = dataView.getUint8(pos);
        pos += 1;
        recordData.PROC_ID = this.readString(dataView, pos, processIdLength);
        pos += processIdLength;
        
        // Parse operation frequency
        const operationFreqLength = dataView.getUint8(pos);
        pos += 1;
        recordData.OPER_FRQ = this.readString(dataView, pos, operationFreqLength);
        pos += operationFreqLength;
        
        // Parse specification name
        const specNameLength = dataView.getUint8(pos);
        pos += 1;
        recordData.SPEC_NAM = this.readString(dataView, pos, specNameLength);
        pos += specNameLength;
        
        // Parse specification version
        const specVerLength = dataView.getUint8(pos);
        pos += 1;
        recordData.SPEC_VER = this.readString(dataView, pos, specVerLength);
        pos += specVerLength;
        
        // Parse flow ID
        const flowIdLength = dataView.getUint8(pos);
        pos += 1;
        recordData.FLOW_ID = this.readString(dataView, pos, flowIdLength);
        pos += flowIdLength;
        
        // Parse setup ID
        const setupIdLength = dataView.getUint8(pos);
        pos += 1;
        recordData.SETUP_ID = this.readString(dataView, pos, setupIdLength);
        pos += setupIdLength;
        
        // Parse design revision
        const designRevLength = dataView.getUint8(pos);
        pos += 1;
        recordData.DSGN_REV = this.readString(dataView, pos, designRevLength);
        pos += designRevLength;
        
        // Parse engineering ID
        const engineeringIdLength = dataView.getUint8(pos);
        pos += 1;
        recordData.ENG_ID = this.readString(dataView, pos, engineeringIdLength);
        pos += engineeringIdLength;
        
        // Parse ROM code ID
        const romCodeIdLength = dataView.getUint8(pos);
        pos += 1;
        recordData.ROM_COD = this.readString(dataView, pos, romCodeIdLength);
        pos += romCodeIdLength;
        
        // Parse serial number
        const serialNumberLength = dataView.getUint8(pos);
        pos += 1;
        recordData.SERL_NUM = this.readString(dataView, pos, serialNumberLength);
        pos += serialNumberLength;
        
        // Parse supervisor name
        const supervisorNameLength = dataView.getUint8(pos);
        pos += 1;
        recordData.SUP_NAM = this.readString(dataView, pos, supervisorNameLength);
        pos += supervisorNameLength;
        
        return recordData;
    }

    /**
     * Parse Parametric Test Record (PTR)
     */
    parsePTR(dataView, offset, recordData) {
        let pos = offset + 4;
        
        recordData.TEST_NUM = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.HEAD_NUM = dataView.getUint8(pos);
        pos += 1;
        
        recordData.SITE_NUM = dataView.getUint8(pos);
        pos += 1;
        
        recordData.TEST_FLG = dataView.getUint8(pos);
        pos += 1;
        
        recordData.PARM_FLG = dataView.getUint8(pos);
        pos += 1;
        
        recordData.RESULT = dataView.getFloat32(pos, true);
        pos += 4;
        
        // Parse test text
        const testTextLength = dataView.getUint8(pos);
        pos += 1;
        recordData.TEST_TXT = this.readString(dataView, pos, testTextLength);
        pos += testTextLength;
        
        // Parse alarm ID
        const alarmIdLength = dataView.getUint8(pos);
        pos += 1;
        recordData.ALARM_ID = this.readString(dataView, pos, alarmIdLength);
        pos += alarmIdLength;
        
        // Parse optional fields based on PARM_FLG
        if (recordData.PARM_FLG & 0x01) {
            recordData.OPT_FLAG = dataView.getUint8(pos);
            pos += 1;
        }
        
        if (recordData.PARM_FLG & 0x02) {
            recordData.RES_SCAL = dataView.getInt8(pos);
            pos += 1;
        }
        
        if (recordData.PARM_FLG & 0x04) {
            recordData.LLM_SCAL = dataView.getInt8(pos);
            pos += 1;
        }
        
        if (recordData.PARM_FLG & 0x08) {
            recordData.HLM_SCAL = dataView.getInt8(pos);
            pos += 1;
        }
        
        if (recordData.PARM_FLG & 0x10) {
            recordData.LO_LIMIT = dataView.getFloat32(pos, true);
            pos += 4;
        }
        
        if (recordData.PARM_FLG & 0x20) {
            recordData.HI_LIMIT = dataView.getFloat32(pos, true);
            pos += 4;
        }
        
        if (recordData.PARM_FLG & 0x40) {
            recordData.START_IN = dataView.getFloat32(pos, true);
            pos += 4;
        }
        
        if (recordData.PARM_FLG & 0x80) {
            recordData.INCR_IN = dataView.getFloat32(pos, true);
            pos += 4;
        }
        
        return recordData;
    }

    /**
     * Parse Functional Test Record (FTR)
     */
    parseFTR(dataView, offset, recordData) {
        let pos = offset + 4;
        
        recordData.TEST_NUM = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.HEAD_NUM = dataView.getUint8(pos);
        pos += 1;
        
        recordData.SITE_NUM = dataView.getUint8(pos);
        pos += 1;
        
        recordData.TEST_FLG = dataView.getUint8(pos);
        pos += 1;
        
        recordData.OPT_FLAG = dataView.getUint8(pos);
        pos += 1;
        
        recordData.CYCL_CNT = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.REL_VADR = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.REPT_CNT = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.NUM_FAIL = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.XFAIL_AD = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.YFAIL_AD = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.VECT_OFF = dataView.getUint16(pos, true);
        pos += 2;
        
        recordData.RTN_INDX = dataView.getUint16(pos, true);
        pos += 2;
        
        recordData.PGM_INDX = dataView.getUint16(pos, true);
        pos += 2;
        
        recordData.PGM_CNT = dataView.getUint16(pos, true);
        pos += 2;
        
        recordData.FAIL_PIN = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.SPAD_MAP = dataView.getUint32(pos, true);
        pos += 4;
        
        // Parse test text
        const testTextLength = dataView.getUint8(pos);
        pos += 1;
        recordData.TEST_TXT = this.readString(dataView, pos, testTextLength);
        pos += testTextLength;
        
        // Parse alarm ID
        const alarmIdLength = dataView.getUint8(pos);
        pos += 1;
        recordData.ALARM_ID = this.readString(dataView, pos, alarmIdLength);
        pos += alarmIdLength;
        
        // Parse program text
        const programTextLength = dataView.getUint8(pos);
        pos += 1;
        recordData.PROG_TXT = this.readString(dataView, pos, programTextLength);
        pos += programTextLength;
        
        // Parse result text
        const resultTextLength = dataView.getUint8(pos);
        pos += 1;
        recordData.RSLT_TXT = this.readString(dataView, pos, resultTextLength);
        pos += resultTextLength;
        
        return recordData;
    }

    /**
     * Parse Part Results Record (PRR)
     */
    parsePRR(dataView, offset, recordData) {
        let pos = offset + 4;
        
        recordData.HEAD_NUM = dataView.getUint8(pos);
        pos += 1;
        
        recordData.SITE_NUM = dataView.getUint8(pos);
        pos += 1;
        
        recordData.PART_FLG = dataView.getUint8(pos);
        pos += 1;
        
        recordData.NUM_TEST = dataView.getUint16(pos, true);
        pos += 2;
        
        recordData.HARD_BIN = dataView.getUint16(pos, true);
        pos += 2;
        
        recordData.SOFT_BIN = dataView.getUint16(pos, true);
        pos += 2;
        
        recordData.X_COORD = dataView.getInt16(pos, true);
        pos += 2;
        
        recordData.Y_COORD = dataView.getInt16(pos, true);
        pos += 2;
        
        recordData.TEST_T = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.PART_ID = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.PART_TXT = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.PART_FIX = dataView.getUint32(pos, true);
        pos += 4;
        
        return recordData;
    }

    /**
     * Parse Part Count Record (PCR)
     */
    parsePCR(dataView, offset, recordData) {
        let pos = offset + 4;
        
        recordData.HEAD_NUM = dataView.getUint8(pos);
        pos += 1;
        
        recordData.SITE_NUM = dataView.getUint8(pos);
        pos += 1;
        
        recordData.PART_CNT = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.RETEST_CNT = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.ABORT_CNT = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.GOOD_CNT = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.FUNC_CNT = dataView.getUint32(pos, true);
        pos += 4;
        
        return recordData;
    }

    /**
     * Parse Master Results Record (MRR)
     */
    parseMRR(dataView, offset, recordData) {
        let pos = offset + 4;
        
        recordData.FINISH_T = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.DISP_COD = dataView.getUint8(pos);
        pos += 1;
        
        recordData.USR_DESC = dataView.getUint8(pos);
        pos += 1;
        
        recordData.EXC_DESC = dataView.getUint8(pos);
        pos += 1;
        
        // Parse user description
        const userDescLength = dataView.getUint8(pos);
        pos += 1;
        recordData.USR_DESC_TXT = this.readString(dataView, pos, userDescLength);
        pos += userDescLength;
        
        // Parse exception description
        const excDescLength = dataView.getUint8(pos);
        pos += 1;
        recordData.EXC_DESC_TXT = this.readString(dataView, pos, excDescLength);
        pos += excDescLength;
        
        return recordData;
    }

    /**
     * Parse Audit Trail Record (ATR)
     */
    parseATR(dataView, offset, recordData) {
        let pos = offset + 4;
        
        recordData.MOD_TIM = dataView.getUint32(pos, true);
        pos += 4;
        
        recordData.CMD_LINE = dataView.getUint8(pos);
        pos += 1;
        
        // Parse command line
        const cmdLineLength = dataView.getUint8(pos);
        pos += 1;
        recordData.CMD_LINE_TXT = this.readString(dataView, pos, cmdLineLength);
        pos += cmdLineLength;
        
        return recordData;
    }

    /**
     * Read string from DataView
     * @param {DataView} dataView - DataView to read from
     * @param {number} offset - String offset
     * @param {number} length - String length
     * @returns {string} Read string
     */
    readString(dataView, offset, length) {
        if (length === 0) return '';
        
        const bytes = new Uint8Array(dataView.buffer, offset, length);
        return new TextDecoder('utf-8').decode(bytes);
    }

    /**
     * Process parsed record and store in appropriate data structure
     * @param {string} recordType - Record type name
     * @param {Object} recordData - Parsed record data
     */
    processRecord(recordType, recordData) {
        // Store in rawRecords array for counting
        this.parsedData.rawRecords.push({
            type: recordType,
            data: recordData,
            timestamp: new Date().toISOString()
        });
        
        switch (recordType) {
            case 'MIR':
                this.parsedData.lotInfo = { ...this.parsedData.lotInfo, ...recordData };
                break;
            case 'PTR':
                this.parsedData.parametricData.push(recordData);
                this.processParametricTest(recordData);
                break;
            case 'FTR':
                this.parsedData.testResults.push(recordData);
                this.processFunctionalTest(recordData);
                break;
            case 'PRR':
                this.processPartResult(recordData);
                break;
            case 'PCR':
                this.processPartCount(recordData);
                break;
            case 'MRR':
                this.parsedData.lotInfo = { ...this.parsedData.lotInfo, ...recordData };
                break;
            case 'ATR':
                this.parsedData.lotInfo = { ...this.parsedData.lotInfo, ...recordData };
                break;
            default:
                // Store unknown records for debugging
                if (!this.parsedData.unknownRecords) {
                    this.parsedData.unknownRecords = [];
                }
                this.parsedData.unknownRecords.push({ type: recordType, data: recordData });
        }
        
        // Track record type counts
        if (!this.parsedData.recordTypes[recordType]) {
            this.parsedData.recordTypes[recordType] = 0;
        }
        this.parsedData.recordTypes[recordType]++;
    }

    /**
     * Process parametric test data
     * @param {Object} testData - Parametric test record
     */
    processParametricTest(testData) {
        const siteKey = `Site${testData.SITE_NUM}`;
        
        if (!this.parsedData.multiSiteData.has(siteKey)) {
            this.parsedData.multiSiteData.set(siteKey, {
                parametricTests: [],
                functionalTests: [],
                partResults: []
            });
        }
        
        const siteData = this.parsedData.multiSiteData.get(siteKey);
        siteData.parametricTests.push(testData);
    }

    /**
     * Process functional test data
     * @param {Object} testData - Functional test record
     */
    processFunctionalTest(testData) {
        const siteKey = `Site${testData.SITE_NUM}`;
        
        if (!this.parsedData.multiSiteData.has(siteKey)) {
            this.parsedData.multiSiteData.set(siteKey, {
                parametricTests: [],
                functionalTests: [],
                partResults: []
            });
        }
        
        const siteData = this.parsedData.multiSiteData.get(siteKey);
        siteData.functionalTests.push(testData);
    }

    /**
     * Process part result data
     * @param {Object} partData - Part result record
     */
    processPartResult(partData) {
        const siteKey = `Site${partData.SITE_NUM}`;
        
        if (!this.parsedData.multiSiteData.has(siteKey)) {
            this.parsedData.multiSiteData.set(siteKey, {
                parametricTests: [],
                functionalTests: [],
                partResults: []
            });
        }
        
        const siteData = this.parsedData.multiSiteData.get(siteKey);
        siteData.partResults.push(partData);
        
        // Process binning data
        if (partData.HARD_BIN !== undefined) {
            this.processBinningData('hard', partData.HARD_BIN);
        }
        
        if (partData.SOFT_BIN !== undefined) {
            this.processBinningData('soft', partData.SOFT_BIN);
        }
    }

    /**
     * Process part count data
     * @param {Object} countData - Part count record
     */
    processPartCount(countData) {
        if (!this.parsedData.summary.partCounts) {
            this.parsedData.summary.partCounts = [];
        }
        
        this.parsedData.summary.partCounts.push(countData);
    }

    /**
     * Process binning data
     * @param {string} binType - 'hard' or 'soft'
     * @param {number} binNumber - Bin number
     */
    processBinningData(binType, binNumber) {
        const binArray = binType === 'hard' ? this.parsedData.binningData.hardBins : this.parsedData.binningData.softBins;
        
        const existingBin = binArray.find(bin => bin.binNumber === binNumber);
        if (existingBin) {
            existingBin.count++;
        } else {
            binArray.push({
                binNumber: binNumber,
                count: 1,
                type: binType
            });
        }
    }

    /**
     * Generate summary statistics from parsed data
     */
    generateSummary() {
        const summary = this.parsedData.summary;
        
        // Calculate total parts tested
        summary.totalParts = 0;
        summary.totalPassed = 0;
        summary.totalFailed = 0;
        
        if (summary.partCounts) {
            summary.partCounts.forEach(count => {
                summary.totalParts += count.PART_CNT || 0;
                summary.totalPassed += count.GOOD_CNT || 0;
                summary.totalFailed += (count.PART_CNT || 0) - (count.GOOD_CNT || 0);
            });
        }
        
        // Calculate yield
        summary.yield = summary.totalParts > 0 ? (summary.totalPassed / summary.totalParts) * 100 : 0;
        
        // Calculate parametric test statistics
        if (this.parsedData.parametricData.length > 0) {
            summary.parametricTests = {
                totalTests: this.parsedData.parametricData.length,
                uniqueTests: new Set(this.parsedData.parametricData.map(test => test.TEST_NUM)).size,
                sites: new Set(this.parsedData.parametricData.map(test => test.SITE_NUM)).size
            };
        }
        
        // Calculate functional test statistics
        if (this.parsedData.testResults.length > 0) {
            summary.functionalTests = {
                totalTests: this.parsedData.testResults.length,
                uniqueTests: new Set(this.parsedData.testResults.map(test => test.TEST_NUM)).size,
                sites: new Set(this.parsedData.testResults.map(test => test.SITE_NUM)).size
            };
        }
        
        // Calculate binning statistics
        summary.binning = {
            hardBins: this.parsedData.binningData.hardBins.length,
            softBins: this.parsedData.binningData.softBins.length,
            totalBins: this.parsedData.binningData.hardBins.length + this.parsedData.binningData.softBins.length
        };
        
        // Multi-site statistics
        summary.multiSite = {
            totalSites: this.parsedData.multiSiteData.size,
            sites: Array.from(this.parsedData.multiSiteData.keys())
        };
        
        // Record type statistics
        summary.totalRecords = this.parsedData.rawRecords ? this.parsedData.rawRecords.length : 0;
        summary.recordTypes = this.parsedData.recordTypes;
    }

    /**
     * Get parsed data summary
     * @returns {Object} Summary of parsed data
     */
    getSummary() {
        return this.parsedData.summary;
    }

    /**
     * Get lot information
     * @returns {Object} Lot information
     */
    getLotInfo() {
        return this.parsedData.lotInfo;
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