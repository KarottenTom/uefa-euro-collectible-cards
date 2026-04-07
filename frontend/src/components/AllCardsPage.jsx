import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCards, fetchCollection } from '../api';

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'normal', label: 'Normal' },
  { value: 'shiny', label: 'Shiny' }
];

const positionOrder = {
  'Goalkeeper': 0,
  'Centre-Back': 1,
  'Left-Back': 2,
  'Right-Back': 3,
  'Defensive Midfield': 4,
  'Central Midfield': 5,
  'Attacking Midfield': 6,
  'Left Winger': 7,
  'Right Winger': 8,
  'Second Striker': 9,
  'Centre-Forward': 10,
};

export default function AllCardsPage() {
  const [cards, setCards] = useState([]);
  const [collection, setCollection] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchCards(), fetchCollection()])
      .then(([cardsData, collData]) => {
        setCards(cardsData.cards);
        setCollection(collData.collection);
        
        // Extract unique countries from all cards
        const uniqueCountries = [...new Set(cardsData.cards.map(c => c.nation))].sort((a, b) => a.localeCompare(b));
        setCountries(uniqueCountries);
        if (uniqueCountries.length > 0) {
          setSelectedCountry(uniqueCountries[0]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Get stats for a specific country
  const getCountryStats = (country) => {
    const countryCards = cards.filter(c => c.nation === country);
    let countryCollection = collection.filter(c => c.nation === country);
    
    // Filter by variant if not "all"
    if (filter === 'normal') {
      countryCollection = countryCollection.filter(c => c.variant === 'normal');
    } else if (filter === 'shiny') {
      countryCollection = countryCollection.filter(c => c.variant === 'glitter');
    }
    
    const shinyCollection = collection.filter(c => c.nation === country && c.variant === 'glitter');
    const normalCollection = collection.filter(c => c.nation === country && c.variant === 'normal');
    
    // When showing all variants, total cards = unique cards × 2 (normal + shiny)
    const totalCards = filter === 'all' ? countryCards.length * 2 : countryCards.length;
    const collectedCards = countryCollection.length;
    const percentage = totalCards > 0 ? Math.round((collectedCards / totalCards) * 100) : 0;
    const shinyPercentage = countryCards.length > 0 ? Math.round((shinyCollection.length / countryCards.length) * 100) : 0;
    const normalPercentage = countryCards.length > 0 ? Math.round((normalCollection.length / countryCards.length) * 100) : 0;
    
    return { totalCards, collectedCards, percentage, shinyPercentage, normalPercentage, shinyCount: shinyCollection.length, normalCount: normalCollection.length };
  };

  const isCardCollected = (cardId, variant = null) => {
    if (variant) {
      return collection.some(c => c.cardId === cardId && c.variant === variant);
    } else if (filter === 'normal') {
      return collection.some(c => c.cardId === cardId && c.variant === 'normal');
    } else if (filter === 'shiny') {
      return collection.some(c => c.cardId === cardId && c.variant === 'glitter');
    }
    return collection.some(c => c.cardId === cardId);
  };

  const groupedCards = useMemo(() => {
    let filtered = cards;
    if (selectedCountry) {
      filtered = filtered.filter((card) => card.nation === selectedCountry);
    }
    
    // Group by position
    const groups = {
      'Flags & Coaches': [],
      'Goalkeepers': [],
      'Defenders': [],
      'Midfielders': [],
      'Attackers': []
    };
    
    filtered.forEach(card => {
      if (card.type === 'flag' || card.type === 'coach') {
        groups['Flags & Coaches'].push(card);
      } else if (card.position?.toLowerCase() === 'goalkeeper') {
        groups['Goalkeepers'].push(card);
      } else if (card.position?.toLowerCase().includes('back') || card.position?.toLowerCase().includes('defence')) {
        groups['Defenders'].push(card);
      } else if (card.position?.toLowerCase().includes('midfield')) {
        groups['Midfielders'].push(card);
      } else if (card.position?.toLowerCase().includes('forward') || card.position?.toLowerCase().includes('striker') || card.position?.toLowerCase().includes('winger')) {
        groups['Attackers'].push(card);
      } else {
        groups['Attackers'].push(card);
      }
    });
    
    return groups;
  }, [cards, selectedCountry]);

  const stats = selectedCountry ? getCountryStats(selectedCountry) : {};

  return (
    <div className="card-panel">
      <div className="panel-title">
        <div>
          <h1 className="title-1">Your Collection</h1>
          <p>Browse and collect official Euro 2024 cards by country. Collected cards show your player's face, uncollected cards appear as grey placeholders.</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      {error && <div className="alert">{error}</div>}
      {loading ? (
        <div className="loader">Loading cards…</div>
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
                        {stat.collectedCards}/{stat.totalCards} ({stat.percentage}%)
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
                {filter === 'all' && (
                  <>
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>Total Collected</div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.collectedCards}/{stats.totalCards}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>Normal Cards</div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.normalCount} ({stats.normalPercentage}%)</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>Shiny Cards</div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.shinyCount} ({stats.shinyPercentage}%)</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>Still Need</div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalCards - stats.collectedCards}</div>
                    </div>
                  </>
                )}
                {filter === 'normal' && (
                  <>
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>Normal Collected</div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.normalCount}/{stats.totalCards}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>Normal Percentage</div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.normalPercentage}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>Still Need (Normal)</div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalCards - stats.normalCount}</div>
                    </div>
                  </>
                )}
                {filter === 'shiny' && (
                  <>
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>Shiny Collected</div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.shinyCount}/{stats.totalCards}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>Shiny Percentage</div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.shinyPercentage}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>Still Need (Shiny)</div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalCards - stats.shinyCount}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Cards Grid by Position Group */}
          {Object.entries(groupedCards).map(([groupName, groupCards]) => {
            return groupCards.length > 0 && (
              <section className="card-panel" style={{ marginBottom: 24 }} key={groupName}>
                <h2 style={{ marginTop: 0 }}>{groupName}</h2>
                <div className="card-grid">
                  {groupCards.map((card) => {
                    const collected = isCardCollected(card.id);
                    const collectedImage = filter === 'shiny' ? card.glitterImage : card.normalImage;
                    return collected ? (
                      <Link key={card.id} className="card-item" to={`/cards/${card.id}`}>
                        <div className="shimmer" style={{
                          width: '100%',
                          aspectRatio: '2/3',
                          borderRadius: '8px',
                          overflow: 'hidden'
                        }}>
                          <img className="card-image" src={collectedImage} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="card-meta">
                          <h3>{card.type === 'coach' || card.type === 'flag' ? card.name.toUpperCase() : card.name}</h3>
                          <p>{card.type === 'player' ? 'Player' : card.type.toUpperCase()} • {card.nation}</p>
                          <p>{card.position}</p>
                        </div>
                      </Link>
                    ) : (
                      <div
                        key={card.id}
                        className="card-item"
                        style={{
                          cursor: 'default',
                          opacity: 0.7
                        }}
                      >
                        <div style={{
                          width: '100%',
                          aspectRatio: '2/3',
                          background: '#555',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px'
                        }}>
                          <div style={{ textAlign: 'center', color: '#888' }}>
                            <div style={{ fontSize: '12px' }}>Not Collected</div>
                          </div>
                        </div>
                        <div className="card-meta">
                          <h3>{card.type === 'coach' || card.type === 'flag' ? card.name.toUpperCase() : card.name}</h3>
                          <p>{card.type === 'player' ? 'Player' : card.type.toUpperCase()} • {card.nation}</p>
                          <p>{card.position}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {Object.values(groupedCards).every(g => g.length === 0) && (
            <div className="alert">No cards found for the selected filters.</div>
          )}
        </>
      )}
    </div>
  );
}
