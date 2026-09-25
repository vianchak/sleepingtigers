const fs = require('fs');
const file = 'src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<div className="glass-card p-6 flex flex-col items-center text-center group" title=\{badges\.(\w+)\?\.reason\}>/g, 
  '<div className="glass-card p-6 flex flex-col items-center text-center group relative cursor-help">\n' +
  '          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl z-50 transition-all duration-200 pointer-events-none">\n' +
  '            {badges.$1?.reason}\n' +
  '            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>\n' +
  '          </div>');

fs.writeFileSync(file, content);
console.log('Done replacing tooltips');
