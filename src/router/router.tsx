import { BrowserRouter, Route, Routes } from 'react-router';
import { Session, SessionProvider } from '../model/session.ts';
import { useModel } from '../utils/useModel.ts';
import { AuthCallback } from '../pages/AuthCallback.tsx';
import { LoginOutline } from './loginOutline.tsx';
import { Results, ResultsProvider } from '../model/results.ts';
import { AddSwimmer } from '../pages/addSwimmer/addSwimmer.tsx';
import { Teams } from '../pages/teams/teams.tsx';
import { AddTeam } from '../pages/teams/addTeam.tsx';
import { SegmentOutline } from './segmentOutline.tsx';
import { SegmentAdd, SegmentIndex } from './segmentPages.tsx';
import { Home } from '../pages/home/home.tsx';

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
              <Route path="/swimmers/add" element={<AddSwimmer />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/add" element={<AddTeam />} />
              <Route path="/:segment" element={<SegmentOutline />}>
                <Route index element={<SegmentIndex />} />
                <Route path="add" element={<SegmentAdd />} />
              </Route>
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ResultsProvider>
    </SessionProvider>
  );
}

export { Router };
