import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../features/auth/api';
import { useAuthSession } from '../features/auth/AuthSessionContext';
import { ApiError } from '../lib/apiClient';
import './Signup.css';

export function Signup() {
  const navigate = useNavigate();
  const { login } = useAuthSession();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!displayName.trim() || !email.trim() || password.length < 8) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const { accessToken, user } = await signup({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      });
      login(accessToken, user);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('That email is already registered.');
      } else {
        setError('Sign up failed. Try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <h1>Sign up</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting || !displayName.trim() || !email.trim() || password.length < 8}
        >
          {isSubmitting ? 'Signing up…' : 'Sign up'}
        </button>
      </form>

      {error && <p className="signup-error">{error}</p>}

      <p className="signup-signin-link">
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </div>
  );
}
