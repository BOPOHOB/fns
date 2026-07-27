import { observable } from 'mobx';
import { createContext, useContext } from 'react';
import type { AuthUser } from '../types/auth.ts';
import {
  exchangeCode,
  fetchMe,
  logoutRequest,
  startYandexLogin,
} from '../api/auth.ts';
import type { Result } from './result';
import type { Swimmer } from './swimmer';
import type { ResultSeries } from './resultSeries';
import type { Team } from './team';

const getData = () => Promise.resolve();

class Session {
  results = observable.array<Result>();
  swimmers = observable.array<Swimmer>();
  series = observable.array<ResultSeries>();
  teams = observable.array<Team>();

  #isLoading = observable.box(true);
  #isAuthLoading = observable.box(true);
  #user = observable.box<AuthUser | null>(null);
  #authError = observable.box<string | null>(null);

  constructor() {
    getData()
      .then(() => {})
      .finally(() => {
        this.#isLoading.set(false);
      });

    void this.loadMe();
  }

  get isLoading() {
    return this.#isLoading.get();
  }

  get isAuthLoading() {
    return this.#isAuthLoading.get();
  }

  get user() {
    return this.#user.get();
  }

  get authError() {
    return this.#authError.get();
  }

  get isAuthenticated() {
    return this.#user.get() !== null;
  }

  clearAuthError() {
    this.#authError.set(null);
  }

  setAuthError(message: string) {
    this.#authError.set(message);
  }

  async loadMe() {
    this.#isAuthLoading.set(true);
    try {
      const user = await fetchMe();
      this.#user.set(user);
    } catch (e) {
      this.#user.set(null);
      this.#authError.set(e instanceof Error ? e.message : 'Не удалось проверить сессию');
    } finally {
      this.#isAuthLoading.set(false);
    }
  }

  async login() {
    this.#authError.set(null);
    try {
      await startYandexLogin();
    } catch (e) {
      this.#authError.set(e instanceof Error ? e.message : 'Не удалось начать вход');
    }
  }

  async completeExchange(code: string) {
    this.#isAuthLoading.set(true);
    this.#authError.set(null);
    try {
      const user = await exchangeCode(code);
      this.#user.set(user);
    } catch (e) {
      this.#user.set(null);
      this.#authError.set(e instanceof Error ? e.message : 'Обмен кода не удался');
      throw e;
    } finally {
      this.#isAuthLoading.set(false);
    }
  }

  async logout() {
    this.#authError.set(null);
    try {
      await logoutRequest();
      this.#user.set(null);
    } catch (e) {
      this.#authError.set(e instanceof Error ? e.message : 'Не удалось выйти');
    }
  }
}

const SessionContext = createContext<Session | null>(null);
const SessionProvider = SessionContext.Provider;

function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}

export { SessionProvider, useSession, Session };
