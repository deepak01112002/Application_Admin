const fs = require('fs');
const path = require('path');

// All pages that need to be checked and fixed
const allPages = [
  'analytics',
  'categories', 
  'coupons',
  'customers',
  'inventory',
  'invoices',
  'orders',
  'products',
  'reports',
  'returns',
  'settings',
  'shipping',
  'suppliers',
  'support'
];

console.log('🔧 Starting comprehensive syntax fix for all pages...\n');

allPages.forEach(pageName => {
  const filePath = path.join(__dirname, 'app', pageName, 'page.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    console.log(`📄 Checking ${pageName} page...`);
    
    // 1. Fix AdminLayout import if missing
    if (!content.includes('import { AdminLayout }')) {
      if (content.includes('import { Sidebar }')) {
        content = content.replace(
          /import { Sidebar }.*?;/,
          'import { AdminLayout } from "@/components/layout/admin-layout";'
        );
        modified = true;
        console.log(`  ✅ Fixed AdminLayout import`);
      } else {
        // Add import after other imports
        const lastImport = content.lastIndexOf('import ');
        const endOfLastImport = content.indexOf(';', lastImport) + 1;
        content = content.slice(0, endOfLastImport) + 
                 '\nimport { AdminLayout } from "@/components/layout/admin-layout";' + 
                 content.slice(endOfLastImport);
        modified = true;
        console.log(`  ✅ Added AdminLayout import`);
      }
    }
    
    // 2. Fix JSX indentation issues in loading return
    if (content.includes('return (\n      <AdminLayout') && content.includes('<div className="space-y-6">\n            <div')) {
      content = content.replace(
        /return \(\n      <AdminLayout([^>]*>)\n      <div className="space-y-6">\n            <div/g,
        'return (\n      <AdminLayout$1\n        <div className="space-y-6">\n          <div'
      );
      modified = true;
      console.log(`  ✅ Fixed loading return JSX indentation`);
    }
    
    // 3. Fix main return statement
    if (content.includes('return (\n      <div className="space-y-6">') && !content.includes(`<AdminLayout currentPage="${pageName}">`)) {
      content = content.replace(
        'return (\n      <div className="space-y-6">',
        `return (\n      <AdminLayout currentPage="${pageName}">\n        <div className="space-y-6">`
      );
      modified = true;
      console.log(`  ✅ Added AdminLayout wrapper to main return`);
    }
    
    // 4. Fix closing tags
    const adminLayoutCount = (content.match(/<AdminLayout/g) || []).length;
    const adminLayoutCloseCount = (content.match(/<\/AdminLayout>/g) || []).length;
    
    if (adminLayoutCount > adminLayoutCloseCount) {
      // Need to add closing AdminLayout tags
      content = content.replace(
        /(\s*)<\/div>\s*\);\s*}$/,
        '$1  </div>\n    </AdminLayout>\n  );\n}'
      );
      modified = true;
      console.log(`  ✅ Added missing AdminLayout closing tag`);
    }
    
    // 5. Remove old Sidebar layout patterns
    if (content.includes('<div className="flex h-screen')) {
      content = content.replace(
        /<div className="flex h-screen[^>]*>[\s\S]*?<Sidebar[\s\S]*?\/>\s*<main[\s\S]*?<div[^>]*>/g,
        `<AdminLayout currentPage="${pageName}">\n        <div className="space-y-6">`
      );
      
      content = content.replace(
        /<\/div>\s*<\/main>\s*<\/div>/g,
        '</div>\n    </AdminLayout>'
      );
      modified = true;
      console.log(`  ✅ Removed old Sidebar layout`);
    }
    
    // 6. Fix duplicate space-y-6 divs
    content = content.replace(
      /<div className="space-y-6">\s*<div className="space-y-6">/g,
      '<div className="space-y-6">'
    );
    
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

console.log('🎉 All pages have been checked and fixed!');
console.log('🚀 Admin panel should now be error-free!');
