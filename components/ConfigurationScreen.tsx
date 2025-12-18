
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
        <div className="flex items-center justify-center min-h-screen bg-app p-4">
            <div className="w-full max-w-3xl p-10 space-y-8 bg-card rounded-3xl shadow-2xl border border-slate-700">
                <div className="flex flex-col items-center">
                    <LogoIcon className="w-20 h-20 text-primary mb-4" />
                    <h1 className="text-4xl font-black text-center text-slate-100 leading-tight tracking-tight">
                        Zim 365 Manager
                    </h1>
                    <h2 className="mt-2 text-xl font-bold text-primary">
                        Configuração Azure
                    </h2>
                    <p className="mt-3 text-center text-slate-400 text-sm">
                        Insira as credenciais do seu registro de aplicativo.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border-l-4 border-red-500 p-4 text-red-400 text-sm font-medium rounded-r-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wide">ID do Aplicativo (Client ID)</label>
                            <input
                                type="text"
                                className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:bg-slate-800 transition-all outline-none text-sm font-mono text-slate-200"
                                placeholder="Copia do painel 'Overview' do Azure"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wide">ID do Diretório (Tenant ID)</label>
                            <input
                                type="text"
                                className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:bg-slate-800 transition-all outline-none text-sm font-mono text-slate-200"
                                placeholder="ID do seu locatário ou 'common'"
                                value={tenantId}
                                onChange={(e) => setTenantId(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-amber-900/20 p-6 rounded-xl border border-amber-700/50 space-y-4">
                        <h4 className="text-sm font-black text-amber-400 flex items-center">
                            <ShieldErrorIcon className="w-5 h-5 mr-2" /> ATENÇÃO PARA EVITAR ERROS:
                        </h4>
                        <ol className="text-xs text-amber-300/90 space-y-2 list-decimal list-inside leading-relaxed">
                            <li>No Azure, em <strong>Autenticação</strong>, clique em <strong>"Adicionar uma plataforma"</strong> e escolha <strong>SPA (Aplicativo de página única)</strong>.</li>
                            <li><strong>IMPORTANTE:</strong> Se houver uma seção chamada <strong>"Web"</strong>, você deve <strong>EXCLUÍ-LA</strong>. Ter as duas configuradas com a mesma URL causa erro de autenticação.</li>
                            <li>Use esta URL de redirecionamento: <code className="bg-slate-800 px-2 py-0.5 font-bold rounded select-all text-primary">{window.location.origin}</code></li>
                        </ol>
                    </div>

                    <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-700/50 space-y-4">
                        <h4 className="text-sm font-black text-blue-400 flex items-center">
                            <ShieldErrorIcon className="w-5 h-5 mr-2" /> PERMISSÕES DE API NECESSÁRIAS:
                        </h4>
                        <p className="text-xs text-blue-300/90 leading-relaxed">
                            No Azure, vá em <strong>Permissões de API</strong> → <strong>Adicionar uma permissão</strong> → <strong>Microsoft Graph</strong> → <strong>Permissões delegadas</strong> e adicione:
                        </p>
                        <ul className="text-xs text-blue-300/90 space-y-1.5 list-disc list-inside leading-relaxed ml-3">
                            <li><strong>Sites.FullControl.All</strong> - Controle total de sites</li>
                            <li><strong>Group.Read.All</strong> - Ler grupos</li>
                            <li><strong>Group.ReadWrite.All</strong> - Ler e escrever grupos</li>
                            <li><strong>GroupMember.Read.All</strong> - Ler membros de grupos</li>
                            <li><strong>GroupMember.ReadWrite.All</strong> - Gerenciar membros de grupos</li>
                            <li><strong>User.Read</strong> - Ler perfil do usuário</li>
                            <li><strong>Directory.Read.All</strong> - Ler dados do diretório</li>
                        </ul>
                        <p className="text-xs text-blue-400 font-bold mt-3">
                            ⚠️ Após adicionar as permissões, clique em <strong>"Conceder consentimento do administrador"</strong>.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition-all shadow-lg hover:shadow-primary/50 active:scale-95"
                    >
                        Salvar e Conectar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConfigurationScreen;