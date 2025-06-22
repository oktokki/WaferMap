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
            
            // Aggregate hard bin data
            sequence.aggregatedHardBins = {};
            sequence.tests.forEach(test => {
                const hardbins = test.data?.hardbin?.bins;
                if (hardbins && typeof hardbins === 'object') {
                    for (const [bin, count] of Object.entries(hardbins)) {
                        const numericBin = parseInt(bin, 10);
                        if (!isNaN(numericBin)) {
                            sequence.aggregatedHardBins[numericBin] = (sequence.aggregatedHardBins[numericBin] || 0) + count;
                        }
                    }
                }
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
     * @param {number} failureCount - Number of failures
     * @param {number} totalDevices - Total number of devices
     * @returns {Object} Quality metrics
     */
    static calculateQualityMetrics(yieldPercent, failureCount, totalDevices) {
        const defectRate = (failureCount / totalDevices) * 1000000; // DPM (Defects Per Million)
        const sigmaLevel = this.calculateSigmaLevel(defectRate);
        const cpk = this.calculateCpk(yieldPercent);
        const qualityScore = this.calculateQualityScore(yieldPercent, sigmaLevel, cpk);

        return {
            defectRate: defectRate.toFixed(2),
            sigmaLevel: sigmaLevel.toFixed(2),
            cpk: cpk.toFixed(2),
            qualityScore: qualityScore.toFixed(1),
            yieldStatus: this.getYieldStatus(yieldPercent),
            processCapability: this.getProcessCapability(cpk)
        };
    }

    /**
     * Perform Pareto analysis on failure data
     * @param {Array} testResults - Test results array
     * @param {string} stage - Test stage (P1, R1, R2)
     * @returns {Object} Pareto analysis results
     */
    static performParetoAnalysis(testResults, stage = 'P1') {
        console.log(`=== Performing Pareto Analysis for ${stage} ===`);
        
        // Filter FAIL results with actual failure counts
        const failResults = testResults.filter(test => {
            const isSoftBin1 = test.softBin === 1 || test.description === 'PASS' || test.description === '1';
            return !isSoftBin1 && test.result === 'FAIL' && (test.total || 0) > 0;
        });

        if (failResults.length === 0) {
            return {
                stage: stage,
                totalFailures: 0,
                paretoData: [],
                topFailures: [],
                cumulativeAnalysis: [],
                failureCategories: {},
                recommendations: []
            };
        }

        // Calculate total failures
        const totalFailures = failResults.reduce((sum, test) => sum + (test.total || 0), 0);

        // Create Pareto data
        const paretoData = failResults.map(test => ({
            softBin: test.softBin,
            description: test.description,
            failureCount: test.total || 0,
            percentage: totalFailures > 0 ? ((test.total || 0) / totalFailures) * 100 : 0,
            hardBin: test.hardBin,
            sites: test.sites || {}
        }));

        // Sort by failure count (descending)
        paretoData.sort((a, b) => b.failureCount - a.failureCount);

        // Calculate cumulative percentages
        let cumulative = 0;
        paretoData.forEach(item => {
            cumulative += item.percentage;
            item.cumulativePercentage = cumulative;
        });

        // Identify top failures (80/20 rule)
        const topFailures = paretoData.filter(item => item.cumulativePercentage <= 80);

        // Categorize failures
        const failureCategories = this.categorizeFailures(paretoData);

        // Generate recommendations
        const recommendations = this.generateParetoRecommendations(paretoData, failureCategories);

        console.log(`Pareto Analysis Complete: ${paretoData.length} failure types, ${totalFailures} total failures`);
        console.log(`Top failures (80% rule): ${topFailures.length} types`);

        return {
            stage: stage,
            totalFailures: totalFailures,
            paretoData: paretoData,
            topFailures: topFailures,
            cumulativeAnalysis: paretoData.map(item => ({
                description: item.description,
                failureCount: item.failureCount,
                percentage: item.percentage,
                cumulativePercentage: item.cumulativePercentage
            })),
            failureCategories: failureCategories,
            recommendations: recommendations
        };
    }

    /**
     * Categorize failures by type
     * @param {Array} paretoData - Pareto analysis data
     * @returns {Object} Categorized failures
     */
    static categorizeFailures(paretoData) {
        const categories = {
            'Voltage Tests': [],
            'Function Tests': [],
            'Power Tests': [],
            'Memory Tests': [],
            'USB Tests': [],
            'ADC Tests': [],
            'Other Tests': []
        };

        paretoData.forEach(item => {
            const description = item.description.toLowerCase();
            
            if (description.includes('voh') || description.includes('vol') || 
                description.includes('vil') || description.includes('vih')) {
                categories['Voltage Tests'].push(item);
            } else if (description.includes('function')) {
                categories['Function Tests'].push(item);
            } else if (description.includes('power') || description.includes('pwr')) {
                categories['Power Tests'].push(item);
            } else if (description.includes('ram') || description.includes('m5') || 
                       description.includes('m7') || description.includes('memory')) {
                categories['Memory Tests'].push(item);
            } else if (description.includes('usb')) {
                categories['USB Tests'].push(item);
            } else if (description.includes('adc')) {
                categories['ADC Tests'].push(item);
            } else {
                categories['Other Tests'].push(item);
            }
        });

        // Calculate category totals
        Object.keys(categories).forEach(category => {
            const totalFailures = categories[category].reduce((sum, item) => sum + item.failureCount, 0);
            categories[category] = {
                items: categories[category],
                totalFailures: totalFailures,
                percentage: paretoData.reduce((sum, item) => sum + item.failureCount, 0) > 0 ? 
                    (totalFailures / paretoData.reduce((sum, item) => sum + item.failureCount, 0)) * 100 : 0
            };
        });

        return categories;
    }

    /**
     * Generate recommendations based on Pareto analysis
     * @param {Array} paretoData - Pareto analysis data
     * @param {Object} failureCategories - Categorized failures
     * @returns {Array} Recommendations
     */
    static generateParetoRecommendations(paretoData, failureCategories) {
        const recommendations = [];

        // Top failure recommendations
        if (paretoData.length > 0) {
            const topFailure = paretoData[0];
            recommendations.push({
                priority: 'High',
                category: 'Top Failure',
                description: `Focus on ${topFailure.description} (${topFailure.failureCount} failures, ${topFailure.percentage.toFixed(1)}%)`,
                action: this.getFailureAction(topFailure.description)
            });
        }

        // Category-based recommendations
        Object.entries(failureCategories).forEach(([category, data]) => {
            if (data.totalFailures > 0) {
                recommendations.push({
                    priority: data.percentage > 20 ? 'High' : data.percentage > 10 ? 'Medium' : 'Low',
                    category: category,
                    description: `${category}: ${data.totalFailures} failures (${data.percentage.toFixed(1)}%)`,
                    action: this.getCategoryAction(category)
                });
            }
        });

        // 80/20 rule recommendations
        const topFailures = paretoData.filter(item => item.cumulativePercentage <= 80);
        if (topFailures.length > 0) {
            recommendations.push({
                priority: 'High',
                category: 'Pareto Principle',
                description: `Focus on top ${topFailures.length} failure types (${topFailures[0].cumulativePercentage.toFixed(1)}% of total failures)`,
                action: 'Implement targeted improvement programs for these specific failure modes'
            });
        }

        return recommendations;
    }

    /**
     * Get specific action for failure type
     * @param {string} description - Failure description
     * @returns {string} Recommended action
     */
    static getFailureAction(description) {
        const desc = description.toLowerCase();
        
        if (desc.includes('voh')) {
            return 'Check voltage regulation and output buffer circuits';
        } else if (desc.includes('vol')) {
            return 'Review voltage levels and timing specifications';
        } else if (desc.includes('power') || desc.includes('pwr')) {
            return 'Check power supply stability and protection circuits';
        } else if (desc.includes('usb')) {
            return 'Verify USB interface timing and signal integrity';
        } else if (desc.includes('ram') || desc.includes('memory')) {
            return 'Check memory interface and timing parameters';
        } else if (desc.includes('adc')) {
            return 'Verify ADC reference voltage and calibration';
        } else {
            return 'Review test conditions and device specifications';
        }
    }

    /**
     * Get category-based action
     * @param {string} category - Failure category
     * @returns {string} Recommended action
     */
    static getCategoryAction(category) {
        switch (category) {
            case 'Voltage Tests':
                return 'Review voltage specifications and test conditions';
            case 'Function Tests':
                return 'Check functional test patterns and timing';
            case 'Power Tests':
                return 'Verify power supply and protection circuits';
            case 'Memory Tests':
                return 'Check memory interface and access patterns';
            case 'USB Tests':
                return 'Verify USB protocol compliance and timing';
            case 'ADC Tests':
                return 'Check ADC calibration and reference voltage';
            default:
                return 'Review general test conditions and specifications';
        }
    }

    /**
     * Calculate Sigma Level from defect rate
     * @param {number} defectRate - Defect rate in DPM
     * @returns {number} Sigma level
     */
    static calculateSigmaLevel(defectRate) {
        // Convert DPM to probability
        const p = defectRate / 1000000;
        
        // Calculate sigma level using inverse normal CDF
        // For small probabilities, use approximation
        if (p <= 0) return 6.0;
        if (p >= 1) return 0.0;
        
        // Use approximation for sigma level
        const sigma = Math.sqrt(2) * this.inverseNormalCDF(1 - p);
        return Math.max(0, Math.min(6, sigma));
    }

    /**
     * Calculate Cpk (Process Capability Index)
     * @param {number} yieldPercent - Yield percentage
     * @returns {number} Cpk value
     */
    static calculateCpk(yieldPercent) {
        // Convert yield to defect rate
        const defectRate = (100 - yieldPercent) / 100;
        
        // Calculate Cpk based on yield
        // Higher yield = higher Cpk
        if (yieldPercent >= 99.9) return 1.67; // 6 sigma
        if (yieldPercent >= 99.7) return 1.33; // 4 sigma
        if (yieldPercent >= 99.4) return 1.0;  // 3 sigma
        if (yieldPercent >= 95.5) return 0.67; // 2 sigma
        if (yieldPercent >= 68.3) return 0.33; // 1 sigma
        return 0.1; // Below 1 sigma
    }

    /**
     * Calculate Quality Score
     * @param {number} yieldPercent - Yield percentage
     * @param {number} sigmaLevel - Sigma level
     * @param {number} cpk - Process capability index
     * @returns {number} Quality score (0-100)
     */
    static calculateQualityScore(yieldPercent, sigmaLevel, cpk) {
        // Weighted average of yield, sigma, and Cpk
        const yieldScore = yieldPercent;
        const sigmaScore = (sigmaLevel / 6) * 100;
        const cpkScore = Math.min(100, cpk * 60); // Cpk of 1.67 = 100 points
        
        // Weighted average: 50% yield, 30% sigma, 20% Cpk
        const qualityScore = (yieldScore * 0.5) + (sigmaScore * 0.3) + (cpkScore * 0.2);
        
        return Math.max(0, Math.min(100, qualityScore));
    }

    /**
     * Get Yield Status
     * @param {number} yieldPercent - Yield percentage
     * @returns {string} Yield status
     */
    static getYieldStatus(yieldPercent) {
        if (yieldPercent >= 99.9) return 'Excellent';
        if (yieldPercent >= 99.0) return 'Very Good';
        if (yieldPercent >= 95.0) return 'Good';
        if (yieldPercent >= 90.0) return 'Fair';
        if (yieldPercent >= 80.0) return 'Poor';
        return 'Very Poor';
    }

    /**
     * Get Process Capability Status
     * @param {number} cpk - Process capability index
     * @returns {string} Process capability status
     */
    static getProcessCapability(cpk) {
        if (cpk >= 1.67) return 'Excellent';
        if (cpk >= 1.33) return 'Good';
        if (cpk >= 1.0) return 'Capable';
        if (cpk >= 0.67) return 'Marginal';
        return 'Poor';
    }

    /**
     * Inverse Normal CDF approximation
     * @param {number} p - Probability (0-1)
     * @returns {number} Z-score
     */
    static inverseNormalCDF(p) {
        // Approximation for inverse normal CDF
        if (p <= 0) return -6;
        if (p >= 1) return 6;
        
        const a1 = -39.6968302866538;
        const a2 = 220.946098424521;
        const a3 = -275.928510446969;
        const a4 = 138.357751867269;
        const a5 = -30.6647980661472;
        const a6 = 2.50662827745924;
        
        const b1 = -54.4760987982241;
        const b2 = 161.585836858041;
        const b3 = -155.698979859887;
        const b4 = 66.8013118877197;
        const b5 = -13.2806815528857;
        
        const c1 = -0.00778489400243029;
        const c2 = -0.322396458041136;
        const c3 = -2.40075827716184;
        const c4 = -2.54973253934373;
        const c5 = 4.37466414146497;
        const c6 = 2.93816398269878;
        
        const d1 = 0.00778469570904146;
        const d2 = 0.32246712907004;
        const d3 = 2.445134137143;
        const d4 = 3.75440866190742;
        
        const p_low = 0.02425;
        const p_high = 1 - p_low;
        
        let q, r, z;
        
        if (p < p_low) {
            q = Math.sqrt(-2 * Math.log(p));
            z = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
                ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
        } else if (p <= p_high) {
            q = p - 0.5;
            r = q * q;
            z = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
                (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
        } else {
            q = Math.sqrt(-2 * Math.log(1 - p));
            z = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
                ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
        }
        
        return z;
    }
}

if (typeof window !== 'undefined') window.Analytics = Analytics; 