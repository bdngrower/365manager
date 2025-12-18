
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
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-2xl">
        <div className="flex flex-col items-center">
          <LogoIcon className="w-16 h-16 text-primary" />
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
            Permissions Manager
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Entre para gerenciar permissões do SharePoint
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                {/* Fixed: Replaced missing ErrorIcon with ShieldErrorIcon from Icons.tsx */}
                <ShieldErrorIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={onLogin}
            disabled={isLoading}
            className="relative flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-[#2F2F2F] border border-transparent rounded-md group hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                className="text-xs text-gray-500 hover:text-primary underline focus:outline-none"
            >
                Alterar Configuração
            </button>
        </div>
        <p className="mt-4 text-xs text-center text-gray-500">
            Esta aplicação usa Autenticação Microsoft para gerenciar recursos do SharePoint de forma segura.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
