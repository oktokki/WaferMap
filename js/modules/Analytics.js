/**
 * Analytics Module
 * Handles all analytics calculations and aggregations
 * Version: 1.0
 * Created: 2025-01-27
 */

import { CalculationUtils } from '../utils/CalculationUtils.js';
import { FileUtils } from '../utils/FileUtils.js';

export class Analytics {
    /**
     * Aggregate analytics for a test sequence
     * @param {Object} sequence - The test sequence object
     * @returns {Object} Aggregated analytics data
     */
    static aggregateSequenceAnalytics(sequence) {
        if (!sequence || !sequence.tests || sequence.tests.length === 0) {
            return {};
        }

        const combinedTestResults = [];

        // Combine test results from all tests in the sequence
        sequence.tests.forEach(test => {
            if (test.data && Array.isArray(test.data.testResults)) {
                test.data.testResults.forEach(result => {
                    if (!result || typeof result !== 'object' || result.description === 'PASS' || result.description === 'FAIL') return;
                    
                    const existingResult = combinedTestResults.find(r => r.description === result.description);
                    if (existingResult) {
                        existingResult.total += result.total || 0;
                        if (result.sites && typeof result.sites === 'object') {
                            Object.keys(result.sites).forEach(site => {
                                existingResult.sites[site] = (existingResult.sites[site] || 0) + (result.sites[site] || 0);
                            });
                        }
                    } else {
                        combinedTestResults.push(JSON.parse(JSON.stringify(result)));
                    }
                });
            }
        });

        const lotInfo = sequence.tests[0].data.lotInfo;
        const summary = {
            goodCount: sequence.totalPass,
            failCount: sequence.totalFail,
            yieldPercent: sequence.finalYield
        };

        // Generate analytics object
        const aggregatedAnalytics = this.calculateAnalytics(combinedTestResults, summary, lotInfo);

        // Add re-test flow info
        if (sequence.tests.length === 1) {
            // Single test file - no re-test flow
            aggregatedAnalytics.reTestFlow = {
                initialLotSize: sequence.totalInput,
                finalYield: sequence.finalYield,
                totalPass: sequence.totalPass,
                finalFail: sequence.totalFail,
                testSequence: 'Single Test (P1)',
                isSingleTest: true
            };
        } else {
            // Multiple test sequence
            aggregatedAnalytics.reTestFlow = {
                initialLotSize: sequence.totalInput,
                finalYield: sequence.finalYield,
                totalPass: sequence.totalPass,
                finalFail: sequence.totalFail,
                testSequence: sequence.tests.map(t => t.testType).join(' → '),
                isSingleTest: false
            };
        }

        return aggregatedAnalytics;
    }

    /**
     * Get aggregated analytics with re-test flow consideration
     * @param {Array} allFiles - Array of processed files
     * @returns {Object} Aggregated analytics
     */
    static getAggregatedAnalytics(allFiles) {
        console.log('=== Starting Aggregated Analytics Calculation ===');
        
        const result = {
            totalFiles: allFiles.length,
            totalGood: 0,
            totalFail: 0,
            overallYield: 0,
            testSequences: {},
            enhancedAnalytics: {}
        };

        // Detect test sequences
        const sequences = this.detectTestSequences(allFiles);
        result.testSequences = sequences;

        // Calculate aggregated statistics from sequences
        let totalInitialInput = 0;
        let totalFinalPass = 0;
        let totalFinalFail = 0;
        const yieldData = [];

        console.log('=== Sequence Analysis ===');
        Object.entries(sequences).forEach(([lotNumber, sequence]) => {
            console.log(`Lot ${lotNumber}:`);
            console.log(`  - Total Input: ${sequence.totalInput}`);
            console.log(`  - Total Pass: ${sequence.totalPass}`);
            console.log(`  - Total Fail: ${sequence.totalFail}`);
            console.log(`  - Final Yield: ${sequence.finalYield}%`);
            
            totalInitialInput += sequence.totalInput || 0;
            totalFinalPass += sequence.totalPass || 0;
            totalFinalFail += sequence.totalFail || 0;
            yieldData.push(sequence.finalYield || 0);
        });

        // Set final aggregated values
        result.totalGood = totalFinalPass;
        result.totalFail = totalFinalFail;
        
        // Calculate overall yield correctly: (Total Pass / Total Input) × 100
        const totalInput = totalFinalPass + totalFinalFail;
        result.overallYield = totalInput > 0 ? 
            Math.max(0, Math.min(100, (totalFinalPass / totalInput) * 100)) : 0;

        console.log('=== Final Aggregation ===');
        console.log(`Total Initial Input: ${totalInitialInput}`);
        console.log(`Total Final Pass: ${totalFinalPass}`);
        console.log(`Total Final Fail: ${totalFinalFail}`);
        console.log(`Overall Yield: ${result.overallYield}%`);

        // Calculate yield range and average
        if (yieldData.length > 0) {
            result.yieldRange = {
                min: Math.max(0, Math.min(...yieldData)),
                max: Math.min(100, Math.max(...yieldData))
            };
            result.averageYield = yieldData.reduce((sum, yieldValue) => sum + yieldValue, 0) / yieldData.length;
        }

        // Enhanced analytics
        result.enhancedAnalytics = this.calculateEnhancedAnalytics(sequences, allFiles);

        console.log(`Aggregation complete: Yield=${result.overallYield.toFixed(2)}%, Good=${result.totalGood}, Fail=${result.totalFail}`);
        return result;
    }

