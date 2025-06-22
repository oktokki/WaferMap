/**
 * Calculation Utilities
 * Handles yield calculations, pass/fail counts, and quality metrics
 * Version: 1.0
 * Created: 2025-01-27
 */

export class CalculationUtils {
    /**
     * Calculate pass count from test data
     * @param {Object} data - Test data
     * @param {string} testType - Test type (P1, R1, R2, etc.)
     * @param {number} actualInput - Actual input count for this test
     * @returns {number} Pass count
     */
    static calculatePassCount(data, testType = 'Unknown', actualInput = null) {
        console.log('=== calculatePassCount Debug ===');
        console.log('Test type:', testType);
        console.log('Actual input:', actualInput);
        console.log('Data summary:', data.summary);
        console.log('Data analytics:', data.analytics);
        
        // First priority: use summary.goodCount if available
        if (data.summary && data.summary.goodCount !== undefined && data.summary.goodCount !== null) {
            console.log('Using summary.goodCount:', data.summary.goodCount);
            return data.summary.goodCount;
        }
        
        // Second priority: use summary.yieldPercent to calculate
        if (data.summary && data.summary.yieldPercent !== undefined && data.summary.yieldPercent !== null) {
            const totalDevices = actualInput || data.lotInfo?.Lot_Size || 0;
            const calculatedPass = Math.round((data.summary.yieldPercent / 100) * totalDevices);
            console.log('Using summary.yieldPercent calculation:');
            console.log('  Total devices:', totalDevices);
            console.log('  Yield percent:', data.summary.yieldPercent);
            console.log('  Calculated pass:', calculatedPass);
            return calculatedPass;
        }
        
        // Third priority: use analytics.yieldAnalysis
        if (data.analytics && data.analytics.yieldAnalysis) {
            const totalDevices = actualInput || data.analytics.yieldAnalysis.totalDevices || data.lotInfo?.Lot_Size || 0;
            const yieldPercent = data.analytics.yieldAnalysis.overallYield || 0;
            const calculatedPass = Math.round((yieldPercent / 100) * totalDevices);
            console.log('Using analytics calculation:');
            console.log('  Total devices (adjusted):', totalDevices);
            console.log('  Yield percent:', yieldPercent);
            console.log('  Calculated pass:', calculatedPass);
            return calculatedPass;
        }
        
        // Fourth priority: use lot size as fallback (assuming 100% yield if no data)
        if (data.lotInfo && data.lotInfo.Lot_Size) {
            console.log('Using lot size as fallback (assuming 100% yield):', data.lotInfo.Lot_Size);
            return data.lotInfo.Lot_Size;
        }
        
        console.log('No pass count data found, returning 0');
        return 0;
    }

    /**
     * Calculate fail count from test data
     * @param {Object} data - Test data
     * @param {string} testType - Test type (P1, R1, R2, etc.)
     * @param {number} actualInput - Actual input count for this test
     * @returns {number} Fail count
     */
    static calculateFailCount(data, testType = 'Unknown', actualInput = null) {
        console.log('=== calculateFailCount Debug ===');
        console.log('Test type:', testType);
        console.log('Actual input:', actualInput);
        console.log('Data summary:', data.summary);
        console.log('Data analytics:', data.analytics);
        
        // First priority: use summary.failCount if available
        if (data.summary && data.summary.failCount !== undefined && data.summary.failCount !== null) {
            console.log('Using summary.failCount:', data.summary.failCount);
            return data.summary.failCount;
        }
        
        // Second priority: calculate from good count and total
        if (data.summary && data.summary.goodCount !== undefined && data.summary.goodCount !== null) {
            const totalDevices = actualInput || data.lotInfo?.Lot_Size || 0;
            const calculatedFail = totalDevices - data.summary.goodCount;
            console.log('Calculating fail from good count:');
            console.log('  Total devices:', totalDevices);
            console.log('  Good count:', data.summary.goodCount);
            console.log('  Calculated fail:', calculatedFail);
            return Math.max(0, calculatedFail); // Ensure non-negative
        }
        
        // Third priority: use summary.yieldPercent to calculate
        if (data.summary && data.summary.yieldPercent !== undefined && data.summary.yieldPercent !== null) {
            const totalDevices = actualInput || data.lotInfo?.Lot_Size || 0;
            const failRate = 100 - data.summary.yieldPercent;
            const calculatedFail = Math.round((failRate / 100) * totalDevices);
            console.log('Using summary.yieldPercent calculation:');
            console.log('  Total devices:', totalDevices);
            console.log('  Fail rate:', failRate);
            console.log('  Calculated fail:', calculatedFail);
            return calculatedFail;
        }
        
        // Fourth priority: use analytics.yieldAnalysis
        if (data.analytics && data.analytics.yieldAnalysis) {
            const totalDevices = actualInput || data.analytics.yieldAnalysis.totalDevices || data.lotInfo?.Lot_Size || 0;
            const failRate = data.analytics.yieldAnalysis.failRate || 0;
            const calculatedFail = Math.round((failRate / 100) * totalDevices);
            console.log('Using analytics calculation:');
            console.log('  Total devices (adjusted):', totalDevices);
            console.log('  Fail rate:', failRate);
            console.log('  Calculated fail:', calculatedFail);
            return calculatedFail;
        }
        
        // Fifth priority: assume 0 fail if no data available
        console.log('No fail count data found, returning 0');
        return 0;
    }

