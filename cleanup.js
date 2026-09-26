const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes("export const runtime = 'edge'")) {
    content = content.replace(/export const runtime = 'edge';?\s*/g, '');
    changed = true;
  }
  if (content.includes('export const runtime = "edge"')) {
    content = content.replace(/export const runtime = "edge";?\s*/g, '');
    changed = true;
  }
  if (content.includes("export const dynamic = 'force-dynamic'")) {
    content = content.replace(/export const dynamic = 'force-dynamic';?\s*/g, '');
    changed = true;
  }
  
  if (changed) fs.writeFileSync(file, content);
});
console.log('Removed edge and force-dynamic');
