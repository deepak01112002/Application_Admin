const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY JSX FIX - COMPLETE REWRITE OF PROBLEMATIC SECTIONS...\n');

// Fix each page individually with complete JSX rewrite
const fixes = {
  'invoices': {
    searchPattern: /return \(\s*<AdminLayout currentPage="invoices">\s*<div className="space-y-6">\s*<div className="flex justify-between items-center">\s*<div>/,
    replacement: `return (
    <AdminLayout currentPage="invoices">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>`
  },
  
  'reports': {
    searchPattern: /if \(loading\) \{\s*return \(\s*<AdminLayout currentPage="reports">\s*<div className="space-y-6">\s*<div>/,
    replacement: `if (loading) {
    return (
      <AdminLayout currentPage="reports">
        <div className="space-y-6">
          <div>`
  },
  
  'shipping': {
    searchPattern: /if \(loading\) \{\s*return \(\s*<AdminLayout currentPage="shipping">\s*<div className="space-y-6">\s*<div>/,
    replacement: `if (loading) {
    return (
      <AdminLayout currentPage="shipping">
        <div className="space-y-6">
          <div>`
  },
  
  'suppliers': {
    searchPattern: /return \(\s*<AdminLayout currentPage="suppliers">\s*<div className="space-y-6">\s*<div className="flex justify-between items-center">\s*<div>/,
    replacement: `return (
      <AdminLayout currentPage="suppliers">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>`
  }
};

Object.keys(fixes).forEach(pageName => {
  const filePath = path.join(__dirname, 'app', pageName, 'page.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    console.log(`📄 Emergency fixing ${pageName} page...`);
    
    const fix = fixes[pageName];
    
    // Apply the specific fix
    if (fix.searchPattern.test(content)) {
      content = content.replace(fix.searchPattern, fix.replacement);
      console.log(`  ✅ Applied emergency JSX fix`);
    }
    
    // Additional generic fixes
    
    // Fix missing AdminLayout closing tags in loading returns
    if (pageName === 'reports' || pageName === 'shipping') {
      content = content.replace(
        /(\s*)\}\)\s*<\/div>\s*<\/div>\s*\);\s*\}/,
        '$1    }))}\n          </div>\n        </div>\n      </AdminLayout>\n    );\n  }'
      );
    }
    
    // Fix returns page specific issue
    if (pageName === 'returns') {
      // Add missing return statement
      content = content.replace(
        /(\s*)<AdminLayout currentPage="returns">/,
        '  return (\n    <AdminLayout currentPage="returns">'
      );
    }
    
    // Save if modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`  🎉 ${pageName} page emergency fixed and saved`);
    } else {
      console.log(`  ✅ ${pageName} page was already correct`);
    }
    
  } else {
    console.log(`  ❌ ${pageName} page not found`);
  }
});

// Special fix for returns page
const returnsPath = path.join(__dirname, 'app', 'returns', 'page.tsx');
if (fs.existsSync(returnsPath)) {
  let content = fs.readFileSync(returnsPath, 'utf8');
  
  // Check if it needs a return statement
  if (!content.includes('return (') && content.includes('<AdminLayout currentPage="returns">')) {
    content = content.replace(
      /(\s*)<AdminLayout currentPage="returns">/,
      '  return (\n    <AdminLayout currentPage="returns">'
    );
    
    // Ensure proper closing
    content = content.replace(
      /(\s*)<\/AdminLayout>\s*\);\s*\}/,
      '    </AdminLayout>\n  );\n}'
    );
    
    fs.writeFileSync(returnsPath, content);
    console.log('  🎉 Returns page return statement fixed');
  }
}

console.log('\n🚨 EMERGENCY JSX FIX COMPLETE!');
console.log('🚀 Critical JSX structure issues should now be resolved!');