    /**
     * Calculate yield from test data
     * @param {Object} data - Test data
     * @returns {number} Yield percentage
     */
    static calculateYield(data) {
        console.log('=== calculateYield Debug ===');
        console.log('Data summary:', data.summary);
        console.log('Data analytics:', data.analytics);
        
        // First priority: use summary.goodPercentage if available
        if (data.summary && data.summary.goodPercentage !== undefined && data.summary.goodPercentage !== null) {
            console.log('Using summary.goodPercentage:', data.summary.goodPercentage);
            return data.summary.goodPercentage;
        }
        
        // Second priority: use summary.yieldPercent if available
        if (data.summary && data.summary.yieldPercent !== undefined && data.summary.yieldPercent !== null) {
            console.log('Using summary.yieldPercent:', data.summary.yieldPercent);
            return data.summary.yieldPercent;
        }
        
        // Third priority: calculate from good count and total count
        if (data.summary && data.summary.goodCount !== undefined && data.summary.goodCount !== null && 
            data.summary.totalCount !== undefined && data.summary.totalCount !== null && data.summary.totalCount > 0) {
            const calculatedYield = (data.summary.goodCount / data.summary.totalCount) * 100;
            console.log('Calculating yield from good/total counts:', calculatedYield);
            return calculatedYield;
        }
        
        // Fourth priority: use analytics.yieldAnalysis
        if (data.analytics && data.analytics.yieldAnalysis && data.analytics.yieldAnalysis.overallYield !== undefined) {
            console.log('Using analytics.yieldAnalysis.overallYield:', data.analytics.yieldAnalysis.overallYield);
            return data.analytics.yieldAnalysis.overallYield;
        }
        
        // Fifth priority: assume 100% yield if no data available
        console.log('No yield data found, assuming 100%');
        return 100;
    }

    /**
     * Calculate final yield for a test sequence
     * @param {Object} sequence - Test sequence object
     */
    static calculateSequenceYield(sequence) {
        if (sequence.tests.length === 0) return;
        
        console.log('=== calculateSequenceYield Debug ===');
        console.log('Sequence lot:', sequence.lotNumber);
        console.log('Number of tests:', sequence.tests.length);
        
        // Get the initial lot size from the first test (usually P1)
        const initialTest = sequence.tests.find(t => t.testType.startsWith('P')) || sequence.tests[0];
        const initialLotSize = Math.max(0, initialTest.inputCount || 0);
        
        console.log('Initial test:', initialTest.testType);
        console.log('Initial lot size:', initialLotSize);
        
        // Calculate total pass across all tests with validation
        let totalPass = 0;
        sequence.tests.forEach(test => {
            const validPassCount = Math.max(0, test.passCount || 0);
            totalPass += validPassCount;
        });
        
        // Final fail count is from the last test with validation
        const lastTest = sequence.tests[sequence.tests.length - 1];
        const finalFail = Math.max(0, lastTest.failCount || 0);
        
        console.log('Individual test values:');
        sequence.tests.forEach((test, index) => {
            const validInput = Math.max(0, test.inputCount || 0);
            const validPass = Math.max(0, test.passCount || 0);
            const validFail = Math.max(0, test.failCount || 0);
            const validYield = Math.max(0, Math.min(100, test.yield || 0));
            console.log(`  ${test.testType}: Input=${validInput}, Pass=${validPass}, Fail=${validFail}, Yield=${validYield.toFixed(2)}%`);
        });
        
        console.log('Final calculation:');
        console.log('  Total Pass:', totalPass);
        console.log('  Final Fail:', finalFail);
        console.log('  Initial Lot Size:', initialLotSize);
        
        // Calculate final yield with validation
        let finalYield = 0;
        if (initialLotSize > 0) {
            // Ensure final fail doesn't exceed initial lot size
            const validFinalFail = Math.min(finalFail, initialLotSize);
            finalYield = ((initialLotSize - validFinalFail) / initialLotSize) * 100;
            finalYield = Math.max(0, Math.min(100, finalYield)); // Ensure 0-100% range
        }
        
        // Ensure total pass doesn't exceed initial lot size
        const validTotalPass = Math.min(totalPass, initialLotSize);
        const validTotalFail = Math.min(finalFail, initialLotSize);
        
        sequence.totalInput = initialLotSize;
        sequence.totalPass = validTotalPass;
        sequence.totalFail = validTotalFail;
        sequence.finalYield = finalYield;
        
        console.log(`Sequence summary: Initial=${initialLotSize}, Total Pass=${validTotalPass}, Final Fail=${validTotalFail}, Final Yield=${finalYield.toFixed(2)}%`);
    }

    /**
     * Calculate sigma level from defect rate
     * @param {number} defectRate - Defect rate percentage
     * @returns {number} Sigma level
     */
    static calculateSigmaLevel(defectRate) {
        // Convert percentage to decimal
        const defectRateDecimal = defectRate / 100;
        
        // Simple sigma level calculation
        // This is a simplified version - in practice, you'd use more complex statistical methods
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
    static calculateCpk(yieldPercent) {
        // Simplified Cpk calculation based on yield
        // In practice, you'd need more detailed process data
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
    static calculateQualityScore(yieldPercent, failureCount, totalDevices) {
        // Base score from yield (70% weight)
        const yieldScore = (yieldPercent / 100) * 70;
        
        // Penalty for failure rate (30% weight)
        const failureRate = totalDevices > 0 ? (failureCount / totalDevices) * 100 : 0;
        const failurePenalty = Math.min(failureRate * 0.3, 30);
        
        return Math.max(0, Math.min(100, yieldScore - failurePenalty));
    }
} 