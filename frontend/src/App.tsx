import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { Upload } from './pages/Upload';
import { Watch } from './pages/Watch';
import { CurrentUserProvider } from './features/user/CurrentUserContext';

function App() {
  return (
    <CurrentUserProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="upload" element={<Upload />} />
            <Route path="watch/:id" element={<Watch />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CurrentUserProvider>
  );
}

export default App;
