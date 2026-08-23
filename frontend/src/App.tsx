import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { Upload } from './pages/Upload';
import { Signup } from './pages/Signup';
import { CurrentUserProvider } from './features/user/CurrentUserContext';

// Lazy-loaded: pulls in Shaka Player, which shouldn't bloat the initial bundle.
const Watch = lazy(() => import('./pages/Watch').then((m) => ({ default: m.Watch })));

function App() {
  return (
    <CurrentUserProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="upload" element={<Upload />} />
            <Route path="signup" element={<Signup />} />
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
    </CurrentUserProvider>
  );
}

export default App;
