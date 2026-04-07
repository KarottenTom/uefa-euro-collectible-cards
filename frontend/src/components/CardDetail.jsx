import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCardById } from '../api';

export default function CardDetail() {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCardById(id)
      .then((data) => setCard(data.card))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="loader">Loading card…</div>;
  }

  if (error) {
    return <div className="alert">{error}</div>;
  }

  if (!card) {
    return <div className="alert">Card not found.</div>;
  }

  return (
    <div className="card-panel" style={{ maxWidth: 860, margin: '24px auto' }}>
      <div className="panel-title">
        <div>
          <h1 className="title-1">{card.name}</h1>
          <p>{card.type.toUpperCase()} card detail for Euro 2024 collection.</p>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <div>
          <img className="card-image" src={card.normalImage} alt={card.name} />
        </div>
        <div>
          <div className="badge">{card.type}</div>
          <p style={{ marginTop: 16 }}><strong>Nation:</strong> {card.nation}</p>
          <p><strong>Team:</strong> {card.team || 'N/A'}</p>
          <p><strong>Position:</strong> {card.position || 'N/A'}</p>
          <div style={{ marginTop: 20 }}>
            <h3>Glitter Variant</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              <img className="card-image" src={card.glitterImage} alt={`${card.name} glitter`} />
              <div className="status-pill">Shimmer effect applied to glitter cards</div>
            </div>
          </div>
        </div>
      </div>
      <Link to="/cards" className="secondary" style={{ marginTop: 18, display: 'inline-flex' }}>
        Back to all cards
      </Link>
    </div>
  );
}
