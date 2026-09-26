const fs = require('fs');
let content = fs.readFileSync('src/lib/sleeper-api.ts', 'utf8');

content = content.replace(
  /const weekPromises = \[\];\s*for \(let week = 1; week <= 18; week\+\+\) \{\s*weekPromises\.push\(fetchWithCache\(`\/league\/\$\{leagueId\}\/matchups\/\$\{week\}`\)\.catch\(\(\) => \[\]\)\);\s*\}/g,
  `const weekPromises = [];
    for (let week = 1; week <= Math.min(17, completedWeek); week++) {
      weekPromises.push(fetchWithCache(\`/league/\${leagueId}/matchups/\${week}\`).catch(() => []));
    }`
);

content = content.replace(
  /const weekPromises = \[\];\s*for \(let week = 1; week <= 18; week\+\+\) \{\s*weekPromises\.push\(\s*fetchWithCache\(`\/league\/\$\{leagueData\.league_id\}\/matchups\/\$\{week\}`\)\s*\.catch\(\(\) => \[\]\)\s*\.then\(data => \(\{ week, data \}\)\)\s*\);\s*\}/,
  `const weekPromises = [];
      const maxWeek = season === nflState.season ? Math.min(17, completedWeek) : 17;
      for (let week = 1; week <= maxWeek; week++) {
        weekPromises.push(
          fetchWithCache(\`/league/\${leagueData.league_id}/matchups/\${week}\`)
            .catch(() => [])
            .then(data => ({ week, data }))
        );
      }`
);

fs.writeFileSync('src/lib/sleeper-api.ts', content);
console.log('Done!');
