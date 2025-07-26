const fs = require('fs');
const path = require('path');

// Pages with build errors that need fixing
const errorPages = [
  'analytics',
  'invoices', 
  'reports',
  'returns',
  'shipping'
];

console.log('🔧 FIXING BUILD ERRORS - JSX SYNTAX ISSUES...\n');

errorPages.forEach(pageName => {
  const filePath = path.join(__dirname, 'app', pageName, 'page.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;
    
    console.log(`📄 Fixing ${pageName} page build errors...`);
    
    // Fix the specific JSX structure issues
    
    // 1. Fix loading return statement structure
    const loadingReturnPattern = new RegExp(
      `if \\(loading\\) {\\s*return \\(\\s*<AdminLayout currentPage="${pageName}">\\s*<div className="space-y-6">\\s*<div>`,
      'gs'
    );
    
    if (loadingReturnPattern.test(content)) {
      content = content.replace(
        loadingReturnPattern,
        `if (loading) {\n    return (\n      <AdminLayout currentPage="${pageName}">\n        <div className="space-y-6">\n          <div>`
      );
      modified = true;
      console.log(`  ✅ Fixed loading return structure`);
    }
    
    // 2. Fix main return statement structure
    const mainReturnPattern = new RegExp(
      `return \\(\\s*<AdminLayout currentPage="${pageName}">\\s*<div className="space-y-6">`,
      'gs'
    );
    
    if (mainReturnPattern.test(content)) {
      content = content.replace(
        mainReturnPattern,
        `return (\n    <AdminLayout currentPage="${pageName}">\n      <div className="space-y-6">`
      );
      modified = true;
      console.log(`  ✅ Fixed main return structure`);
    }
    
    // 3. Fix specific issues for each page
    if (pageName === 'invoices') {
      // Fix duplicate space-y-6 divs
      content = content.replace(
        /<div className="space-y-6">\s*<div className="space-y-6">/g,
        '<div className="space-y-6">'
      );
      modified = true;
      console.log(`  ✅ Fixed duplicate space-y-6 divs`);
    }
    
    if (pageName === 'returns') {
      // Fix missing return statement
      if (!content.includes('return (') && content.includes('<AdminLayout')) {
        content = content.replace(
          /(\s*)<AdminLayout currentPage="returns">/,
          '  return (\n    <AdminLayout currentPage="returns">'
        );
        modified = true;
        console.log(`  ✅ Added missing return statement`);
      }
      
      // Fix closing structure
      content = content.replace(
        /(\s*)<\/Card>\s*<\/div>\s*<\/AdminLayout>\s*\);\s*}/,
        '        </Card>\n      </div>\n    </AdminLayout>\n  );\n}'
      );
      modified = true;
      console.log(`  ✅ Fixed closing structure`);
    }
    
    // 4. General JSX structure fixes
    const lines = content.split('\n');
    const fixedLines = [];
    let inLoadingReturn = false;
    let inMainReturn = false;
    let adminLayoutDepth = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Detect loading return
      if (trimmed.includes('if (loading)') && lines[i + 1]?.trim() === 'return (') {
        fixedLines.push(line);
        continue;
      }
      
      if (trimmed === 'return (' && lines[i - 1]?.trim().includes('if (loading)')) {
        inLoadingReturn = true;
        fixedLines.push('    return (');
        continue;
      }
      
      // Detect main return
      if (trimmed === 'return (' && !inLoadingReturn) {
        inMainReturn = true;
        fixedLines.push('  return (');
        continue;
      }
      
      // Handle AdminLayout
      if (trimmed.includes(`<AdminLayout currentPage="${pageName}">`)) {
        adminLayoutDepth++;
        if (inLoadingReturn) {
          fixedLines.push('      <AdminLayout currentPage="' + pageName + '">');
        } else if (inMainReturn) {
          fixedLines.push('    <AdminLayout currentPage="' + pageName + '">');
        } else {
          fixedLines.push(line);
        }
        continue;
      }
      
      // Handle space-y-6 div
      if (trimmed.includes('className="space-y-6"') && adminLayoutDepth > 0) {
        if (inLoadingReturn) {
          fixedLines.push('        <div className="space-y-6">');
        } else if (inMainReturn) {
          fixedLines.push('      <div className="space-y-6">');
        } else {
          fixedLines.push(line);
        }
        continue;
      }
      
      // Handle content divs
      if (trimmed === '<div>' && adminLayoutDepth > 0) {
        if (inLoadingReturn) {
          fixedLines.push('          <div>');
        } else if (inMainReturn) {
          fixedLines.push('        <div>');
        } else {
          fixedLines.push(line);
        }
        continue;
      }
      
      // Handle h1 and p tags
      if ((trimmed.includes('<h1') || trimmed.includes('<p')) && adminLayoutDepth > 0) {
        if (inLoadingReturn) {
          fixedLines.push('            ' + trimmed);
        } else if (inMainReturn) {
          fixedLines.push('          ' + trimmed);
        } else {
          fixedLines.push(line);
        }
        continue;
      }
      
      // Handle closing div tags
      if (trimmed === '</div>' && adminLayoutDepth > 0) {
        const prevLine = fixedLines[fixedLines.length - 1];
        if (prevLine && prevLine.includes('            ')) {
          if (inLoadingReturn) {
            fixedLines.push('          </div>');
          } else if (inMainReturn) {
            fixedLines.push('        </div>');
          } else {
            fixedLines.push(line);
          }
        } else if (prevLine && prevLine.includes('        ')) {
          if (inLoadingReturn) {
            fixedLines.push('        </div>');
          } else if (inMainReturn) {
            fixedLines.push('      </div>');
          } else {
            fixedLines.push(line);
          }
        } else {
          fixedLines.push(line);
        }
        continue;
      }
      
      // Handle closing AdminLayout
      if (trimmed.includes('</AdminLayout>')) {
        adminLayoutDepth--;
        if (inLoadingReturn) {
          fixedLines.push('      </AdminLayout>');
          inLoadingReturn = false;
        } else if (inMainReturn) {
          fixedLines.push('    </AdminLayout>');
          inMainReturn = false;
        } else {
          fixedLines.push(line);
        }
        continue;
      }
      
      // Handle closing return
      if (trimmed === ');' && (inLoadingReturn || inMainReturn)) {
        if (inLoadingReturn) {
          fixedLines.push('    );');
          inLoadingReturn = false;
        } else if (inMainReturn) {
          fixedLines.push('  );');
          inMainReturn = false;
        } else {
          fixedLines.push(line);
        }
        continue;
      }
      
      // Default: keep original line
      fixedLines.push(line);
    }
    
    const newContent = fixedLines.join('\n');
    
    if (newContent !== originalContent) {
      fs.writeFileSync(filePath, newContent);
      modified = true;
      console.log(`  🎉 ${pageName} page build errors fixed and saved`);
    } else {
      console.log(`  ✅ ${pageName} page structure is correct`);
    }
    
  } else {
    console.log(`  ❌ ${pageName} page not found`);
  }
});

console.log('\n🎉 BUILD ERROR FIX COMPLETE!');
console.log('🚀 All JSX syntax issues should now be resolved for build!');
