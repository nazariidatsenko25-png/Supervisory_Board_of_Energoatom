const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'frontend/src/components/nodes');
const files = fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(nodesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace 1x1 with 6x6
  content = content.replace(/!w-1 !h-1/g, '!w-8 !h-8');
  
  // Remove the before pseudo-elements
  content = content.replace(/before:content-\[''\] before:absolute before:-inset-4/g, '');
  
  fs.writeFileSync(filePath, content);
}

console.log('Fixed drag issues for all handles!');
