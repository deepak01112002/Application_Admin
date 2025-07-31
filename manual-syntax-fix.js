const fs = require('fs');
const path = require('path');

// Pages that need manual syntax fixing
const pagesToFix = [
  'analytics', 'categories', 'coupons', 'customers', 'inventory',
  'invoices', 'orders', 'products', 'reports', 'returns', 
  'settings', 'shipping', 'suppliers', 'support'
];

console.log('🔧 MANUAL SYNTAX FIX - TARGETED APPROACH...\n');

pagesToFix.forEach(pageName => {
  const filePath = path.join(__dirname, 'app', pageName, 'page.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;
    
    console.log(`📄 Manually fixing ${pageName} page...`);
    
    // 1. Fix the specific pattern causing errors
    // Pattern: return (\n      <AdminLayout currentPage="pageName">\n        <div className="space-y-6">\n        <div>
    const badPattern = new RegExp(
      `return \\(\\s*<AdminLayout currentPage="${pageName}">\\s*<div className="space-y-6">\\s*<div>`,
      'g'
    );
    
    if (badPattern.test(content)) {
      content = content.replace(
        badPattern,
        `return (\n      <AdminLayout currentPage="${pageName}">\n        <div className="space-y-6">\n          <div>`
      );
      modified = true;
      console.log(`  ✅ Fixed main return pattern`);
    }
    
    // 2. Fix loading return pattern
    const loadingBadPattern = new RegExp(
      `if \\(loading\\) {\\s*return \\(\\s*<AdminLayout currentPage="${pageName}">\\s*<div className="space-y-6">\\s*<div>`,
      'g'
    );
    
    if (loadingBadPattern.test(content)) {
      content = content.replace(
        loadingBadPattern,
        `if (loading) {\n    return (\n      <AdminLayout currentPage="${pageName}">\n        <div className="space-y-6">\n          <div>`
      );
      modified = true;
      console.log(`  ✅ Fixed loading return pattern`);
    }
    
    // 3. Fix specific indentation issues line by line
    const lines = content.split('\n');
    const fixedLines = [];
    let inLoadingReturn = false;
    let inMainReturn = false;
    let adminLayoutDepth = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Detect loading return
      if (trimmed.includes('if (loading)') && lines[i + 1]?.trim().includes('return (')) {
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
      
      // Handle h1 tags
      if (trimmed.includes('<h1') && adminLayoutDepth > 0) {
        if (inLoadingReturn) {
          fixedLines.push('            ' + trimmed);
        } else if (inMainReturn) {
          fixedLines.push('          ' + trimmed);
        } else {
          fixedLines.push(line);
        }
        continue;
      }
      
      // Handle p tags
      if (trimmed.includes('<p') && adminLayoutDepth > 0) {
        if (inLoadingReturn) {
          fixedLines.push('            ' + trimmed);
        } else if (inMainReturn) {
          fixedLines.push('          ' + trimmed);
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
      console.log(`  🎉 ${pageName} page manually fixed and saved`);
    } else {
      console.log(`  ✅ ${pageName} page was already correct`);
    }
    
  } else {
    console.log(`  ❌ ${pageName} page not found`);
  }
});

console.log('\n🎉 MANUAL SYNTAX FIX COMPLETE!');
console.log('🚀 All pages should now have proper JSX structure!');
