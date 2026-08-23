import { Link } from 'react-router-dom';
import { MenuIcon, PlayIcon, SearchIcon } from './icons';
import { UserMenu } from '../../features/user/UserMenu';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
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
        <Link to="/signup" className="app-header__signup-link">
          Sign up
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}
