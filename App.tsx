
import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import PermissionManager from './components/PermissionManager';
import ConfigurationScreen from './components/ConfigurationScreen';
import { LogoIcon, LoadingIcon } from './components/Icons';
import * as AuthService from './services/authService';
import { AccountInfo } from '@azure/msal-browser';

const CLIENT_ID_KEY = 'msal_client_id';
const TENANT_ID_KEY = 'msal_tenant_id';
const THEME_KEY = 'app_theme';

const App: React.FC = () => {
  const [config, setConfig] = useState<{clientId: string, tenantId: string} | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [isMsalInitialized, setIsMsalInitialized] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem(THEME_KEY) === 'dark');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const initMsalAndCheckAccount = useCallback(async (cid: string, tid: string) => {
    try {
      await AuthService.initializeMsal(cid, tid);
      await AuthService.handleRedirect();
      const activeAccount = AuthService.getAccount();
      if (activeAccount) setAccount(activeAccount);
      setIsMsalInitialized(true);
    } catch (err: any) {
      if (err.name === 'BrowserAuthError') {
          localStorage.removeItem(CLIENT_ID_KEY);
          setConfig(null);
      }
      setIsMsalInitialized(true);
    }
  }, []);

  useEffect(() => {
    const cid = localStorage.getItem(CLIENT_ID_KEY);
    const tid = localStorage.getItem(TENANT_ID_KEY) || 'common';
    if (cid) {
      setConfig({ clientId: cid, tenantId: tid });
      initMsalAndCheckAccount(cid, tid);
    } else {
      setIsMsalInitialized(true);
    }
  }, [initMsalAndCheckAccount]);

  const handleConfigSave = useCallback(async (clientId: string, tenantId: string) => {
    localStorage.setItem(CLIENT_ID_KEY, clientId);
    localStorage.setItem(TENANT_ID_KEY, tenantId);
    window.location.reload();
  }, []);

  if (!isMsalInitialized) return <div className="flex flex-col items-center justify-center min-h-screen space-y-4 text-primary font-bold"><LoadingIcon className="w-12 h-12" /><span>Autenticando...</span></div>;
  if (!config) return <ConfigurationScreen onConfigSave={handleConfigSave} />;

  return (
    <div className="w-full min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] transition-colors">
      {!account ? (
        <LoginScreen onLogin={() => AuthService.login()} isLoading={isLoggingIn} error={loginError} onResetConfig={() => { localStorage.clear(); setConfig(null); }} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="no-print flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <LogoIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Governance Pro</h1>
                <p className="text-xs text-gray-400 dark:text-slate-400 font-medium">SharePoint Security Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-center">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all">
                {darkMode ? '☀️' : '🌙'}
              </button>
              <div className="h-10 w-[1px] bg-gray-200 dark:bg-slate-700 mx-2 hidden sm:block" />
              <span className="text-sm font-bold text-gray-500 hidden md:block">Olá, {account.name.split(' ')[0]}</span>
              <button onClick={() => AuthService.logout()} className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-accent transition-all shadow-lg shadow-primary/20">Sair</button>
            </div>
          </header>
          <main className="animate-slide-up">
            <PermissionManager />
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
