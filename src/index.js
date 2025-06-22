import { Analytics } from './js/modules/Analytics.js';
import { UI } from './js/modules/UI.js';
import { STDFFileHandler } from './js/STDFFileHandler.js';
import { SummaryFileParser } from './js/modules/SummaryFileParser.js';
import { FileUtils } from './js/utils/FileUtils.js';
import { CalculationUtils } from './js/utils/CalculationUtils.js';

// Register Chart.js plugins
if (window.Chart && window.chartjsPluginAnnotation) {
    window.Chart.register(window.chartjsPluginAnnotation);
} else if (window.Chart && window.ChartAnnotation) { // Fallback for older versions
    window.Chart.register(window.ChartAnnotation);
} else {
    console.warn('Chart.js or Annotation plugin not found. Pareto chart may not render correctly.');
}

window.Analytics = Analytics;
window.UI = UI;
window.STDFFileHandler = STDFFileHandler;
window.SummaryFileParser = SummaryFileParser;
window.FileUtils = FileUtils;
window.CalculationUtils = CalculationUtils;

let uiInstance;

async function handleFileUpload(files) {
  try {
    const parser = new SummaryFileParser();
    const parsedFiles = [];
    for (const file of files) {
      const text = await file.text();
      const parsed = parser.parseSummaryFile(text);
      parsed.fileName = file.name;
      parsedFiles.push({ success: true, data: parsed, fileName: file.name });
    }
    const testSequences = Analytics.detectTestSequences(parsedFiles);
    
    // Calculate aggregated statistics
    let totalGood = 0;
    let totalFail = 0;
    let totalInput = 0;
    
    Object.values(testSequences).forEach(sequence => {
      totalGood += sequence.totalPass || 0;
      totalFail += sequence.totalFail || 0;
      totalInput += sequence.totalInput || 0;
    });
    
    const overallYield = totalInput > 0 ? (totalGood / totalInput) * 100 : 0;
    
    const analytics = { 
      testSequences,
      totalGood,
      totalFail,
      totalInput,
      overallYield
    };
    
    // Update current analytics for lot selection
    currentAnalytics = analytics;
    
    if (uiInstance) {
      uiInstance.displayMultiFileSummary(analytics);
    }
  } catch (error) {
    if (uiInstance) {
      uiInstance.showError('Error processing files: ' + error.message);
    }
    throw error;
  }
}

window.handleFileUpload = handleFileUpload;

// Add selectLot function to window
window.selectLot = function(lotNumber) {
  if (uiInstance) {
    uiInstance.selectLot(lotNumber);
  }
};

// Add getAggregatedAnalytics function to window
let currentAnalytics = null;
window.getAggregatedAnalytics = function() {
  return currentAnalytics;
};

// Add generateExportData function to window
window.generateExportData = function(type) {
  if (!currentAnalytics) {
    console.error('No analytics data available for export');
    return [];
  }
  
  const sequences = currentAnalytics.testSequences;
  const headers = ['Lot Number', 'Device', 'Lot Size', 'Yield (%)', 'Good', 'Fail', 'Test Date', 'Operator'];
  
  switch (type) {
    case 'summary':
      return [
        headers,
        ...Object.entries(sequences).map(([lotNumber, sequence]) => [
          lotNumber,
          sequence.device || 'Unknown',
          (sequence.totalInput || 0).toString(),
          (sequence.finalYield || 0).toFixed(2) + '%',
          (sequence.totalPass || 0).toString(),
          (sequence.totalFail || 0).toString(),
          sequence.tests[0]?.data?.lotInfo?.Start_time || 'N/A',
          sequence.tests[0]?.data?.lotInfo?.Operator_id || 'N/A'
        ])
      ];
      
    case 'details':
      const detailHeaders = ['Lot Number', 'Test Type', 'Input', 'Pass', 'Fail', 'Yield (%)'];
      const detailRows = [];
      Object.entries(sequences).forEach(([lotNumber, sequence]) => {
        sequence.tests.forEach(test => {
          detailRows.push([
            lotNumber,
            test.testType || 'Unknown',
            (test.inputCount || 0).toString(),
            (test.passCount || 0).toString(),
            (test.failCount || 0).toString(),
            (test.yield || 0).toFixed(2) + '%'
          ]);
        });
      });
      return [detailHeaders, ...detailRows];
      
    case 'comparison':
      const comparisonHeaders = ['Metric', 'Value'];
      return [
        comparisonHeaders,
        ['Total Lots', Object.keys(sequences).length.toString()],
        ['Total Good', currentAnalytics.totalGood.toString()],
        ['Total Fail', currentAnalytics.totalFail.toString()],
        ['Overall Yield', currentAnalytics.overallYield.toFixed(2) + '%'],
        ['Average Lot Size', Math.round(currentAnalytics.totalInput / Object.keys(sequences).length).toString()]
      ];
      
    default:
      return [];
  }
};

