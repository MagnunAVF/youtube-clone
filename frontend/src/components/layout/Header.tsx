import { Link, useNavigate } from 'react-router-dom';
import { MenuIcon, PlayIcon, SearchIcon } from './icons';
import { useAuthSession } from '../../features/auth/AuthSessionContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="app-header__start">
        <button
          type="button"
          className="icon-button"
          aria-label="Toggle navigation menu"
          onClick={onMenuClick}
        >
          <MenuIcon />
        </button>
        <Link to="/" className="app-header__logo">
          <PlayIcon />
          <span>Tube</span>
        </Link>
      </div>

      <form
        className="app-header__search"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <input type="search" placeholder="Search" aria-label="Search" />
        <button type="submit" aria-label="Search">
          <SearchIcon />
        </button>
      </form>

      <div className="app-header__end">
        {user ? (
          <>
            <span className="app-header__user">{user.displayName}</span>
            <button type="button" className="app-header__logout-button" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/signin" className="app-header__signin-link">
              Sign in
            </Link>
            <Link to="/signup" className="app-header__signup-link">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
