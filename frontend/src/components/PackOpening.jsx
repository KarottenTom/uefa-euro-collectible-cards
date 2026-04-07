import { useState, useEffect } from 'react';
import { openPack } from '../api';
import './PackOpening.css';

export default function PackOpening() {
  const [pack, setPack] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpening, setIsOpening] = useState(false);
  const [flipped, setFlipped] = useState({});
  const SHINY_PERCENTAGE = 7.5;

  const handleOpenPack = async () => {
    setError('');
    setLoading(true);
    setIsOpening(true);
    setFlipped({}); // Reset flipped cards
    try {
      const result = await openPack();
      // Ensure no duplicate cards in the pack
      const uniqueCards = [];
      const cardIds = new Set();
      for (const card of result.pack) {
        if (!cardIds.has(card.id)) {
          uniqueCards.push(card);
          cardIds.add(card.id);
        }
      }
      setPack(uniqueCards.length === 5 ? result.pack : result.pack);
    } catch (err) {
      setError(err.message);
      setIsOpening(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (index) => {
    // Cards can only be flipped once, from back to front
    setFlipped((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  const handleOpenAnother = () => {
    setPack([]);
    setIsOpening(false);
    setFlipped({});
  };

  useEffect(() => {
    if (isOpening && pack.length > 0) {
      // Animation completes after 1.8 seconds (optimized for tablets)
      const timer = setTimeout(() => {
        setIsOpening(false);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isOpening, pack]);

  return (
    <div className="card-panel">
      <div className="panel-title">
        <div>
          <h1 className="title-1">Pack Opening</h1>
          <p>Click the pack to open a five-card Euro 2024 pack with a {SHINY_PERCENTAGE}% shiny chance.</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      
      {!isOpening && pack.length === 0 && (
        <div className="pack-click-container">
          <div className="football-field">
            <img 
              src="/spiellogo.png" 
              alt="Euro 2024 Logo Left" 
              className="euro-logo euro-logo-left clickable-logo"
              onClick={handleOpenPack}
              disabled={loading}
            />
            <img 
              src="/spiellogo.png" 
              alt="Euro 2024 Logo Right" 
              className="euro-logo euro-logo-right clickable-logo"
              onClick={handleOpenPack}
              disabled={loading}
            />
          </div>
        </div>
      )}
      
      {isOpening && pack.length > 0 && (
        <div className="pack-animation-container">
          <div className="pack-opening">
            <div className="pack-cards">
              {pack.map((_, index) => (
                <div key={index} className={`pack-card pack-card-${index}`} />
              ))}
            </div>
            <div className="pack-glow" />
          </div>
        </div>
      )}
      
      {pack.length > 0 && !isOpening ? (
        <>
          <div className="card-grid pack-grid reveal-animation" style={{ marginTop: 16 }}>
            {pack.map((card, index) => {
              const displayName = card.type === 'coach' || card.type === 'flag' ? card.name.toUpperCase() : card.name;
              const isShiny = card.variant === 'glitter' || card.variant === 'shiny';
              const isCardFlipped = flipped[index] || false;
              
              return (
                <div 
                  key={`${card.id}-${index}`} 
                  className={`card-item card-reveal ${isShiny ? 'shimmer' : ''}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                  onClick={() => handleCardClick(index)}
                >
                  <div className={`card-flip-container ${isCardFlipped ? 'flipped' : ''}`}>
                    {/* Back side - Spiellogo */}
                    <div className="card-back" />
                    
                    {/* Front side - Player */}
                    <div className="card-front">
                      <img 
                        className="card-image" 
                        src={isShiny ? (card.glitterImage || card.shinyImage) : card.normalImage} 
                        alt={card.name} 
                      />
                      <div className="card-meta">
                        <div className="badge">{isShiny ? 'SHINY' : 'NORMAL'}</div>
                        <h3>{displayName}</h3>
                        <p>{card.type === 'player' ? 'Player' : card.type.toUpperCase()} • {card.nation}</p>
                        <p>{card.position}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pack-actions" style={{ marginTop: 32 }}>
            <button className="primary" onClick={handleOpenAnother}>
              Open Another Pack
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