// Add Test Analysis functions
window.initializeTestAnalysis = function() {
  if (!currentAnalytics) return;
  
  const sequences = currentAnalytics.testSequences;
  let totalTests = 0;
  let totalPass = 0;
  let totalFail = 0;
  
  Object.values(sequences).forEach(sequence => {
    sequence.tests.forEach(test => {
      totalTests++;
      totalPass += test.passCount || 0;
      totalFail += test.failCount || 0;
    });
  });
  
  const overallYield = totalPass + totalFail > 0 ? (totalPass / (totalPass + totalFail)) * 100 : 0;
  const failureRate = totalPass + totalFail > 0 ? (totalFail / (totalPass + totalFail)) * 100 : 0;
  
  // Update Test Analysis metrics
  const overallYieldEl = document.getElementById('overall-yield');
  const avgTestTimeEl = document.getElementById('avg-test-time');
  const failureRateEl = document.getElementById('failure-rate');
  const totalTestsEl = document.getElementById('total-tests');
  
  if (overallYieldEl) overallYieldEl.textContent = overallYield.toFixed(2) + '%';
  if (avgTestTimeEl) avgTestTimeEl.textContent = 'N/A'; // Test time not available in current data
  if (failureRateEl) failureRateEl.textContent = failureRate.toFixed(2) + '%';
  if (totalTestsEl) totalTestsEl.textContent = totalTests.toString();
  
  // Populate test performance table
  populateTestPerformanceTable(sequences);
};

