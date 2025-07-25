const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing suppliers page indentation...');

const filePath = path.join(__dirname, 'app', 'suppliers', 'page.tsx');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Split into lines for processing
  let lines = content.split('\n');
  let inAdminLayout = false;
  let indentLevel = 0;
  
  // Process each line to fix indentation
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;
    
    // Detect AdminLayout start
    if (trimmedLine.includes('<AdminLayout currentPage="suppliers">')) {
      inAdminLayout = true;
      indentLevel = 6; // Base indentation for AdminLayout content
      lines[i] = '      <AdminLayout currentPage="suppliers">';
      continue;
    }
    
    // Detect AdminLayout end
    if (trimmedLine.includes('</AdminLayout>')) {
      inAdminLayout = false;
      lines[i] = '    </AdminLayout>';
      continue;
    }
    
    // Fix indentation inside AdminLayout
    if (inAdminLayout && trimmedLine) {
      // Calculate proper indentation based on JSX structure
      let properIndent = indentLevel;
      
      // Adjust for opening/closing tags
      if (trimmedLine.startsWith('</')) {
        properIndent = Math.max(6, indentLevel - 2);
      } else if (trimmedLine.includes('<') && !trimmedLine.includes('</')) {
        // Opening tag
        if (trimmedLine.includes('className="space-y-6"')) {
          properIndent = 8;
        } else if (trimmedLine.includes('className="flex justify-between')) {
          properIndent = 10;
        } else if (trimmedLine.includes('<div>') || trimmedLine.includes('<Button')) {
          properIndent = 12;
        } else if (trimmedLine.includes('<h1') || trimmedLine.includes('<p')) {
          properIndent = 14;
        }
      }
      
      // Apply the proper indentation
      const spaces = ' '.repeat(properIndent);
      lines[i] = spaces + trimmedLine;
    }
  }
  
  // Join lines back together
  content = lines.join('\n');
  
  // Additional specific fixes
  content = content.replace(
    /(\s*)<AdminLayout currentPage="suppliers">\s*<div className="space-y-6">/g,
    '      <AdminLayout currentPage="suppliers">\n        <div className="space-y-6">'
  );
  
  content = content.replace(
    /(\s*)<div className="flex justify-between items-center">/g,
    '          <div className="flex justify-between items-center">'
  );
  
  content = content.replace(
    /(\s*)<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">/g,
    '          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">'
  );
  
  // Fix Card indentation
  content = content.replace(
    /(\s*)<Card>/g,
    '            <Card>'
  );
  
  content = content.replace(
    /(\s*)<CardContent/g,
    '              <CardContent'
  );
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content);
  console.log('✅ Suppliers page indentation fixed!');
} else {
  console.log('❌ Suppliers page not found');
}

console.log('🎉 Indentation fix complete!');
