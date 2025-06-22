/**
 * Summary File Parser
 * Handles parsing of .lotSumTXT summary files
 * Version: 1.0
 * Created: 2025-01-27
 */

import { FileUtils } from '../utils/FileUtils.js';

export class SummaryFileParser {
    constructor() {
        this.sections = {
            HEADER: 'header',
            TEST_RESULTS: 'test_results',
            SUMMARY: 'summary',
            HARDBIN: 'hardbin'
        };
    }

    /**
     * Parse summary file content
     * @param {string} content - File content
     * @returns {Object} Parsed data
     */
    parseSummaryFile(content) {
        try {
            console.log(`Parsing content with ${content.length} characters`);
            
            const lines = content.split('\n');
            const lotInfo = {};
            const testResults = [];
            const siteResults = { Site1: [], Site2: [], Site3: [], Site4: [] };
            
            let currentSection = this.sections.HEADER;
            
            // Parse each line
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Section detection - more flexible
                if (line.includes('Soft Hard') || line.includes('Test Results:') || line.includes('Test1:') || 
                    (line.includes('PASS') && line.includes('FAIL')) || 
                    line.match(/^\w+\s+\d+/) || // Any line starting with word and number
                    line.match(/^\d+\s+\d+\s+(PASS|FAIL)/)) {
                    currentSection = this.sections.TEST_RESULTS;
                    console.log(`Switched to TEST_RESULTS section at line ${i + 1}: "${line}"`);
                } else if (line.includes('* GOOD') || line.includes('Summary:') || line.includes('Total Devices:') || 
                          line.includes('Yield:') || line.includes('* FAIL') || line.includes('* TOTAL')) {
                    currentSection = this.sections.SUMMARY;
                    console.log(`Switched to SUMMARY section at line ${i + 1}: "${line}"`);
                } else if (line.includes('* HARDBIN') || line.includes('Hardbin Summary:') || line.includes('Bin ')) {
                    currentSection = this.sections.HARDBIN;
                    console.log(`Switched to HARDBIN section at line ${i + 1}: "${line}"`);
                }
                
                // Parse based on current section
                switch (currentSection) {
                    case this.sections.HEADER:
                        this.parseHeaderLine(line, lotInfo);
                        break;
                    case this.sections.TEST_RESULTS:
                        const testResult = this.parseTestResultLine(line);
                        if (testResult) {
                            testResults.push(testResult);
                            this.updateSiteResults(testResult, siteResults);
                            console.log(`Added test result: ${testResult.description} = ${testResult.result}`);
                        }
                        break;
                }
            }
            
            // Parse summary section
            const summary = this.parseSummarySection(lines, 0);
            
            // Parse hardbin section
            const hardbin = this.parseHardbinSection(lines, 0);
            
            // Fallback: If no test results were parsed, create them from summary data
            if (testResults.length === 0 && summary.goodCount !== undefined) {
                console.log('No test results parsed, creating fallback from summary data');
                
                // Create a synthetic test result from the summary
                const syntheticTest = {
                    softBin: 1,
                    hardBin: 1,
                    result: summary.goodCount > summary.failCount ? 'PASS' : 'FAIL',
                    description: 'Synthetic_Test',
                    total: summary.totalCount || (summary.goodCount + summary.failCount),
                    percentage: summary.goodPercentage || 0,
                    site1: Math.floor((summary.goodCount || 0) / 4),
                    site2: Math.floor((summary.goodCount || 0) / 4),
                    site3: Math.floor((summary.goodCount || 0) / 4),
                    site4: (summary.goodCount || 0) - (Math.floor((summary.goodCount || 0) / 4) * 3),
                    sites: {
                        1: Math.floor((summary.goodCount || 0) / 4),
                        2: Math.floor((summary.goodCount || 0) / 4),
                        3: Math.floor((summary.goodCount || 0) / 4),
                        4: (summary.goodCount || 0) - (Math.floor((summary.goodCount || 0) / 4) * 3)
                    },
                    totalSites: summary.goodCount || 0
                };
                
                testResults.push(syntheticTest);
                this.updateSiteResults(syntheticTest, siteResults);
                console.log('Created synthetic test result from summary data');
            }
            
            // Calculate additional analytics
            const analytics = this.calculateAnalytics(testResults, summary, lotInfo);
            
            const result = {
                lotInfo,
                testResults,
                siteResults,
                summary,
                hardbin,
                analytics,
                metadata: {
                    totalTests: testResults.length,
                    totalSites: 4,
                    parseTime: new Date().toISOString()
                }
            };
            
            console.log(`Final parsing result:`, result);
            return result;
            
        } catch (error) {
            console.error(`Error in parseSummaryFile:`, error);
            throw error;
        }
    }

    /**
     * Calculate additional analytics
     * @param {Array} testResults - Test results array
     * @param {Object} summary - Summary data
     * @param {Object} lotInfo - Lot information
     * @returns {Object} Analytics data
     */
    calculateAnalytics(testResults, summary, lotInfo) {
        const totalDevices = lotInfo.Lot_Size || 0;
        const failures = testResults.filter(t => t.result === 'FAIL');
        const failureCount = failures.length;

        const yieldAnalysis = this.analyzeYieldTrend(summary.yieldPercent, failureCount);
        const failureAnalysis = {
            failures: failures,
            failureCount: failureCount,
            failureRate: totalDevices > 0 ? (failureCount / totalDevices) * 100 : 0
        };
        const rootCause = this.performRootCauseAnalysis(failures, lotInfo);
        const qualityMetrics = this.calculateQualityMetrics(summary.yieldPercent, failureCount, totalDevices);

        // Site performance calculation
        const sitePerformance = {};
        testResults.forEach(test => {
            if (test.sites) {
                Object.entries(test.sites).forEach(([siteNum, count]) => {
                    const siteKey = `Site${siteNum}`;
                    if (!sitePerformance[siteKey]) {
                        sitePerformance[siteKey] = { total: 0, status: 'Unknown' };
                    }
                    sitePerformance[siteKey].total += count;
                });
            }
        });

        return {
            testResults: testResults,
            yieldAnalysis,
            failureAnalysis,
            sitePerformance,
            rootCause,
            qualityMetrics
        };
    }

    /**
     * Get site status based on yield
     * @param {number} yieldPercent - Site yield percentage
     * @returns {string} Site status
     */
    getSiteStatus(yieldPercent) {
        if (yieldPercent >= 90) return 'Excellent';
        if (yieldPercent >= 80) return 'Good';
        if (yieldPercent >= 70) return 'Fair';
        if (yieldPercent >= 50) return 'Poor';
        return 'Critical';
    }

    /**
     * Calculate failure severity
     * @param {number} total - Total failures
     * @param {number} totalDevices - Total devices
     * @returns {string} Severity level
     */
    calculateFailureSeverity(total, totalDevices) {
        const percentage = (total / totalDevices) * 100;
        if (percentage > 20) return 'Critical';
        if (percentage > 10) return 'High';
        if (percentage > 5) return 'Medium';
        if (percentage > 1) return 'Low';
        return 'Minor';
    }

    /**
     * Calculate failure impact
     * @param {number} total - Total failures
     * @param {number} totalDevices - Total devices
     * @returns {number} Impact score
     */
    calculateFailureImpact(total, totalDevices) {
        return (total / totalDevices) * 100;
    }

    /**
     * Calculate failure priority
     * @param {number} percentage - Failure percentage
     * @param {number} total - Total failures
     * @returns {number} Priority score
     */
    calculateFailurePriority(percentage, total) {
        return (percentage * 0.7) + (total * 0.3);
    }

    /**
     * Analyze failure patterns
     * @param {Array} failures - Failure array
     * @param {number} totalDevices - Total devices
     * @returns {Array} Failure patterns
     */
    analyzeFailurePatterns(failures, totalDevices) {
        const patterns = [];
        
        // Pattern 1: High frequency, low impact
        const highFreqLowImpact = failures.filter(f => f.total > 10 && (f.total / totalDevices) < 0.05);
        if (highFreqLowImpact.length > 0) {
            patterns.push({
                type: 'High Frequency, Low Impact',
                description: 'Multiple small failures',
                count: highFreqLowImpact.length,
                impact: 'Low'
            });
        }
        
        // Pattern 2: Low frequency, high impact
        const lowFreqHighImpact = failures.filter(f => f.total <= 10 && (f.total / totalDevices) > 0.1);
        if (lowFreqHighImpact.length > 0) {
            patterns.push({
                type: 'Low Frequency, High Impact',
                description: 'Rare but significant failures',
                count: lowFreqHighImpact.length,
                impact: 'High'
            });
        }
        
        // Pattern 3: Systematic failures
        const systematicFailures = failures.filter(f => f.percentage > 15);
        if (systematicFailures.length > 0) {
            patterns.push({
                type: 'Systematic Failures',
                description: 'Consistent failure patterns',
                count: systematicFailures.length,
                impact: 'Medium'
            });
        }
        
        return patterns;
    }

    /**
     * Perform root cause analysis
     * @param {Array} failures - Failure array
     * @param {Object} lotInfo - Lot information
     * @returns {Object} Root cause analysis
     */
    performRootCauseAnalysis(failures, lotInfo) {
        const analysis = {
            potentialCauses: [],
            recommendations: []
        };
        
        // Analyze failure types
        const usbFailures = failures.filter(f => f.description.toLowerCase().includes('usb'));
        const voltageFailures = failures.filter(f => f.description.toLowerCase().includes('voltage') || f.description.toLowerCase().includes('voh'));
        const functionFailures = failures.filter(f => f.description.toLowerCase().includes('function'));
        
        if (usbFailures.length > 0) {
            analysis.potentialCauses.push('USB interface issues');
            analysis.recommendations.push('Check USB connection and driver compatibility');
        }
        
        if (voltageFailures.length > 0) {
            analysis.potentialCauses.push('Voltage regulation problems');
            analysis.recommendations.push('Verify power supply stability and voltage levels');
        }
        
        if (functionFailures.length > 0) {
            analysis.potentialCauses.push('Functional test failures');
            analysis.recommendations.push('Review test conditions and device specifications');
        }
        
        // Default recommendations if no specific patterns found
        if (analysis.potentialCauses.length === 0) {
            analysis.potentialCauses.push('General test environment issues');
            analysis.recommendations.push('Review test setup and environmental conditions');
        }
        
        return analysis;
    }

    /**
     * Calculate quality metrics
     * @param {number} yieldPercent - Yield percentage
     * @param {number} failureCount - Failure count
     * @param {number} totalDevices - Total devices
     * @returns {Object} Quality metrics
     */
    calculateQualityMetrics(yieldPercent, failureCount, totalDevices) {
        const defectRate = (100 - yieldPercent) / 100;
        
        return {
            sigmaLevel: this.calculateSigmaLevel(100 - yieldPercent),
            cpk: this.calculateCpk(yieldPercent),
            qualityScore: this.calculateQualityScore(yieldPercent, failureCount, totalDevices),
            defectRate: defectRate
        };
    }

    /**
     * Calculate sigma level from defect rate
     * @param {number} defectRate - Defect rate percentage
     * @returns {number} Sigma level
     */
    calculateSigmaLevel(defectRate) {
        // Convert percentage to decimal
        const defectRateDecimal = defectRate / 100;
        
        // Simple sigma level calculation
        if (defectRateDecimal <= 0.0000034) return 6.0; // 3.4 DPMO
        if (defectRateDecimal <= 0.000233) return 5.0;  // 233 DPMO
        if (defectRateDecimal <= 0.00621) return 4.0;   // 6,210 DPMO
        if (defectRateDecimal <= 0.0668) return 3.0;    // 66,800 DPMO
        if (defectRateDecimal <= 0.3085) return 2.0;    // 308,500 DPMO
        if (defectRateDecimal <= 0.6915) return 1.0;    // 691,500 DPMO
        
        return 0.0; // Below 1 sigma
    }

    /**
     * Calculate Cpk (Process Capability Index)
     * @param {number} yieldPercent - Yield percentage
     * @returns {number} Cpk value
     */
    calculateCpk(yieldPercent) {
        // Simplified Cpk calculation based on yield
        const defectRate = 100 - yieldPercent;
        const sigmaLevel = this.calculateSigmaLevel(defectRate);
        
        // Cpk is approximately sigma/3
        return sigmaLevel / 3;
    }

    /**
     * Calculate quality score (0-100)
     * @param {number} yieldPercent - Yield percentage
     * @param {number} failureCount - Number of failures
     * @param {number} totalDevices - Total number of devices
     * @returns {number} Quality score
     */
    calculateQualityScore(yieldPercent, failureCount, totalDevices) {
        // Base score from yield (70% weight)
        const yieldScore = (yieldPercent / 100) * 70;
        
        // Penalty for failure rate (30% weight)
        const failureRate = totalDevices > 0 ? (failureCount / totalDevices) * 100 : 0;
        const failurePenalty = Math.min(failureRate * 0.3, 30);
        
        return Math.max(0, Math.min(100, yieldScore - failurePenalty));
    }

    /**
     * Predict yield based on current data
     * @param {number} currentYield - Current yield percentage
     * @param {number} criticalFailures - Number of critical failures
     * @returns {number} Predicted yield
     */
    predictYield(currentYield, criticalFailures) {
        // Simple prediction model
        const criticalFailureImpact = criticalFailures * 0.5; // Each critical failure reduces yield by 0.5%
        return Math.max(0, currentYield - criticalFailureImpact);
    }

    /**
     * Analyze yield trend
     * @param {number} yieldPercent - Current yield percentage
     * @param {number} criticalFailures - Number of critical failures
     * @returns {string} Trend description
     */
    analyzeYieldTrend(yieldPercent, criticalFailures) {
        if (yieldPercent >= 95) return 'Excellent';
        if (yieldPercent >= 90) return 'Good';
        if (yieldPercent >= 80) return 'Fair';
        if (yieldPercent >= 70) return 'Poor';
        return 'Critical';
    }

    /**
     * Categorize failure by description
     * @param {string} description - Failure description
     * @returns {string} Failure category
     */
    categorizeFailure(description) {
        const desc = description.toLowerCase();
        
        if (desc.includes('usb')) return 'USB Interface';
        if (desc.includes('voltage') || desc.includes('voh') || desc.includes('vol')) return 'Voltage';
        if (desc.includes('function') || desc.includes('func')) return 'Functional';
        if (desc.includes('timing') || desc.includes('time')) return 'Timing';
        if (desc.includes('current') || desc.includes('cur')) return 'Current';
        if (desc.includes('power') || desc.includes('pwr')) return 'Power';
        
        return 'Other';
    }

    /**
     * Parse header line
     * @param {string} line - Header line
     * @param {Object} lotInfo - Lot info object to populate
     */
    parseHeaderLine(line, lotInfo) {
        // Pattern 1: Lot number extraction - handle multiple spaces
        const lotMatch = line.match(/Lot_number\s*:\s*([A-Z0-9\-]+)/i);
        if (lotMatch) {
            lotInfo.Lot_number = lotMatch[1];
            console.log(`Extracted lot number: ${lotMatch[1]}`);
        }
        
        // Pattern 2: Device name extraction - handle multiple spaces
        const deviceMatch = line.match(/Device_name\s*:\s*([A-Z0-9_]+)/i);
        if (deviceMatch) {
            lotInfo.Device_name = deviceMatch[1];
            console.log(`Extracted device name: ${deviceMatch[1]}`);
        }
        
        // Pattern 3: Lot size extraction - handle multiple spaces
        const sizeMatch = line.match(/Lot_Size\s*:\s*(\d+)/i);
        if (sizeMatch) {
            lotInfo.Lot_Size = parseInt(sizeMatch[1], 10);
            console.log(`Extracted lot size: ${sizeMatch[1]}`);
        }
        
        // Pattern 4: Date/time extraction
        const dateMatch = line.match(/(\d{8})/);
        if (dateMatch) {
            lotInfo.Start_time = FileUtils.parseDateTime(dateMatch[1]);
            console.log(`Extracted date: ${dateMatch[1]}`);
        }
        
        // Pattern 5: Operator extraction - handle multiple spaces
        const operatorMatch = line.match(/Operator_id\s*:\s*([A-Z0-9]+)/i);
        if (operatorMatch) {
            lotInfo.Operator_id = operatorMatch[1];
            console.log(`Extracted operator: ${operatorMatch[1]}`);
        }
    }

    /**
     * Parse test result line
     * @param {string} line - Test result line
     * @returns {Object|null} Parsed test result
     */
    parseTestResultLine(line) {
        if (!line || line.trim() === '') return null;
        
        const trimmedLine = line.trim();
        
        // Debug: Log only lines that might be test data (not every line)
        if (trimmedLine.match(/^\w+\s+\d+/) || trimmedLine.match(/^\d+\s+\d+\s+(PASS|FAIL)/)) {
            console.log(`Processing potential test line: "${trimmedLine}"`);
        }
        
        // Pattern 0: Actual file format "   1    1    PASS pass_50mA                                          906( 53.0)    216     249     204     237   "
        const actualFormatMatch = trimmedLine.match(/^\s*(\d+)\s+(\d+)\s+(PASS|FAIL)\s+([A-Z0-9_]+)\s+(\d+)\(\s*([\d.]+)\)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
        if (actualFormatMatch) {
            const [, softBin, hardBin, result, description, total, percentage, site1, site2, site3, site4] = actualFormatMatch;
            
            console.log(`Parsed actual format: ${description} = ${result} (${total})`);
            
            return {
                softBin: parseInt(softBin, 10),
                hardBin: parseInt(hardBin, 10),
                result,
                description,
                total: parseInt(total, 10),
                percentage: parseFloat(percentage),
                site1: parseInt(site1, 10),
                site2: parseInt(site2, 10),
                site3: parseInt(site3, 10),
                site4: parseInt(site4, 10),
                sites: {
                    1: parseInt(site1, 10),
                    2: parseInt(site2, 10),
                    3: parseInt(site3, 10),
                    4: parseInt(site4, 10)
                },
                totalSites: parseInt(site1, 10) + parseInt(site2, 10) + parseInt(site3, 10) + parseInt(site4, 10)
            };
        }
        
        // Pattern 1: Standard format "1 1 FAIL Test1 100 10.0 50 30 10 10"
        const standardMatch = trimmedLine.match(/^(\d+)\s+(\d+)\s+(PASS|FAIL)\s+(\w+)\s+(\d+)\s+([\d.]+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/);
        if (standardMatch) {
            const [, softBin, hardBin, result, description, total, percentage, site1, site2, site3, site4] = standardMatch;
            
            console.log(`Parsed standard format: ${description} = ${result}`);
            
            return {
                softBin: parseInt(softBin, 10),
                hardBin: parseInt(hardBin, 10),
                result,
                description,
                total: parseInt(total, 10),
                percentage: parseFloat(percentage),
                site1: parseInt(site1, 10),
                site2: parseInt(site2, 10),
                site3: parseInt(site3, 10),
                site4: parseInt(site4, 10),
                sites: {
                    1: parseInt(site1, 10),
                    2: parseInt(site2, 10),
                    3: parseInt(site3, 10),
                    4: parseInt(site4, 10)
                },
                totalSites: parseInt(site1, 10) + parseInt(site2, 10) + parseInt(site3, 10) + parseInt(site4, 10)
            };
        }
        
        // Pattern 2: Simple format "Test1: PASS 950 FAIL 50 Total 1000"
        const simpleMatch = trimmedLine.match(/^(\w+):\s+PASS\s+(\d+)\s+FAIL\s+(\d+)\s+Total\s+(\d+)$/);
        if (simpleMatch) {
            const [, description, passCount, failCount, total] = simpleMatch;
            const pass = parseInt(passCount, 10);
            const fail = parseInt(failCount, 10);
            const totalCount = parseInt(total, 10);
            
            console.log(`Parsed simple format: description=${description}, pass=${pass}, fail=${fail}, total=${totalCount}`);
            
            return {
                softBin: 1,
                hardBin: 1,
                result: fail > 0 ? 'FAIL' : 'PASS',
                description,
                total: totalCount,
                percentage: (totalCount / 1000) * 100, // Assuming 1000 total devices
                site1: Math.floor(pass / 4),
                site2: Math.floor(pass / 4),
                site3: Math.floor(pass / 4),
                site4: pass - (Math.floor(pass / 4) * 3),
                sites: {
                    1: Math.floor(pass / 4),
                    2: Math.floor(pass / 4),
                    3: Math.floor(pass / 4),
                    4: pass - (Math.floor(pass / 4) * 3)
                },
                totalSites: pass
            };
        }
        
        // Pattern 3: Yield format "Yield: 94.0%"
        const yieldMatch = trimmedLine.match(/^Yield:\s*([\d.]+)%?$/);
        if (yieldMatch) {
            const yieldPercent = parseFloat(yieldMatch[1]);
            console.log(`Found yield: ${yieldPercent}%`);
            return null; // This is summary data, not test result
        }
        
        // Pattern 4: Generic test result with numbers "Test1 100 50 30 10 10"
        const genericMatch = trimmedLine.match(/^(\w+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/);
        if (genericMatch) {
            const [, description, total, site1, site2, site3, site4] = genericMatch;
            const totalCount = parseInt(total, 10);
            const site1Count = parseInt(site1, 10);
            const site2Count = parseInt(site2, 10);
            const site3Count = parseInt(site3, 10);
            const site4Count = parseInt(site4, 10);
            
            console.log(`Parsed generic format: ${description} = ${totalCount} total`);
            
            return {
                softBin: 1,
                hardBin: 1,
                result: totalCount > 0 ? 'PASS' : 'FAIL',
                description,
                total: totalCount,
                percentage: (totalCount / 1000) * 100,
                site1: site1Count,
                site2: site2Count,
                site3: site3Count,
                site4: site4Count,
                sites: {
                    1: site1Count,
                    2: site2Count,
                    3: site3Count,
                    4: site4Count
                },
                totalSites: site1Count + site2Count + site3Count + site4Count
            };
        }
        
        // Pattern 5: Test with PASS/FAIL indicator "Test1 PASS 100"
        const passFailMatch = trimmedLine.match(/^(\w+)\s+(PASS|FAIL)\s+(\d+)$/);
        if (passFailMatch) {
            const [, description, result, total] = passFailMatch;
            const totalCount = parseInt(total, 10);
            
            console.log(`Parsed PASS/FAIL format: ${description} = ${result} (${totalCount})`);
            
            return {
                softBin: 1,
                hardBin: 1,
                result,
                description,
                total: totalCount,
                percentage: (totalCount / 1000) * 100,
                site1: Math.floor(totalCount / 4),
                site2: Math.floor(totalCount / 4),
                site3: Math.floor(totalCount / 4),
                site4: totalCount - (Math.floor(totalCount / 4) * 3),
                sites: {
                    1: Math.floor(totalCount / 4),
                    2: Math.floor(totalCount / 4),
                    3: Math.floor(totalCount / 4),
                    4: totalCount - (Math.floor(totalCount / 4) * 3)
                },
                totalSites: totalCount
            };
        }
        
        // Pattern 6: Any line with numbers that might be test data
        const numberMatch = trimmedLine.match(/^(\w+)\s+(\d+)/);
        if (numberMatch && !trimmedLine.includes('*') && !trimmedLine.includes('Total') && !trimmedLine.includes('Yield')) {
            const [, description, total] = numberMatch;
            const totalCount = parseInt(total, 10);
            
            // Only create test result if it looks like a test (not summary data)
            if (totalCount > 0 && totalCount < 10000) { // Reasonable range for test results
                console.log(`Parsed number format: ${description} = ${totalCount}`);
                
                return {
                    softBin: 1,
                    hardBin: 1,
                    result: 'PASS',
                    description,
                    total: totalCount,
                    percentage: (totalCount / 1000) * 100,
                    site1: Math.floor(totalCount / 4),
                    site2: Math.floor(totalCount / 4),
                    site3: Math.floor(totalCount / 4),
                    site4: totalCount - (Math.floor(totalCount / 4) * 3),
                    sites: {
                        1: Math.floor(totalCount / 4),
                        2: Math.floor(totalCount / 4),
                        3: Math.floor(totalCount / 4),
                        4: totalCount - (Math.floor(totalCount / 4) * 3)
                    },
                    totalSites: totalCount
                };
            }
        }
        
        // Only log unmatched lines that look like they might be test data
        if (trimmedLine.match(/^\w+\s+\d+/) || trimmedLine.match(/^\d+\s+\d+/)) {
            console.log(`No pattern matched for line: "${trimmedLine}"`);
        }
        return null;
    }

    /**
     * Update site results
     * @param {Object} testResult - Test result object
     * @param {Object} siteResults - Site results object
     */
    updateSiteResults(testResult, siteResults) {
        if (testResult.site1 > 0) siteResults.Site1.push(testResult);
        if (testResult.site2 > 0) siteResults.Site2.push(testResult);
        if (testResult.site3 > 0) siteResults.Site3.push(testResult);
        if (testResult.site4 > 0) siteResults.Site4.push(testResult);
    }

    /**
     * Parse summary section
     * @param {Array} lines - File lines
     * @param {number} startIndex - Start index
     * @returns {Object} Summary data
     */
    parseSummarySection(lines, startIndex) {
        const summary = {};
        console.log(`Parsing summary section starting from line ${startIndex}`);
        
        // First pass: look for summary data throughout the file
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Pattern 1: Standard format "* GOOD    940( 94.0)"
            if (line.includes('* GOOD')) {
                const match = line.match(/\* GOOD\s+(\d+)\(\s*([\d.]+)\)/);
                if (match) {
                    summary.goodCount = parseInt(match[1], 10);
                    summary.goodPercentage = parseFloat(match[2]);
                    console.log(`Found GOOD: ${summary.goodCount} (${summary.goodPercentage}%)`);
                }
            } else if (line.includes('* FAIL')) {
                const match = line.match(/\* FAIL\s+(\d+)\(\s*([\d.]+)\)/);
                if (match) {
                    summary.failCount = parseInt(match[1], 10);
                    summary.failPercentage = parseFloat(match[2]);
                    console.log(`Found FAIL: ${summary.failCount} (${summary.failPercentage}%)`);
                }
            } else if (line.includes('* TOTAL')) {
                const match = line.match(/\* TOTAL\s+(\d+)/);
                if (match) {
                    summary.totalCount = parseInt(match[1], 10);
                    console.log(`Found TOTAL: ${summary.totalCount}`);
                }
            }
            
            // Pattern 2: Simple format "Total Devices: 1000"
            else if (line.includes('Total Devices:')) {
                const match = line.match(/Total Devices:\s*(\d+)/);
                if (match) {
                    summary.totalCount = parseInt(match[1], 10);
                    console.log(`Found Total Devices: ${summary.totalCount}`);
                }
            } else if (line.includes('Good Devices:')) {
                const match = line.match(/Good Devices:\s*(\d+)/);
                if (match) {
                    summary.goodCount = parseInt(match[1], 10);
                    console.log(`Found Good Devices: ${summary.goodCount}`);
                }
            } else if (line.includes('Failed Devices:')) {
                const match = line.match(/Failed Devices:\s*(\d+)/);
                if (match) {
                    summary.failCount = parseInt(match[1], 10);
                    console.log(`Found Failed Devices: ${summary.failCount}`);
                }
            } else if (line.includes('Yield:')) {
                const match = line.match(/Yield:\s*([\d.]+)%?/);
                if (match) {
                    summary.goodPercentage = parseFloat(match[1]);
                    console.log(`Found Yield: ${summary.goodPercentage}%`);
                }
            }
            
            // Pattern 3: Alternative formats
            else if (line.includes('PASS') && line.includes('FAIL') && line.includes('Total')) {
                // Format like "PASS 950 FAIL 50 Total 1000"
                const passMatch = line.match(/PASS\s+(\d+)/);
                const failMatch = line.match(/FAIL\s+(\d+)/);
                const totalMatch = line.match(/Total\s+(\d+)/);
                
                if (passMatch && failMatch && totalMatch) {
                    summary.goodCount = parseInt(passMatch[1], 10);
                    summary.failCount = parseInt(failMatch[1], 10);
                    summary.totalCount = parseInt(totalMatch[1], 10);
                    summary.goodPercentage = (summary.goodCount / summary.totalCount) * 100;
                    summary.failPercentage = (summary.failCount / summary.totalCount) * 100;
                    console.log(`Found PASS/FAIL/Total: ${summary.goodCount}/${summary.failCount}/${summary.totalCount}`);
                }
            }
            
            // Pattern 4: Enhanced fail count detection
            else if (line.includes('FAIL') || line.includes('Fail') || line.includes('fail')) {
                // Look for fail count in various formats
                const failPatterns = [
                    /FAIL\s*(\d+)/i,
                    /Fail\s*(\d+)/i,
                    /fail\s*(\d+)/i,
                    /(\d+)\s*FAIL/i,
                    /(\d+)\s*Fail/i,
                    /(\d+)\s*fail/i
                ];
                
                for (const pattern of failPatterns) {
                    const match = line.match(pattern);
                    if (match && !summary.failCount) {
                        summary.failCount = parseInt(match[1], 10);
                        console.log(`Found FAIL count: ${summary.failCount}`);
                        break;
                    }
                }
            }
            
            // Pattern 5: Look for numbers that might be fail counts
            else if (line.includes('Total') && line.includes('%')) {
                // Extract numbers and percentages from lines like "Total: 840 (95.6%)"
                const numbers = line.match(/\d+/g);
                const percentages = line.match(/(\d+\.?\d*)%/g);
                
                if (numbers && numbers.length >= 2 && percentages && percentages.length >= 1) {
                    const total = parseInt(numbers[0], 10);
                    const percentage = parseFloat(percentages[0]);
                    
                    if (!summary.totalCount) summary.totalCount = total;
                    if (!summary.goodPercentage) summary.goodPercentage = percentage;
                    
                    // Calculate fail count from percentage
                    if (summary.totalCount && summary.goodPercentage && !summary.failCount) {
                        const goodCount = Math.round((summary.goodPercentage / 100) * summary.totalCount);
                        summary.goodCount = goodCount;
                        summary.failCount = summary.totalCount - goodCount;
                        console.log(`Calculated from percentage: Good=${goodCount}, Fail=${summary.failCount}`);
                    }
                }
            }
        }
        
        // Data validation and normalization
        this.validateAndNormalizeSummary(summary);
        
        console.log(`Final summary:`, summary);
        return summary;
    }

    /**
     * Validate and normalize summary data
     * @param {Object} summary - Summary object to validate
     */
    validateAndNormalizeSummary(summary) {
        // Ensure all values are positive
        if (summary.goodCount < 0) summary.goodCount = 0;
        if (summary.failCount < 0) summary.failCount = 0;
        if (summary.totalCount < 0) summary.totalCount = 0;
        
        // Ensure percentages are within valid range (0-100)
        if (summary.goodPercentage < 0) summary.goodPercentage = 0;
        if (summary.goodPercentage > 100) summary.goodPercentage = 100;
        if (summary.failPercentage < 0) summary.failPercentage = 0;
        if (summary.failPercentage > 100) summary.failPercentage = 100;
        
        // Calculate missing values if possible
        if (summary.totalCount && summary.goodCount && !summary.failCount) {
            summary.failCount = Math.max(0, summary.totalCount - summary.goodCount);
            summary.failPercentage = (summary.failCount / summary.totalCount) * 100;
        }
        
        if (summary.totalCount && summary.failCount && !summary.goodCount) {
            summary.goodCount = Math.max(0, summary.totalCount - summary.failCount);
            summary.goodPercentage = (summary.goodCount / summary.totalCount) * 100;
        }
        
        if (summary.totalCount && summary.goodCount && !summary.goodPercentage) {
            summary.goodPercentage = (summary.goodCount / summary.totalCount) * 100;
        }
        
        if (summary.totalCount && summary.failCount && !summary.failPercentage) {
            summary.failPercentage = (summary.failCount / summary.totalCount) * 100;
        }
        
        // Ensure consistency between counts and percentages
        if (summary.totalCount && summary.goodCount && summary.failCount) {
            const calculatedTotal = summary.goodCount + summary.failCount;
            if (Math.abs(calculatedTotal - summary.totalCount) > 1) {
                console.warn(`Total count mismatch: ${summary.totalCount} vs ${calculatedTotal}`);
                // Use the calculated total if there's a significant mismatch
                if (Math.abs(calculatedTotal - summary.totalCount) > summary.totalCount * 0.1) {
                    summary.totalCount = calculatedTotal;
                }
            }
        }
        
        // Set yield percentage as good percentage for consistency
        if (summary.goodPercentage !== undefined) {
            summary.yieldPercent = summary.goodPercentage;
        }
        
        // Final validation
        if (summary.totalCount === 0) {
            console.warn('Total count is 0, setting default values');
            summary.totalCount = 1;
            summary.goodCount = 1;
            summary.failCount = 0;
            summary.goodPercentage = 100;
            summary.failPercentage = 0;
            summary.yieldPercent = 100;
        }
    }

    /**
     * Parse hardbin section
     * @param {Array} lines - File lines
     * @param {number} startIndex - Start index
     * @returns {Object} Hardbin data
     */
    parseHardbinSection(lines, startIndex) {
        const hardbin = {};
        
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('* HARDBIN')) {
                // Parse hardbin distribution
                const binMatch = line.match(/\* HARDBIN\s+(.+)/);
                if (binMatch) {
                    const binData = binMatch[1].trim().split(/\s+/);
                    for (let j = 0; j < binData.length; j += 2) {
                        const binNumber = binData[j];
                        const count = parseInt(binData[j + 1], 10);
                        if (!isNaN(count)) {
                            hardbin[`Bin${binNumber}`] = count;
                        }
                    }
                }
                break;
            }
        }
        
        return hardbin;
    }
} 