function populateTestPerformanceTable(sequences) {
  const tbody = document.getElementById('test-performance-tbody');
  if (!tbody) return;
  
  const testData = [];
  Object.entries(sequences).forEach(([lotNumber, sequence]) => {
    sequence.tests.forEach(test => {
      testData.push({
        lotNumber,
        testType: test.testType,
        yield: test.yield || 0,
        failCount: test.failCount || 0,
        passCount: test.passCount || 0,
        inputCount: test.inputCount || 0
      });
    });
  });
  
  tbody.innerHTML = testData.slice(0, 20).map(test => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${test.lotNumber} - ${test.testType}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${test.testType}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${test.yield.toFixed(2)}%</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${test.failCount}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">N/A</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${test.yield >= 95 ? 'bg-green-100 text-green-800' : test.yield >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
          ${test.yield >= 95 ? 'Excellent' : test.yield >= 80 ? 'Good' : 'Poor'}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <button onclick="showTestDetails('${test.lotNumber}', '${test.testType}')" class="text-blue-600 hover:text-blue-900">View Details</button>
      </td>
    </tr>
  `).join('');
}

// Add test details function
window.showTestDetails = function(lotNumber, testType) {
  if (!currentAnalytics) return;
  
  const sequence = currentAnalytics.testSequences[lotNumber];
  if (!sequence) return;
  
  const test = sequence.tests.find(t => t.testType === testType);
  if (!test) return;
  
  // Create modal or alert with test details
  const details = `
Test Details for ${lotNumber} - ${testType}

Yield: ${test.yield?.toFixed(2)}%
Input Count: ${test.inputCount?.toLocaleString()}
Pass Count: ${test.passCount?.toLocaleString()}
Fail Count: ${test.failCount?.toLocaleString()}
Test Date: ${test.data?.lotInfo?.Start_time || 'N/A'}
Operator: ${test.data?.lotInfo?.Operator_id || 'N/A'}

Analysis:
- ${test.yield >= 95 ? 'Excellent performance' : test.yield >= 80 ? 'Good performance' : 'Needs improvement'}
- ${test.failCount > 0 ? `${test.failCount} failures detected` : 'No failures detected'}
- ${test.inputCount > 1000 ? 'High volume test' : 'Standard volume test'}
  `;
  
  alert(details);
};

// Add Binning Analysis functions
window.initializeBinningAnalysis = function() {
  if (!currentAnalytics) return;
  
  const sequences = currentAnalytics.testSequences;
  const binData = [];
  
  Object.values(sequences).forEach(sequence => {
    sequence.tests.forEach(test => {
      // Create bin categories based on yield
      let binCategory = 'pass';
      if (test.yield < 80) binCategory = 'fail';
      else if (test.yield < 95) binCategory = 'marginal';
      
      binData.push({
        binCode: `${test.testType}_${binCategory}`,
        description: `${test.testType} Test - ${binCategory.toUpperCase()}`,
        count: test.inputCount || 0,
        percentage: test.yield || 0,
        category: binCategory
      });
    });
  });
  
  // Update Binning Analysis metrics
  const totalBinsEl = document.getElementById('total-bins');
  const passRateEl = document.getElementById('pass-rate');
  const failRateEl = document.getElementById('fail-rate');
  const marginalRateEl = document.getElementById('marginal-rate');
  
  const totalBins = binData.length;
  const passBins = binData.filter(bin => bin.category === 'pass').length;
  const failBins = binData.filter(bin => bin.category === 'fail').length;
  const marginalBins = binData.filter(bin => bin.category === 'marginal').length;
  
  if (totalBinsEl) totalBinsEl.textContent = totalBins.toString();
  if (passRateEl) passRateEl.textContent = totalBins > 0 ? ((passBins / totalBins) * 100).toFixed(1) + '%' : '0%';
  if (failRateEl) failRateEl.textContent = totalBins > 0 ? ((failBins / totalBins) * 100).toFixed(1) + '%' : '0%';
  if (marginalRateEl) marginalRateEl.textContent = totalBins > 0 ? ((marginalBins / totalBins) * 100).toFixed(1) + '%' : '0%';
  
  // Populate binning details table
  populateBinningDetailsTable(binData);
};

function populateBinningDetailsTable(binData) {
  const tbody = document.getElementById('binning-details-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = binData.slice(0, 20).map(bin => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${bin.binCode}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${bin.description}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${bin.count}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${bin.percentage.toFixed(2)}%</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          bin.category === 'pass' ? 'bg-green-100 text-green-800' : 
          bin.category === 'marginal' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }">
          ${bin.category.toUpperCase()}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Stable</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <button onclick="analyzeBin('${bin.binCode}', '${bin.category}')" class="text-blue-600 hover:text-blue-900">Analyze</button>
      </td>
    </tr>
  `).join('');
}

