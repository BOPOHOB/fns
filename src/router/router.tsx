import { BrowserRouter, Route, Routes } from 'react-router';
import { Session, SessionProvider } from '../model/session.ts';
import { useModel } from '../utils/useModel.ts';
import { AuthCallback } from '../pages/AuthCallback.tsx';
import { LoginOutline } from './loginOutline.tsx';
import { Results, ResultsProvider } from '../model/results.ts';
import { AddResult } from '../pages/addResult/addResult.tsx';
import { AddSwimmer } from '../pages/addSwimmer/addSwimmer.tsx';
import { Teams } from '../pages/teams/teams.tsx';
import { AddTeam } from '../pages/teams/addTeam.tsx';
import { Swimmer } from '../pages/swimmer/swimmer.tsx';
import { SwimmerOutline } from './swimmerOutline.tsx';
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
              <Route path="/:swimmerId" element={<SwimmerOutline />}>
                <Route element={<AddResult />} path="/:swimmerId/add" />
                <Route element={<Swimmer />} path="/:swimmerId" />
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
