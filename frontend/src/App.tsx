import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { Upload } from './pages/Upload';
import { Signup } from './pages/Signup';
import { Signin } from './pages/Signin';
import { AuthSessionProvider } from './features/auth/AuthSessionContext';

// Lazy-loaded: pulls in Shaka Player, which shouldn't bloat the initial bundle.
const Watch = lazy(() => import('./pages/Watch').then((m) => ({ default: m.Watch })));

function App() {
  return (
    <AuthSessionProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="upload" element={<Upload />} />
            <Route path="signup" element={<Signup />} />
            <Route path="signin" element={<Signin />} />
            <Route
              path="watch/:id"
              element={
                <Suspense fallback={<p>Loading player…</p>}>
                  <Watch />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthSessionProvider>
  );
}

export default App;
