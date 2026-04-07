import { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = await register(email, username, password);
      setMessage(data.message);
      setEmail('');
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-panel" style={{ maxWidth: 520, margin: '32px auto' }}>
      <div className="panel-title">
        <div>
          <h1 className="title-1">Create account</h1>
          <p>Register to collect official Euro 2024 cards.</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {message && <div className="alert">{message}</div>}
      <form onSubmit={handleSubmit} className="grid" style={{ gap: 16 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
        />
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
        />
        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
