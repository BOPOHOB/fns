import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { observer } from 'mobx-react';
import { takeOauthState } from '../api/auth.ts';
import { useSession } from '../model/session.ts';

/** Защита от двойного exchange в React StrictMode. */
let callbackHandled = false;

/**
 * Redirect URI Яндекса: /auth/callback?code=&state=
 * Проверяет state, шлёт code на бэк, уходит на /.
 */
const AuthCallback = observer(() => {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (callbackHandled) return;
    callbackHandled = true;

    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error_description') ?? params.get('error');
    const code = params.get('code');
    const state = params.get('state');
    const expected = takeOauthState();

    window.history.replaceState(null, '', '/auth/callback');

    void (async () => {
      if (oauthError) {
        session.setAuthError(oauthError);
        navigate('/', { replace: true });
        return;
      }

      if (!code || !state || !expected || state !== expected) {
        session.setAuthError('Некорректный ответ OAuth (state/code)');
        navigate('/', { replace: true });
        return;
      }

      try {
        await session.completeExchange(code);
      } catch {
        // ошибка уже в session.authError
      }
      navigate('/', { replace: true });
    })();
  }, [navigate, session]);

  return <p>Вход…</p>;
});

export { AuthCallback };
