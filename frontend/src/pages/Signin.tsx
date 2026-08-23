import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../features/auth/api';
import { useAuthSession } from '../features/auth/AuthSessionContext';
import { ApiError } from '../lib/apiClient';
import './Signin.css';

export function Signin() {
  const navigate = useNavigate();
  const { login: startSession } = useAuthSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const { accessToken } = await login({ email: email.trim(), password });
      startSession(accessToken);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Incorrect email or password.');
      } else {
        setError('Sign in failed. Try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signin-page">
      <h1>Sign in</h1>

      <form onSubmit={handleSubmit}>
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
            required
          />
        </label>

        <button type="submit" disabled={isSubmitting || !email.trim() || !password}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {error && <p className="signin-error">{error}</p>}

      <p className="signin-signup-link">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
