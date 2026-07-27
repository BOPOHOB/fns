import { BrowserRouter, Route, Routes } from 'react-router';
import { Session, SessionProvider } from '../model/session.ts';
import { useModel } from '../utils/useModel.ts';
import { AuthCallback } from '../pages/AuthCallback.tsx';
import { Home } from '../pages/Home.tsx';

function Router() {
  const session = useModel(() => new Session());

  if (session === null) {
    return null;
  }

  return (
    <SessionProvider value={session}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}

export { Router };
