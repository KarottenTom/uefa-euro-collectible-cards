import { useEffect, useState } from 'react';
import { fetchCollection, fetchCards } from '../api';

export default function CollectionPage() {
  const [collection, setCollection] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    Promise.all([fetchCollection(), fetchCards()])
      .then(([collData, cardsData]) => {
        setCollection(collData.collection);
        setAllCards(cardsData.cards);
        
        // Extract unique countries from all cards
        const uniqueCountries = [...new Set(cardsData.cards.map(c => c.nation))].sort();
        setCountries(uniqueCountries);
        if (uniqueCountries.length > 0) {
          setSelectedCountry(uniqueCountries[0]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Position sorting order
  const positionOrder = { 'flag': 0, 'coach': 1, 'goalkeeper': 2, 'defender': 3, 'midfielder': 4, 'attacker': 5 };

  // Get stats for a specific country
  const getCountryStats = (country) => {
    const countryCards = allCards.filter(c => c.nation === country);
    const countryCollection = collection.filter(c => c.nation === country);
    
    // Get unique card IDs from collection (a card is "collected" if they have normal OR glitter variant)
    const uniqueCollectedCardIds = new Set(countryCollection.map(c => c.cardId));
    const collectedUnique = uniqueCollectedCardIds.size;
    
    const shinyCollection = countryCollection.filter(c => c.variant === 'glitter');
    const normalCollection = countryCollection.filter(c => c.variant === 'normal');
    
    const totalCards = countryCards.length;
    const totalCollected = normalCollection.length + shinyCollection.length;
    const percentage = totalCollected > 0 ? Math.round((totalCollected / (totalCards * 2)) * 100) : 0;
    const shinyPercentage = totalCards > 0 ? Math.round((shinyCollection.length / totalCards) * 100) : 0;
    const normalPercentage = totalCards > 0 ? Math.round((normalCollection.length / totalCards) * 100) : 0;
    const stillNeed = Math.max(0, (totalCards * 2) - totalCollected);
    
    return { 
      totalCards, 
      collectedUnique, 
      totalCollected,
      percentage, 
      shinyPercentage, 
      normalPercentage, 
      shinyCount: shinyCollection.length, 
      normalCount: normalCollection.length,
      stillNeed
    };
  };

  const normalCards = selectedCountry 
    ? collection.filter((item) => item.variant === 'normal' && item.nation === selectedCountry)
      .sort((a, b) => {
        const posA = positionOrder[a.position?.toLowerCase()] ?? 999;
        const posB = positionOrder[b.position?.toLowerCase()] ?? 999;
        return posA - posB;
      })
    : [];
  const shinyCards = selectedCountry 
    ? collection.filter((item) => (item.variant === 'shiny' || item.variant === 'glitter') && item.nation === selectedCountry)
      .sort((a, b) => {
        const posA = positionOrder[a.position?.toLowerCase()] ?? 999;
        const posB = positionOrder[b.position?.toLowerCase()] ?? 999;
        return posA - posB;
      })
    : [];
  
  // Group cards by position
  const groupCardsByPosition = (cards) => {
    const groups = {
      'Flags & Coaches': [],
      'Goalkeepers': [],
      'Defenders': [],
      'Midfielders': [],
      'Attackers': []
    };
    
    cards.forEach(card => {
      if (card.type === 'flag' || card.type === 'coach') {
        groups['Flags & Coaches'].push(card);
      } else if (card.position?.toLowerCase() === 'goalkeeper') {
        groups['Goalkeepers'].push(card);
      } else if (card.position?.toLowerCase().includes('back') || card.position?.toLowerCase().includes('defence')) {
        groups['Defenders'].push(card);
      } else if (card.position?.toLowerCase().includes('midfield')) {
        groups['Midfielders'].push(card);
      } else {
        groups['Attackers'].push(card);
      }
    });
    
    return groups;
  };
  
  const normalCardGroups = groupCardsByPosition(normalCards);
  const shinyCardGroups = groupCardsByPosition(shinyCards);
  
  const stats = selectedCountry ? getCountryStats(selectedCountry) : {};

  return (
    <div className="card-panel">
      <div className="panel-title">
        <div>
          <h1 className="title-1">My Collection</h1>
          <p>View your acquired Euro 2024 cards by country.</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {loading ? (
        <div className="loader">Loading collection…</div>
      ) : (
        <>
          {/* Country Selector */}
          <div className="card-panel" style={{ marginBottom: 24 }}>
            <h2 style={{ marginTop: 0 }}>Select Country</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 8,
            }}>
              {countries.map((country) => {
                const stat = getCountryStats(country);
                const isSelected = selectedCountry === country;
                return (
                  <button
                    key={country}
                    onClick={() => setSelectedCountry(country)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #4080ff' : '1px solid rgba(255,255,255,0.1)',
                      background: isSelected ? 'rgba(64, 128, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: '#f4f7ff',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: isSelected ? '600' : '400',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: '600' }}>{country}</div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>
                        {stat.totalCollected}/{(stat.totalCards * 2)} ({stat.percentage}%)
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Country Stats */}
          {selectedCountry && (
            <div className="card-panel" style={{ marginBottom: 24, background: 'rgba(64, 128, 255, 0.1)', borderColor: 'rgba(64, 128, 255, 0.3)' }}>
              <h3 style={{ marginTop: 0 }}>{selectedCountry}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Normal Cards</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.normalCount} ({stats.normalPercentage}%)</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Shiny Cards</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.shinyCount} ({stats.shinyPercentage}%)</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Total Collected</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalCollected}/{(stats.totalCards * 2)} ({stats.percentage}%)</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Still Need</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.stillNeed}</div>
                </div>
              </div>
            </div>
          )}

          {/* Normal Cards */}
          <section className="card-panel" style={{ marginBottom: 24 }}>
            <h2 style={{ marginTop: 0 }}>Normal Cards</h2>
            {normalCards.length === 0 ? (
              <p className="alert">You have not collected any normal cards from {selectedCountry} yet.</p>
            ) : (
              <>
                {Object.entries(normalCardGroups).map(([groupName, groupCards]) => (
                  groupCards.length > 0 && (
                    <div key={groupName} style={{ marginBottom: 24 }}>
                      <h3 style={{ marginBottom: 12 }}>{groupName}</h3>
                      <div className="card-grid">
                        {groupCards.map((item) => (
                          <div key={`${item.cardId}-normal`} className="card-item">
                            <img className="card-image" src={item.normalImage} alt={item.name} />
                            <div className="card-meta">
                              <h3>{item.name}</h3>
                              <p>{item.type === 'player' ? 'Player' : item.type.toUpperCase()} • {item.nation}</p>
                              <p>Count: {item.count}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </>
            )}
          </section>

          {/* Shiny Cards */}
          <section className="card-panel">
            <h2 style={{ marginTop: 0 }}>Shiny Cards</h2>
            {shinyCards.length === 0 ? (
              <p className="alert">No shiny cards from {selectedCountry} yet. Open a pack to find one!</p>
            ) : (
              <>
                {Object.entries(shinyCardGroups).map(([groupName, groupCards]) => (
                  groupCards.length > 0 && (
                    <div key={groupName} style={{ marginBottom: 24 }}>
                      <h3 style={{ marginBottom: 12 }}>{groupName}</h3>
                      <div className="card-grid">
                        {groupCards.map((item) => (
                          <div key={`${item.cardId}-shiny`} className="card-item shimmer">
                            <img className="card-image" src={item.shinyImage} alt={item.name} />
                            <div className="card-meta">
                              <h3>{item.name}</h3>
                              <p>{item.type === 'player' ? 'Player' : item.type.toUpperCase()} • {item.nation}</p>
                              <p>Count: {item.count}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
