import { BrowserRouter, Route, Routes } from 'react-router';
import { Session, SessionProvider } from '../model/session.ts';
import { useModel } from '../utils/useModel.ts';
import { AuthCallback } from '../pages/AuthCallback.tsx';
import { LoginOutline } from './loginOutline.tsx';
import { Results, ResultsProvider } from '../model/results.ts';
import { Home } from '../pages/home/Home.tsx';

function Router() {
  const session = useModel(() => new Session());
  const results = useModel(() => new Results());

  if (session === null) {
    return null;
  }

  return (
    <SessionProvider value={session}>
      <ResultsProvider value={results}>
        <BrowserRouter>
          <Routes>
            <Route element={<LoginOutline />}>
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ResultsProvider>
    </SessionProvider>
  );
}

export { Router };
