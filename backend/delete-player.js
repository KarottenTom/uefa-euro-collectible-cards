const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.run('DELETE FROM cards WHERE name = ? AND nation = ?', ['Jakub Kaluzinski', 'Poland'], function(err) {
  if (err) {
    console.error('Error deleting:', err);
  } else {
    console.log('Deleted ' + this.changes + ' player(s)');
    
    db.get('SELECT COUNT(*) as count FROM cards WHERE nation = ? AND type = ?', ['Poland', 'player'], (err, row) => {
      if (err) console.error(err);
      console.log('Poland now has ' + row.count + ' players');
      
      db.all('SELECT nation, COUNT(*) as player_count FROM cards WHERE type = ? GROUP BY nation ORDER BY nation', ['player'], (err, rows) => {
        if (err) console.error(err);
        console.log('\n=== UPDATED PLAYER COUNTS ===');
        rows.forEach(row => console.log(row.nation + ': ' + row.player_count));
        db.close();
      });
    });
  }
});
