const fs = require('fs');
const path = require('path');

// Pages that need AdminLayout wrapper
const pagesToFix = [
  'invoices',
  'shipping', 
  'reports',
  'analytics',
  'settings',
  'returns',
  'support'
];

pagesToFix.forEach(pageName => {
  const filePath = path.join(__dirname, 'app', pageName, 'page.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add AdminLayout import if not present
    if (!content.includes('AdminLayout')) {
      content = content.replace(
        /import.*from "lucide-react";/,
        `$&\nimport { AdminLayout } from "@/components/layout/admin-layout";`
      );
    }
    
    // Remove Sidebar import if present
    content = content.replace(/import.*Sidebar.*from.*;\n?/g, '');
    
    // Wrap content with AdminLayout
    if (!content.includes('<AdminLayout')) {
      // Find the main return statement
      content = content.replace(
        /return \(\s*<div className="space-y-6">/,
        `return (\n    <AdminLayout currentPage="${pageName}">\n      <div className="space-y-6">`
      );
      
      // Close AdminLayout at the end
      content = content.replace(
        /(\s*)<\/div>\s*\);\s*}$/,
        '$1  </div>\n    </AdminLayout>\n  );\n}'
      );
    }
    
    // Fix any existing layout issues
    content = content.replace(
      /<div className="flex h-screen.*?<main.*?<div.*?>/gs,
      '<AdminLayout currentPage="' + pageName + '">\n      <div className="space-y-6">'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${pageName} page`);
  } else {
    console.log(`${pageName} page not found`);
  }
});

console.log('All pages fixed!');
