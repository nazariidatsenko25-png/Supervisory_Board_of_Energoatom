const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src/components/nodes');
const files = fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(nodesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/className="w-3 h-3 rounded-full/g, 'className="pointer-events-none w-3 h-3 rounded-full');

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
