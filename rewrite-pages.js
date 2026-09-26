const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/\\[locale\\]/**/page.tsx');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/let t; try \{ t = await getTranslations\(\{locale, namespace: "([^"]+)"\}\); \} catch[^}]+} /g, 'const t = getScopedTranslator(locale, "$1");\n  ');
  content = content.replace(/let t; try \{ t = await getTranslations\(\{locale, namespace: "([^"]+)"\}\); \} catch\(e: any\) \{ return <div[^>]+>Translation Error: \{e\.message\}<\/div>; \}/g, 'const t = getScopedTranslator(locale, "$1");');
  
  fs.writeFileSync(file, content);
});
console.log('Fixed pages');
