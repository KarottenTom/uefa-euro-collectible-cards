import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, fetchProfile } from '../api';
import { saveToken } from '../auth';

export default function LoginPage({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      saveToken(data.token);
      const profile = await fetchProfile();
      setUser(profile.user);
      navigate('/pack');
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
          <h1 className="title-1">Login</h1>
          <p>Secure access to your Euro 2024 collectible cards.</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      <form onSubmit={handleSubmit} className="grid" style={{ gap: 16 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
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
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
