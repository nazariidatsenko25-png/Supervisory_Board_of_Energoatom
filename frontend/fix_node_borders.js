const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src/components/nodes');
const files = fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(nodesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // If the node has NO content below the header, we should remove the border-b
  if (file === 'ToolNode.tsx') {
    content = content.replace(/className="px-4 py-3 border-b border-\[var\(--border\)\]/g, 'className="px-4 py-3 border-b-0');
  } else if (file === 'OutputNode.tsx') {
    // OutputNode DOES have content below (the select dropdown), but let's check
    // Wait, OutputNode has: `<div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">`
    // followed by `<div className="p-4 pt-3">`
    // So border-b is fine.
  }
  
  fs.writeFileSync(filePath, content);
}
console.log('Fixed ToolNode border-b');
