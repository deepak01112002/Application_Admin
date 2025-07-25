const fs = require('fs');
const path = require('path');

// Pages that might have formatting issues
const pagesToCheck = [
  'shipping',
  'settings', 
  'returns',
  'support'
];

pagesToCheck.forEach(pageName => {
  const filePath = path.join(__dirname, 'app', pageName, 'page.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix JSX formatting issues
    // Fix: return (\n    <AdminLayout to return (\n      <AdminLayout
    if (content.includes('return (\n    <AdminLayout')) {
      content = content.replace(/return \(\n    <AdminLayout/g, 'return (\n      <AdminLayout');
      modified = true;
    }
    
    // Fix: return (\n<AdminLayout to return (\n      <AdminLayout  
    if (content.includes('return (\n<AdminLayout')) {
      content = content.replace(/return \(\n<AdminLayout/g, 'return (\n      <AdminLayout');
      modified = true;
    }
    
    // Fix missing AdminLayout wrapper in main return
    if (content.includes('return (\n    <div className="space-y-6">') && !content.includes('<AdminLayout currentPage="' + pageName + '">')) {
      content = content.replace(
        'return (\n    <div className="space-y-6">',
        `return (\n      <AdminLayout currentPage="${pageName}">\n        <div className="space-y-6">`
      );
      
      // Also need to close AdminLayout at the end
      content = content.replace(
        /(\s*)<\/div>\s*\);\s*}$/,
        '$1  </div>\n    </AdminLayout>\n  );\n}'
      );
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed JSX formatting in ${pageName} page`);
    } else {
      console.log(`${pageName} page formatting is correct`);
    }
  } else {
    console.log(`${pageName} page not found`);
  }
});

console.log('JSX formatting check complete!');
