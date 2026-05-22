const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src/components/nodes');
const files = fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(nodesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Add pseudo-element to Handle className
  content = content.replace(/group\/handle"/g, `group/handle before:content-[''] before:absolute before:-inset-4"`);
  
  // 2. Remove the invisible div hit area since the pseudo-element replaces it
  content = content.replace(/<div className="absolute top-1\/2 left-1\/2 -translate-x-1\/2 -translate-y-1\/2 w-8 h-8" \/>\s*/g, '');
  
  fs.writeFileSync(filePath, content);
}

console.log('Fixed drag-to-connect hit areas using pseudo-elements!');
