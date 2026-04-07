const fs = require('node:fs');
const path = require('node:path');

// Read CSV
const csvPath = String.raw`C:\Users\Administrator\Desktop\Schule\euro2024_players.csv`;
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.trim().split('\n');

// Parse header
const headers = lines[0].split(',');

// Parse data
const players = [];
let id = 1;

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',');
  if (values.length < headers.length) continue;

  const name = values[0].trim();
  const position = values[1].trim();
  const age = values[2].trim();
  const club = values[3].trim();
  const country = values[9].trim();

  // Generate consistent player image URLs (using placeholder)
  const playerImage = `https://api.sportsdata.io/v3/soccer/images/players/${name.replaceAll(/\s+/g, '-').toLowerCase()}.jpg`;
  
  players.push({
    id: id++,
    name: name,
    nation: country,
    type: 'player',
    position: position,
    age: Number.parseInt(age),
    club: club,
    normalImage: playerImage,
    glitterImage: playerImage // Same image, glitter effect handled by CSS
  });
}

// Add sample coaches
const coaches = [
  { id: id++, name: 'Julian Nagelsmann', nation: 'Germany', type: 'coach', role: 'Head Coach', normalImage: 'https://via.placeholder.com/300x300?text=Nagelsmann', glitterImage: 'https://via.placeholder.com/300x300?text=Nagelsmann' },
  { id: id++, name: 'Steve Clarke', nation: 'Scotland', type: 'coach', role: 'Head Coach', normalImage: 'https://via.placeholder.com/300x300?text=Steve+Clarke', glitterImage: 'https://via.placeholder.com/300x300?text=Steve+Clarke' },
  { id: id++, name: 'Gareth Southgate', nation: 'England', type: 'coach', role: 'Head Coach', normalImage: 'https://via.placeholder.com/300x300?text=Southgate', glitterImage: 'https://via.placeholder.com/300x300?text=Southgate' },
  { id: id++, name: 'Luis de la Fuente', nation: 'Spain', type: 'coach', role: 'Head Coach', normalImage: 'https://via.placeholder.com/300x300?text=De+la+Fuente', glitterImage: 'https://via.placeholder.com/300x300?text=De+la+Fuente' },
  { id: id++, name: 'Didier Deschamps', nation: 'France', type: 'coach', role: 'Head Coach', normalImage: 'https://via.placeholder.com/300x300?text=Deschamps', glitterImage: 'https://via.placeholder.com/300x300?text=Deschamps' },
];

players.push(...coaches);

// Add sample flags
const flags = [
  { id: id++, name: 'Germany Flag', nation: 'Germany', type: 'flag', normalImage: '🇩🇪', glitterImage: '🇩🇪' },
  { id: id++, name: 'Scotland Flag', nation: 'Scotland', type: 'flag', normalImage: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', glitterImage: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { id: id++, name: 'England Flag', nation: 'England', type: 'flag', normalImage: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', glitterImage: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: id++, name: 'Spain Flag', nation: 'Spain', type: 'flag', normalImage: '🇪🇸', glitterImage: '🇪🇸' },
  { id: id++, name: 'France Flag', nation: 'France', type: 'flag', normalImage: '🇫🇷', glitterImage: '🇫🇷' },
  { id: id++, name: 'Italy Flag', nation: 'Italy', type: 'flag', normalImage: '🇮🇹', glitterImage: '🇮🇹' },
  { id: id++, name: 'Netherlands Flag', nation: 'Netherlands', type: 'flag', normalImage: '🇳🇱', glitterImage: '🇳🇱' },
  { id: id++, name: 'Portugal Flag', nation: 'Portugal', type: 'flag', normalImage: '🇵🇹', glitterImage: '🇵🇹' },
];

players.push(...flags);

// Write to file
const outputPath = path.join(__dirname, '..', 'data', 'cards.json');
fs.writeFileSync(outputPath, JSON.stringify(players, null, 2));

console.log(`✅ Converted ${players.length} cards from CSV`);
console.log(`📊 Players: ${players.filter(p => p.type === 'player').length}`);
console.log(`🏅 Coaches: ${players.filter(p => p.type === 'coach').length}`);
console.log(`🚩 Flags: ${players.filter(p => p.type === 'flag').length}`);
console.log(`📁 Saved to: ${outputPath}`);
