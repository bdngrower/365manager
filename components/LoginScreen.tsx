
import React from 'react';
import { LogoIcon, MicrosoftIcon, LoadingIcon, ShieldErrorIcon } from './Icons';

interface LoginScreenProps {
  onLogin: () => void;
  isLoading: boolean;
  error: string | null;
  onResetConfig: () => void; // Nova prop para redefinir a configuração
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoading, error, onResetConfig }) => {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{backgroundColor: '#0b1120'}}>
      <div className="w-full max-w-md p-10 space-y-8 rounded-3xl shadow-2xl border border-slate-700" style={{backgroundColor: '#1e293b'}}>
        <div className="flex flex-col items-center">
          <LogoIcon className="w-20 h-20 text-primary mb-4" />
          <h1 className="text-4xl font-black text-center text-slate-100 leading-tight tracking-tight">
            Zim 365 Manager
          </h1>
          <h2 className="mt-2 text-lg font-bold text-primary">
            SharePoint Security Center
          </h2>
          <p className="mt-3 text-sm text-center text-slate-400">
            Entre para gerenciar permissões do SharePoint
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldErrorIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={onLogin}
            disabled={isLoading}
            className="relative flex items-center justify-center w-full px-6 py-4 text-base font-bold text-white bg-[#2F2F2F] border border-slate-600 rounded-xl group hover:bg-black hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-all shadow-lg disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <LoadingIcon className="w-5 h-5 mr-3" />
            ) : (
              <MicrosoftIcon className="w-5 h-5 mr-3" />
            )}
            {isLoading ? 'Entrando...' : 'Entrar com Microsoft'}
          </button>
        </div>
        <div className="mt-4 text-center">
            <button
                onClick={onResetConfig}
                className="text-xs text-slate-400 hover:text-primary underline focus:outline-none transition-colors"
            >
                Alterar Configuração
            </button>
        </div>
        <p className="mt-4 text-xs text-center text-slate-500 leading-relaxed">
            Esta aplicação usa Autenticação Microsoft para gerenciar recursos do SharePoint de forma segura.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;