const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src/components/nodes');
const files = fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(nodesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/border-\[var\(--bg-card\)\]/g, 'border-[var(--bg-primary)]');
  
  fs.writeFileSync(filePath, content);
}
console.log('Replaced bg-card with bg-primary in all node Handle dots!');
