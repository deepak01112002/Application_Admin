#!/usr/bin/env node

/**
 * Script to identify and fix dummy data usage in admin panel
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

// Patterns that indicate dummy data usage
const dummyDataPatterns = [
    /const\s+\w+\s*=\s*\[[\s\S]*?\{[\s\S]*?_id:\s*["'][\w-]+["'][\s\S]*?\}[\s\S]*?\]/g, // Static arrays with _id
    /Math\.floor\(Math\.random\(\)/g, // Random number generation
    /Math\.random\(\)/g, // Random values
    /dummy|mock|fake|test.*data/gi, // Dummy/mock/fake data keywords
    /hardcoded|static.*data/gi, // Hardcoded data keywords
    /\[\s*\{[\s\S]*?name:\s*["'].*?["'][\s\S]*?\}\s*\]/g, // Static object arrays
];

// Service patterns that indicate proper API usage
const apiServicePatterns = [
    /import.*Service.*from.*services/g,
    /await.*Service\./g,
    /\.get\(|\.post\(|\.put\(|\.delete\(/g,
    /api\./g,
];

function scanFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const issues = [];
        
        // Check for dummy data patterns
        dummyDataPatterns.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    issues.push({
                        type: 'dummy_data',
                        pattern: pattern.toString(),
                        match: match.substring(0, 100) + (match.length > 100 ? '...' : ''),
                        line: content.substring(0, content.indexOf(match)).split('\n').length
                    });
                });
            }
        });
        
        // Check if file uses proper API services
        let usesApiServices = false;
        apiServicePatterns.forEach(pattern => {
            if (pattern.test(content)) {
                usesApiServices = true;
            }
        });
        
        return {
            issues,
            usesApiServices,
            hasContent: content.length > 0
        };
    } catch (error) {
        return {
            issues: [],
            usesApiServices: false,
            hasContent: false,
            error: error.message
        };
    }
}

function scanDirectory(dirPath, results = {}) {
    try {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                scanDirectory(itemPath, results);
            } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts')) && !item.endsWith('.d.ts')) {
                const relativePath = path.relative(process.cwd(), itemPath);
                results[relativePath] = scanFile(itemPath);
            }
        });
    } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
    
    return results;
}

function generateReport(results) {
    console.log(`${colors.bold}${colors.blue}🔍 DUMMY DATA ANALYSIS REPORT${colors.reset}\n`);
    
    let totalFiles = 0;
    let filesWithIssues = 0;
    let filesWithoutApiServices = 0;
    let totalIssues = 0;
    
    const categories = {
        'Pages': [],
        'Components': [],
        'Services': [],
        'Other': []
    };
    
    // Categorize files
    Object.entries(results).forEach(([filePath, result]) => {
        totalFiles++;
        
        if (result.issues.length > 0) {
            filesWithIssues++;
            totalIssues += result.issues.length;
        }
        
        if (!result.usesApiServices && result.hasContent) {
            filesWithoutApiServices++;
        }
        
        // Categorize
        if (filePath.includes('/app/') && filePath.endsWith('page.tsx')) {
            categories.Pages.push({ filePath, result });
        } else if (filePath.includes('/components/')) {
            categories.Components.push({ filePath, result });
        } else if (filePath.includes('/lib/') || filePath.includes('service')) {
            categories.Services.push({ filePath, result });
        } else {
            categories.Other.push({ filePath, result });
        }
    });
    
    // Print summary
    console.log(`${colors.bold}📊 SUMMARY:${colors.reset}`);
    console.log(`Total Files Scanned: ${totalFiles}`);
    console.log(`${colors.red}Files with Dummy Data: ${filesWithIssues}${colors.reset}`);
    console.log(`${colors.yellow}Files without API Services: ${filesWithoutApiServices}${colors.reset}`);
    console.log(`${colors.red}Total Issues Found: ${totalIssues}${colors.reset}\n`);
    
    // Print detailed results by category
    Object.entries(categories).forEach(([category, files]) => {
        if (files.length === 0) return;
        
        console.log(`${colors.bold}${colors.cyan}📁 ${category.toUpperCase()}:${colors.reset}`);
        
        files.forEach(({ filePath, result }) => {
            const status = result.issues.length > 0 ? 
                `${colors.red}❌ ${result.issues.length} issues${colors.reset}` : 
                `${colors.green}✅ Clean${colors.reset}`;
            
            const apiStatus = result.usesApiServices ? 
                `${colors.green}API✓${colors.reset}` : 
                `${colors.yellow}No API${colors.reset}`;
            
            console.log(`  ${status} ${apiStatus} ${filePath}`);
            
            // Show first few issues
            if (result.issues.length > 0) {
                result.issues.slice(0, 2).forEach(issue => {
                    console.log(`    ${colors.yellow}Line ${issue.line}:${colors.reset} ${issue.match}`);
                });
                if (result.issues.length > 2) {
                    console.log(`    ${colors.yellow}... and ${result.issues.length - 2} more issues${colors.reset}`);
                }
            }
        });
        console.log('');
    });
    
    // Recommendations
    console.log(`${colors.bold}${colors.blue}💡 RECOMMENDATIONS:${colors.reset}`);
    
    if (filesWithIssues > 0) {
        console.log(`${colors.red}1. Remove dummy data from ${filesWithIssues} files${colors.reset}`);
        console.log(`   - Replace static arrays with API calls`);
        console.log(`   - Remove Math.random() and hardcoded values`);
        console.log(`   - Use real data from backend services`);
    }
    
    if (filesWithoutApiServices > 0) {
        console.log(`${colors.yellow}2. Add API integration to ${filesWithoutApiServices} files${colors.reset}`);
        console.log(`   - Import appropriate services from @/lib/services`);
        console.log(`   - Replace static data with API calls`);
        console.log(`   - Add loading and error states`);
    }
    
    console.log(`${colors.green}3. Ensure all components use real database data${colors.reset}`);
    console.log(`   - Verify API endpoints are working`);
    console.log(`   - Test data fetching and display`);
    console.log(`   - Handle empty states gracefully`);
    
    return {
        totalFiles,
        filesWithIssues,
        filesWithoutApiServices,
        totalIssues
    };
}

// Main execution
function main() {
    console.log(`${colors.bold}${colors.blue}🚀 SCANNING ADMIN PANEL FOR DUMMY DATA...${colors.reset}\n`);
    
    const results = scanDirectory('./');
    const summary = generateReport(results);
    
    // Final status
    if (summary.filesWithIssues === 0 && summary.filesWithoutApiServices === 0) {
        console.log(`\n${colors.green}${colors.bold}🎉 ALL CLEAN! No dummy data found.${colors.reset}`);
    } else {
        console.log(`\n${colors.yellow}⚠️  Found issues that need attention.${colors.reset}`);
        console.log(`${colors.blue}Run this script again after making fixes.${colors.reset}`);
    }
    
    // Save detailed report
    const reportPath = './dummy-data-report.json';
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary,
        results
    }, null, 2));
    
    console.log(`\n${colors.cyan}📄 Detailed report saved to: ${reportPath}${colors.reset}`);
}

if (require.main === module) {
    main();
}

module.exports = { scanFile, scanDirectory, generateReport };