// Add bin analysis function
window.analyzeBin = function(binCode, category) {
  if (!currentAnalytics) return;
  
  // Find all tests that fall into this bin category
  const sequences = currentAnalytics.testSequences;
  const relatedTests = [];
  
  Object.entries(sequences).forEach(([lotNumber, sequence]) => {
    sequence.tests.forEach(test => {
      let testCategory = 'pass';
      if (test.yield < 80) testCategory = 'fail';
      else if (test.yield < 95) testCategory = 'marginal';
      
      if (testCategory === category) {
        relatedTests.push({
          lotNumber,
          testType: test.testType,
          yield: test.yield,
          failCount: test.failCount,
          passCount: test.passCount
        });
      }
    });
  });
  
  // Calculate bin statistics
  const totalTests = relatedTests.length;
  const avgYield = totalTests > 0 ? relatedTests.reduce((sum, test) => sum + test.yield, 0) / totalTests : 0;
  const totalFailures = relatedTests.reduce((sum, test) => sum + test.failCount, 0);
  
  // Generate analysis
  const analysis = `
Bin Analysis: ${binCode} (${category.toUpperCase()})

Statistics:
- Total Tests: ${totalTests}
- Average Yield: ${avgYield.toFixed(2)}%
- Total Failures: ${totalFailures.toLocaleString()}
- Category: ${category.toUpperCase()}

Analysis:
- ${category === 'pass' ? 'This bin represents successful tests with good yield' : 
    category === 'marginal' ? 'This bin represents tests with acceptable but suboptimal yield' : 
    'This bin represents failed tests requiring attention'}
- ${avgYield >= 95 ? 'Excellent performance' : avgYield >= 80 ? 'Good performance' : 'Needs improvement'}
- ${totalFailures > 0 ? `${totalFailures} total failures detected` : 'No failures in this category'}

Recommendations:
- ${category === 'pass' ? 'Maintain current process parameters' : 
    category === 'marginal' ? 'Review process parameters for optimization' : 
    'Investigate root causes and implement corrective actions'}
  `;
  
  alert(analysis);
};

// Add Chart functionality
window.initializeCharts = function() {
  if (!currentAnalytics) return;
  
  // Destroy existing charts first
  destroyExistingCharts();
  
  // Yield Trend Chart
  initializeYieldTrendChart();
  
  // Failure Distribution Chart
  initializeFailureDistributionChart();
  
  // Bin Distribution Chart
  initializeBinDistributionChart();
};

// Store chart instances for cleanup
let chartInstances = {};

function destroyExistingCharts() {
  Object.values(chartInstances).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
  chartInstances = {};
}

function initializeYieldTrendChart() {
  const ctx = document.getElementById('test-yield-chart');
  if (!ctx) return;
  
  const sequences = currentAnalytics.testSequences;
  const labels = Object.keys(sequences);
  const yields = Object.values(sequences).map(seq => seq.finalYield || 0);
  
  chartInstances.yieldTrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Yield (%)',
        data: yields,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 0
          }
        }
      },
      layout: {
        padding: {
          top: 10,
          bottom: 10
        }
      }
    }
  });
}

function initializeFailureDistributionChart() {
  const ctx = document.getElementById('test-failure-chart');
  if (!ctx) return;
  
  const sequences = currentAnalytics.testSequences;
  const failureData = {};
  
  Object.values(sequences).forEach(sequence => {
    sequence.tests.forEach(test => {
      const testType = test.testType || 'Unknown';
      if (!failureData[testType]) {
        failureData[testType] = 0;
      }
      failureData[testType] += test.failCount || 0;
    });
  });
  
  chartInstances.failureDistribution = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(failureData),
      datasets: [{
        data: Object.values(failureData),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        }
      },
      layout: {
        padding: {
          top: 10,
          bottom: 10
        }
      }
    }
  });
}

function initializeBinDistributionChart() {
  const ctx = document.getElementById('bin-distribution-chart');
  if (!ctx) return;
  
  const sequences = currentAnalytics.testSequences;
  const binCategories = { pass: 0, marginal: 0, fail: 0 };
  
  Object.values(sequences).forEach(sequence => {
    sequence.tests.forEach(test => {
      let category = 'pass';
      if (test.yield < 80) category = 'fail';
      else if (test.yield < 95) category = 'marginal';
      binCategories[category]++;
    });
  });
  
  chartInstances.binDistribution = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Pass', 'Marginal', 'Fail'],
      datasets: [{
        label: 'Number of Tests',
        data: [binCategories.pass, binCategories.marginal, binCategories.fail],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      layout: {
        padding: {
          top: 10,
          bottom: 10
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!window.ui) {
    uiInstance = new UI();
    window.ui = uiInstance;
  } else {
    uiInstance = window.ui;
  }
}); 