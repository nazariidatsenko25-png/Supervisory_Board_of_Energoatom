const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src/components/nodes');
const files = fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(nodesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Shrink the Handle component to 1x1 so React Flow anchors the edge to the center
  content = content.replace(/className="!w-8 !h-8 /g, 'className="!w-1 !h-1 ');
  
  // 2. Add the invisible 32x32 hit area, and absolute-position the visual dot
  const dotRegex = /<div className="pointer-events-none w-3 h-3 (rounded-full border-2 border-\[var\(--bg-primary\)\] transition-all duration-200 [^"]+)" style=\{\{([^}]+)\}\}\s*\/>/g;
  
  content = content.replace(dotRegex, (match, p1, p2) => {
    return `<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 ${p1}" style={{${p2}}} />`;
  });
  
  fs.writeFileSync(filePath, content);
}

console.log('Fixed edge connection points for all handles!');
