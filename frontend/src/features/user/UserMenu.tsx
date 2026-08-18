import { useState, type FormEvent } from 'react';
import { useCurrentUser } from './CurrentUserContext';
import './user-menu.css';

export function UserMenu() {
  const { currentUser, users, selectUser, createUser } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    selectUser(id);
    setIsOpen(false);
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!displayName.trim()) return;

    setIsCreating(true);
    setError(null);
    try {
      await createUser(displayName.trim());
      setDisplayName('');
      setIsOpen(false);
    } catch {
      setError('Could not create user. Try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="user-menu">
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={currentUser ? `Current user: ${currentUser.displayName}` : 'Select user'}
      >
        {currentUser ? currentUser.displayName.charAt(0).toUpperCase() : '?'}
      </button>

      {isOpen && (
        <div className="user-menu__panel">
          {users.length > 0 && (
            <ul className="user-menu__list">
              {users.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    className={user.id === currentUser?.id ? 'active' : ''}
                    onClick={() => handleSelect(user.id)}
                  >
                    {user.displayName}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form className="user-menu__create" onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="New user name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              aria-label="New user name"
            />
            <button type="submit" disabled={isCreating || !displayName.trim()}>
              {isCreating ? 'Creating…' : 'Create'}
            </button>
          </form>
          {error && <p className="user-menu__error">{error}</p>}
        </div>
      )}
    </div>
  );
}
