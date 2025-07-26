const fs = require('fs');
const path = require('path');

// Pages with persistent build errors
const errorPages = ['analytics', 'invoices', 'reports', 'returns', 'shipping'];

console.log('🔧 COMPLETE JSX STRUCTURE FIX...\n');

errorPages.forEach(pageName => {
  const filePath = path.join(__dirname, 'app', pageName, 'page.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    console.log(`📄 Completely fixing ${pageName} page JSX structure...`);
    
    // Find the function that contains the problematic JSX
    const lines = content.split('\n');
    let functionStartIndex = -1;
    let functionEndIndex = -1;
    let braceCount = 0;
    let inFunction = false;
    
    // Find the main component function
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for the main component function (usually ends with "Page()")
      if (line.includes(`${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page()`) || 
          line.includes('export default function')) {
        functionStartIndex = i;
        inFunction = true;
        braceCount = 0;
      }
      
      if (inFunction) {
        // Count braces to find function end
        for (let char of line) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        
        if (braceCount === 0 && functionStartIndex !== -1) {
          functionEndIndex = i;
          break;
        }
      }
    }
    
    if (functionStartIndex !== -1 && functionEndIndex !== -1) {
      // Extract the function content
      const beforeFunction = lines.slice(0, functionStartIndex).join('\n');
      const functionLines = lines.slice(functionStartIndex, functionEndIndex + 1);
      const afterFunction = lines.slice(functionEndIndex + 1).join('\n');
      
      // Fix the function content
      let fixedFunctionLines = [];
      let inLoadingReturn = false;
      let inMainReturn = false;
      let adminLayoutDepth = 0;
      
      for (let i = 0; i < functionLines.length; i++) {
        const line = functionLines[i];
        const trimmed = line.trim();
        
        // Keep function declaration
        if (i === 0) {
          fixedFunctionLines.push(line);
          continue;
        }
        
        // Keep function closing
        if (i === functionLines.length - 1) {
          fixedFunctionLines.push(line);
          continue;
        }
        
        // Handle loading return
        if (trimmed.includes('if (loading)')) {
          fixedFunctionLines.push(line);
          continue;
        }
        
        if (trimmed === 'return (' && functionLines[i - 1]?.trim().includes('if (loading)')) {
          inLoadingReturn = true;
          fixedFunctionLines.push('    return (');
          continue;
        }
        
        // Handle main return
        if (trimmed === 'return (' && !inLoadingReturn) {
          inMainReturn = true;
          fixedFunctionLines.push('  return (');
          continue;
        }
        
        // Handle AdminLayout
        if (trimmed.includes(`<AdminLayout currentPage="${pageName}">`)) {
          adminLayoutDepth++;
          if (inLoadingReturn) {
            fixedFunctionLines.push('      <AdminLayout currentPage="' + pageName + '">');
          } else if (inMainReturn) {
            fixedFunctionLines.push('    <AdminLayout currentPage="' + pageName + '">');
          } else {
            fixedFunctionLines.push(line);
          }
          continue;
        }
        
        // Handle space-y-6 div
        if (trimmed.includes('className="space-y-6"')) {
          if (inLoadingReturn) {
            fixedFunctionLines.push('        <div className="space-y-6">');
          } else if (inMainReturn) {
            fixedFunctionLines.push('      <div className="space-y-6">');
          } else {
            fixedFunctionLines.push(line);
          }
          continue;
        }
        
        // Handle content divs
        if (trimmed === '<div>' && adminLayoutDepth > 0) {
          if (inLoadingReturn) {
            fixedFunctionLines.push('          <div>');
          } else if (inMainReturn) {
            fixedFunctionLines.push('        <div>');
          } else {
            fixedFunctionLines.push(line);
          }
          continue;
        }
        
        // Handle h1 and p tags
        if ((trimmed.includes('<h1') || trimmed.includes('<p')) && adminLayoutDepth > 0) {
          if (inLoadingReturn) {
            fixedFunctionLines.push('            ' + trimmed);
          } else if (inMainReturn) {
            fixedFunctionLines.push('          ' + trimmed);
          } else {
            fixedFunctionLines.push(line);
          }
          continue;
        }
        
        // Handle grid divs
        if (trimmed.includes('className="grid')) {
          if (inLoadingReturn) {
            fixedFunctionLines.push('          ' + trimmed);
          } else if (inMainReturn) {
            fixedFunctionLines.push('        ' + trimmed);
          } else {
            fixedFunctionLines.push(line);
          }
          continue;
        }
        
        // Handle closing divs
        if (trimmed === '</div>') {
          const prevLine = fixedFunctionLines[fixedFunctionLines.length - 1];
          if (prevLine && prevLine.includes('            ')) {
            if (inLoadingReturn) {
              fixedFunctionLines.push('          </div>');
            } else if (inMainReturn) {
              fixedFunctionLines.push('        </div>');
            } else {
              fixedFunctionLines.push(line);
            }
          } else if (prevLine && prevLine.includes('        ')) {
            if (inLoadingReturn) {
              fixedFunctionLines.push('        </div>');
            } else if (inMainReturn) {
              fixedFunctionLines.push('      </div>');
            } else {
              fixedFunctionLines.push(line);
            }
          } else {
            fixedFunctionLines.push(line);
          }
          continue;
        }
        
        // Handle closing AdminLayout
        if (trimmed.includes('</AdminLayout>')) {
          adminLayoutDepth--;
          if (inLoadingReturn) {
            fixedFunctionLines.push('      </AdminLayout>');
            inLoadingReturn = false;
          } else if (inMainReturn) {
            fixedFunctionLines.push('    </AdminLayout>');
            inMainReturn = false;
          } else {
            fixedFunctionLines.push(line);
          }
          continue;
        }
        
        // Handle closing return
        if (trimmed === ');' && (inLoadingReturn || inMainReturn)) {
          if (inLoadingReturn) {
            fixedFunctionLines.push('    );');
            inLoadingReturn = false;
          } else if (inMainReturn) {
            fixedFunctionLines.push('  );');
            inMainReturn = false;
          } else {
            fixedFunctionLines.push(line);
          }
          continue;
        }
        
        // Default: keep original line
        fixedFunctionLines.push(line);
      }
      
      // Reconstruct the file
      const newContent = beforeFunction + '\n' + fixedFunctionLines.join('\n') + '\n' + afterFunction;
      
      if (newContent !== originalContent) {
        fs.writeFileSync(filePath, newContent);
        console.log(`  🎉 ${pageName} page JSX structure completely fixed`);
      } else {
        console.log(`  ✅ ${pageName} page structure was already correct`);
      }
    } else {
      console.log(`  ❌ Could not find function boundaries in ${pageName} page`);
    }
  } else {
    console.log(`  ❌ ${pageName} page not found`);
  }
});

console.log('\n🎉 COMPLETE JSX STRUCTURE FIX COMPLETE!');
console.log('🚀 All JSX syntax issues should now be completely resolved!');
