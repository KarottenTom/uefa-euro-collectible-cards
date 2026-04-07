import { Link } from 'react-router-dom';

export default function NavBar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <span>EURO 2024</span>
        <strong>Collectibles</strong>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            <Link className="nav-link" to="/cards">All Cards</Link>
            <Link className="nav-link" to="/pack">Pack Opening</Link>
            {user.admin && <Link className="nav-link" to="/admin">Admin</Link>}
            <button className="secondary" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="nav-link" to="/login">Login</Link>
            <Link className="nav-link" to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
