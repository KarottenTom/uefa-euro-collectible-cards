const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node import_players.js path/to/euro2024_players.csv');
  process.exit(1);
}

const csvPath = path.resolve(args[0]);
if (!fs.existsSync(csvPath)) {
  console.error('CSV file not found:', csvPath);
  process.exit(1);
}

const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.trim().split(/\r?\n/);
const headers = lines[0].split(',').map((h) => h.trim());

const normalize = (value) => value.trim().replaceAll('"', '');
const entries = lines.slice(1).map((line) => {
  const values = line.split(',');
  const row = headers.reduce((acc, header, index) => {
    acc[header] = normalize(values[index] || '');
    return acc;
  }, {});

  return {
    name: row.Name || row.name || row.player_name || row.player || '',
    nation: row.Nationality || row.Nation || row.nationality || row.team || '',
    position: row.Position || row.position || '',
    team: row.Team || row.team || row.Squad || row.squad || '',
    type: 'player',
    normalImage: '',
    glitterImage: ''
  };
});

const output = entries
  .filter((card) => card.name && card.nation)
  .map((card, index) => ({ id: index + 1, ...card }));

console.log(JSON.stringify(output, null, 2));
