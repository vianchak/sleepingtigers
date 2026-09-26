const fs = require('fs');
let content = fs.readFileSync('src/lib/sleeper-api.ts', 'utf8');

// Add import
if (!content.includes("import pastMatchups from './past-matchups.json';")) {
  content = content.replace(
    "const BASE_URL = 'https://api.sleeper.app/v1';",
    "const BASE_URL = 'https://api.sleeper.app/v1';\nimport pastMatchups from './past-matchups.json';"
  );
}

// Replace logic
content = content.replace(
  /const weekPromises = \[\];\s*const maxWeek = season === nflState\.season \? Math\.min\(17, completedWeek\) : 17;\s*for \(let week = 1; week <= maxWeek; week\+\+\) \{\s*weekPromises\.push\(\s*fetchWithCache\(`\/league\/\$\{leagueData\.league_id\}\/matchups\/\$\{week\}`\)\s*\.catch\(\(\) => \[\]\)\s*\.then\(data => \(\{ week, data \}\)\)\s*\);\s*\}\s*const weeklyData = await Promise\.all\(weekPromises\);/g,
  `let weeklyData = [];
      const pastData = (pastMatchups as any)[leagueData.league_id];
      if (pastData) {
        for (let week = 1; week <= 17; week++) {
          if (pastData[week]) {
            weeklyData.push({ week, data: pastData[week] });
          }
        }
      } else {
        const weekPromises = [];
        const maxWeek = season === nflState.season ? Math.min(17, completedWeek) : 17;
        for (let week = 1; week <= maxWeek; week++) {
          weekPromises.push(
            fetchWithCache(\`/league/\${leagueData.league_id}/matchups/\${week}\`)
              .catch(() => [])
              .then(data => ({ week, data }))
          );
        }
        weeklyData = await Promise.all(weekPromises);
      }`
);

fs.writeFileSync('src/lib/sleeper-api.ts', content);
console.log('JSON cache implemented!');