    /**
     * Detect test sequences from files
     * @param {Array} files - Array of processed files
     * @returns {Object} Test sequences
     */
    static detectTestSequences(files) {
        const sequences = {};
        
        console.log('=== Test Sequence Detection Debug ===');
        console.log('Processing files:', files.length);
        
        files.forEach((file, fileIndex) => {
            if (file.success && file.data) {
                // Use the lotNumber field that was set in STDFFileHandler
                let lotNumber = file.data.lotNumber || 
                               file.data.lotInfo?.Lot_number || 
                               file.data.lotInfo?.Lot_ID || 
                               file.data.lotInfo?.LotNumber;
                
                // If no lot number found, use filename-based identifier
                if (!lotNumber) {
                    lotNumber = FileUtils.extractLotNumberFromFileName(file.fileName);
                }
                
                // If still no lot number, create unique identifier
                if (!lotNumber) {
                    lotNumber = `file_${fileIndex}_${file.fileName.replace(/\.[^/.]+$/, '')}`;
                }
                
                const fileName = file.fileName;
                
                // Extract test type from filename
                let testType = 'P1'; // Default
                if (fileName.includes('_P1_')) testType = 'P1';
                else if (fileName.includes('_R1_')) testType = 'R1';
                else if (fileName.includes('_R2_')) testType = 'R2';
                else if (fileName.includes('_R3_')) testType = 'R3';
                
                console.log(`File ${fileIndex + 1}: ${fileName} -> Lot: ${lotNumber}, Test: ${testType}`);
                
                if (!sequences[lotNumber]) {
                    sequences[lotNumber] = {
                        lotNumber: lotNumber,
                        device: file.data.deviceName || file.data.lotInfo?.Device_name || 'Unknown',
                        tests: [],
                        finalYield: 0,
                        totalInput: 0,
                        totalPass: 0,
                        totalFail: 0
                    };
                }
                
                // Calculate pass/fail counts from summary data
                const inputCount = file.data.lotInfo.Lot_Size || 0;
                const passCount = file.data.summary?.goodCount || 0;
                const failCount = file.data.summary?.failCount || 0;
                const yieldPercent = file.data.summary?.goodPercentage || 0;
                
                // Add test with unique identifier to prevent duplicates
                const testId = `${testType}_${fileIndex}`;
                const existingTest = sequences[lotNumber].tests.find(t => t.testId === testId);
                
                if (!existingTest) {
                    sequences[lotNumber].tests.push({
                        testId: testId,
                        testType: testType,
                        fileName: fileName,
                        data: file.data,
                        inputCount: inputCount,
                        passCount: passCount,
                        failCount: failCount,
                        yield: yieldPercent
                    });
                } else {
                    console.log(`Skipping duplicate test: ${testId}`);
                }
            }
        });
        
        // Process each sequence
        Object.values(sequences).forEach(sequence => {
            // Sort tests by type (P1, R1, R2, R3) and then by file index
            sequence.tests.sort((a, b) => {
                const order = { 'P1': 1, 'R1': 2, 'R2': 3, 'R3': 4 };
                const typeOrder = (order[a.testType] || 999) - (order[b.testType] || 999);
                if (typeOrder !== 0) return typeOrder;
                
                // If same type, sort by file index
                const aIndex = parseInt(a.testId.split('_')[1]);
                const bIndex = parseInt(a.testId.split('_')[1]);
                return aIndex - bIndex;
            });
            
            // Remove duplicate test types to create cleaner sequence
            const uniqueTests = [];
            const seenTypes = new Set();
            
            sequence.tests.forEach(test => {
                if (!seenTypes.has(test.testType)) {
                    seenTypes.add(test.testType);
                    uniqueTests.push(test);
                }
            });
            
            // Replace tests array with unique tests
            sequence.tests = uniqueTests;
            
            // Calculate sequence yield
            CalculationUtils.calculateSequenceYield(sequence);
            sequence.analytics = this.aggregateSequenceAnalytics(sequence);
        });
        
        return sequences;
    }

