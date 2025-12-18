
import React, { useState } from 'react';
import { LogoIcon, ShieldErrorIcon } from './Icons';

interface ConfigurationScreenProps {
    onConfigSave: (clientId: string, tenantId: string) => void;
}

const ConfigurationScreen: React.FC<ConfigurationScreenProps> = ({ onConfigSave }) => {
    const [clientId, setClientId] = useState('');
    const [tenantId, setTenantId] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId.trim() || !tenantId.trim()) {
            setError("Ambos os IDs são obrigatórios.");
            return;
        }
        onConfigSave(clientId.trim(), tenantId.trim());
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
            <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-2xl shadow-2xl">
                <div className="flex flex-col items-center">
                    <LogoIcon className="w-16 h-16 text-primary" />
                    <h2 className="mt-6 text-3xl font-black text-center text-gray-900 leading-tight">
                        Configuração Azure
                    </h2>
                    <p className="mt-2 text-center text-gray-500">
                        Insira as credenciais do seu registro de aplicativo.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm font-medium rounded-r-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ID do Aplicativo (Client ID)</label>
                            <input
                                type="text"
                                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-sm font-mono"
                                placeholder="Copia do painel 'Overview' do Azure"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ID do Diretório (Tenant ID)</label>
                            <input
                                type="text"
                                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-sm font-mono"
                                placeholder="ID do seu locatário ou 'common'"
                                value={tenantId}
                                onChange={(e) => setTenantId(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 space-y-3">
                        <h4 className="text-sm font-black text-amber-800 flex items-center">
                            <ShieldErrorIcon className="w-5 h-5 mr-2" /> ATENÇÃO PARA EVITAR ERROS:
                        </h4>
                        <ol className="text-xs text-amber-800 space-y-2 list-decimal list-inside leading-relaxed">
                            <li>No Azure, em <strong>Autenticação</strong>, clique em <strong>"Adicionar uma plataforma"</strong> e escolha <strong>SPA (Aplicativo de página única)</strong>.</li>
                            <li><strong>IMPORTANTE:</strong> Se houver uma seção chamada <strong>"Web"</strong>, você deve <strong>EXCLUÍ-LA</strong>. Ter as duas configuradas com a mesma URL causa erro de autenticação.</li>
                            <li>Use esta URL de redirecionamento: <code className="bg-white px-1 font-bold rounded select-all">{window.location.origin}</code></li>
                        </ol>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-accent transition-all shadow-lg active:scale-95"
                    >
                        Salvar e Conectar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConfigurationScreen;