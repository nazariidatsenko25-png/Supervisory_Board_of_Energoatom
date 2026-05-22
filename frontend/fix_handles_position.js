const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src/components/nodes');
const files = fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(nodesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix Top Handles
  content = content.replace(
    /<Handle\s+type="([^"]+)"\s+position={Position\.Top}([\s\S]*?)className="([^"]+)"/g,
    (match, type, middle, className) => {
      // Remove any existing positioning classes to be safe
      let newClass = className.replace(/!top-\S+|!bottom-\S+|!left-\S+|!right-\S+|!-translate-\S+|!translate-\S+/g, '').replace(/\s+/g, ' ');
      newClass += ' !top-0 !-translate-x-1/2 !-translate-y-1/2';
      return `<Handle\n        type="${type}"\n        position={Position.Top}${middle}className="${newClass.trim()}"`;
    }
  );

  // Fix Bottom Handles
  content = content.replace(
    /<Handle\s+type="([^"]+)"\s+position={Position\.Bottom}([\s\S]*?)className="([^"]+)"/g,
    (match, type, middle, className) => {
      let newClass = className.replace(/!top-\S+|!bottom-\S+|!left-\S+|!right-\S+|!-translate-\S+|!translate-\S+/g, '').replace(/\s+/g, ' ');
      newClass += ' !bottom-0 !-translate-x-1/2 !translate-y-1/2';
      return `<Handle\n        type="${type}"\n        position={Position.Bottom}${middle}className="${newClass.trim()}"`;
    }
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
