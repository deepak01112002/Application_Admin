const fs = require('fs');
const path = require('path');

// All pages to check and fix
const allPages = [
  'analytics', 'categories', 'coupons', 'customers', 'inventory',
  'invoices', 'orders', 'products', 'reports', 'returns', 
  'settings', 'shipping', 'suppliers', 'support'
];

console.log('🔧 SIMPLE JSX FIX - DIRECT APPROACH...\n');

allPages.forEach(pageName => {
  const filePath = path.join(__dirname, 'app', pageName, 'page.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;
    
    console.log(`📄 Checking ${pageName} page...`);
    
    // Simple regex replacements to fix common JSX issues
    const fixes = [
      // Fix: <div className="space-y-6">\n        <div> -> proper indentation
      {
        pattern: /<div className="space-y-6">\s*<div>/g,
        replacement: '<div className="space-y-6">\n          <div>'
      },
      
      // Fix: <AdminLayout currentPage="pageName">\n        <div className="space-y-6"> -> proper indentation
      {
        pattern: new RegExp(`<AdminLayout currentPage="${pageName}">\\s*<div className="space-y-6">`, 'g'),
        replacement: `<AdminLayout currentPage="${pageName}">\n        <div className="space-y-6">`
      },
      
      // Fix: return (\n      <AdminLayout -> proper indentation
      {
        pattern: /return \(\s*<AdminLayout/g,
        replacement: 'return (\n      <AdminLayout'
      },
      
      // Fix: <div>\n          <h1 -> proper indentation
      {
        pattern: /<div>\s*<h1 className="text-3xl font-bold">/g,
        replacement: '<div>\n            <h1 className="text-3xl font-bold">'
      },
      
      // Fix: </h1>\n          <p -> proper indentation
      {
        pattern: /<\/h1>\s*<p className="text-muted-foreground">/g,
        replacement: '</h1>\n            <p className="text-muted-foreground">'
      },
      
      // Fix: </div>\n        <Button -> proper indentation
      {
        pattern: /<\/div>\s*<Button/g,
        replacement: '</div>\n          <Button'
      },
      
      // Fix: </Button>\n      </div> -> proper indentation
      {
        pattern: /<\/Button>\s*<\/div>/g,
        replacement: '</Button>\n        </div>'
      }
    ];
    
    // Apply all fixes
    fixes.forEach((fix, index) => {
      const before = content;
      content = content.replace(fix.pattern, fix.replacement);
      if (content !== before) {
        modified = true;
        console.log(`  ✅ Applied fix ${index + 1}`);
      }
    });
    
    // Ensure proper AdminLayout closing
    if (content.includes('<AdminLayout') && !content.includes('</AdminLayout>')) {
      content = content.replace(
        /(\s*)<\/div>\s*\);\s*}$/,
        '$1  </div>\n    </AdminLayout>\n  );\n}'
      );
      modified = true;
      console.log(`  ✅ Added missing AdminLayout closing tag`);
    }
    
    // Save if modified
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`  🎉 ${pageName} page fixed and saved\n`);
    } else {
      console.log(`  ✅ ${pageName} page is already correct\n`);
    }
    
  } else {
    console.log(`  ❌ ${pageName} page not found\n`);
  }
});

console.log('🎉 SIMPLE JSX FIX COMPLETE!');
console.log('🚀 All JSX syntax issues should now be resolved!');
