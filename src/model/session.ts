import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { createContext, useContext } from 'react';
import type { AuthUser } from '../types/auth.ts';
import {
  exchangeCode,
  fetchMe,
  logoutRequest,
  startYandexLogin,
} from '../api/auth.ts';

class Session {
  #isLoading = observable.box(true);
  #user = observable.box<AuthUser | null | undefined>();
  #authError = observable.box<string | null>(null);

  constructor() {
    if (import.meta.env.SSR) {
      this.#user.set(null);
    } else {
      void this.loadMe();
    }

    makeObservable(this, {
      loadMe: action,
      isAuthLoading: computed,
      user: computed,
      authError: computed,
      isAuthenticated: computed,
      isTrainer: computed,
    });
  }

  get isTrainer() {
    return typeof this.#user.get()?.swimmerId === 'number';
  }

  get isLoading() {
    return this.#isLoading.get();
  }

  get isAuthLoading() {
    return this.#user.get() === undefined;
  }

  get user() {
    return this.#user.get();
  }

  private set user(value: AuthUser | null) {
    runInAction(() => {
      this.#user.set(value);
    });
  }

  get authError() {
    return this.#authError.get();
  }

  private set authError(value: string | null) {
    runInAction(() => {
      this.#authError.set(value);
    });
  }

  get isAuthenticated() {
    return this.#user.get() !== null;
  }

  readonly clearAuthError = () => {
    this.authError = null;
  }

  setAuthError(message: string) {
    this.authError = message;
  }

  async loadMe() {
    try {
      this.user = await fetchMe();
    } catch (e) {
      this.user = null;
      this.authError = e instanceof Error ? e.message : 'Не удалось проверить сессию';
    }
  }

  async login() {
    this.authError = null;
    try {
      await startYandexLogin();
    } catch (e) {
      this.authError = e instanceof Error ? e.message : 'Не удалось начать вход';
    }
  }

  async completeExchange(code: string) {
    this.authError = null;
    try {
      this.user = await exchangeCode(code);
    } catch (e) {
      this.user = null;
      this.authError = e instanceof Error ? e.message : 'Обмен кода не удался';
      throw e;
    }
  }

  async logout() {
    this.authError = null;
    try {
      await logoutRequest();
      this.user = null;
    } catch (e) {
      this.authError = e instanceof Error ? e.message : 'Не удалось выйти';
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