    /**
     * Calculate enhanced analytics
     * @param {Object} sequences - Test sequences
     * @param {Array} allFiles - All processed files
     * @returns {Object} Enhanced analytics
     */
    static calculateEnhancedAnalytics(sequences, allFiles) {
        const enhancedAnalytics = {};

        // Yield trend analysis
        if (Object.keys(sequences).length > 1) {
            const yields = Object.values(sequences).map(s => s.finalYield);
            enhancedAnalytics.yieldTrend = {
                average: yields.reduce((sum, y) => sum + y, 0) / yields.length,
                range: `${Math.min(...yields).toFixed(1)}% - ${Math.max(...yields).toFixed(1)}%`,
                trend: this.analyzeYieldTrend(yields),
                variation: Math.max(...yields) - Math.min(...yields)
            };
        }

        // Failure pattern analysis
        const allFailures = [];
        Object.values(sequences).forEach(sequence => {
            if (sequence.analytics && sequence.analytics.testResults) {
                allFailures.push(...sequence.analytics.testResults.filter(t => t.result === 'FAIL'));
            }
        });

        if (allFailures.length > 0) {
            enhancedAnalytics.failurePatterns = {
                topPatterns: allFailures
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 5)
                    .map(f => ({ pattern: f.description, count: f.total }))
            };
        }

        // Site performance analysis
        const sitePerformance = {};
        Object.values(sequences).forEach(sequence => {
            if (sequence.analytics && sequence.analytics.sitePerformance) {
                Object.entries(sequence.analytics.sitePerformance).forEach(([site, data]) => {
                    if (!sitePerformance[site]) {
                        sitePerformance[site] = { total: 0 };
                    }
                    sitePerformance[site].total += data.total || 0;
                });
            }
        });

        if (Object.keys(sitePerformance).length > 0) {
            enhancedAnalytics.sitePerformance = {
                distribution: sitePerformance
            };
        }

        return enhancedAnalytics;
    }

    /**
     * Analyze yield trend
     * @param {Array} yields - Array of yield percentages
     * @returns {string} Trend description
     */
    static analyzeYieldTrend(yields) {
        if (yields.length < 2) return 'Insufficient data';
        
        const sortedYields = [...yields].sort((a, b) => a - b);
        const firstHalf = sortedYields.slice(0, Math.floor(sortedYields.length / 2));
        const secondHalf = sortedYields.slice(Math.floor(sortedYields.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, y) => sum + y, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, y) => sum + y, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 2) return 'Improving';
        if (secondAvg < firstAvg - 2) return 'Declining';
        return 'Stable';
    }

    /**
     * Calculate analytics for test results
     * @param {Array} testResults - Test results array
     * @param {Object} summary - Summary data
     * @param {Object} lotInfo - Lot information
     * @returns {Object} Analytics data
     */
    static calculateAnalytics(testResults, summary, lotInfo) {
        const totalDevices = lotInfo.Lot_Size || 0;
        const failures = testResults.filter(t => t.result === 'FAIL');
        const failureCount = failures.length;

        const yieldAnalysis = {
            overallYield: summary.yieldPercent || 0,
            totalDevices: totalDevices,
            failRate: totalDevices > 0 ? (failureCount / totalDevices) * 100 : 0
        };

        const failureAnalysis = {
            failures: failures,
            failureCount: failureCount,
            failureRate: yieldAnalysis.failRate
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
     * Perform root cause analysis
     * @param {Array} failures - Failure array
     * @param {Object} lotInfo - Lot information
     * @returns {Object} Root cause analysis
     */
    static performRootCauseAnalysis(failures, lotInfo) {
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
    static calculateQualityMetrics(yieldPercent, failureCount, totalDevices) {
        const defectRate = (100 - yieldPercent) / 100;
        
        return {
            sigmaLevel: CalculationUtils.calculateSigmaLevel(100 - yieldPercent),
            cpk: CalculationUtils.calculateCpk(yieldPercent),
            qualityScore: CalculationUtils.calculateQualityScore(yieldPercent, failureCount, totalDevices),
            defectRate: defectRate
        };
    }
} 