
import React, { useState } from 'react';
import { ShieldErrorIcon, CopyIcon, CheckIcon } from './Icons';
import * as AuthService from '../services/authService';

const CodeBlock: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-800 text-white rounded-md p-3 my-2 flex justify-between items-center font-mono text-sm">
            <code>{text}</code>
            <button onClick={handleCopy} className="text-gray-400 hover:text-white">
                {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
            </button>
        </div>
    );
};


const PermissionsError: React.FC = () => {
  const msalInstance = AuthService.getMsalInstance();
  const clientId = msalInstance?.config.auth.clientId || "Client ID não disponível"; // Obtém o Client ID da instância MSAL inicializada

  return (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-900 p-6 rounded-r-lg shadow-md">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ShieldErrorIcon className="h-8 w-8 text-red-500" />
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-bold">Permissões de API Necessárias</h3>
          <p className="mt-1 text-md">
            Esta aplicação não possui as permissões necessárias para acessar recursos do SharePoint e Entra ID. 
            Um administrador deve conceder consentimento para as seguintes permissões no Registro de Aplicativo do Azure.
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="font-semibold text-lg">Como corrigir isso:</h4>
        <ol className="list-decimal list-inside space-y-4 mt-2 text-sm text-gray-800">
            <li>
                <strong>Navegue até o Portal do Azure:</strong>
                <p>Vá para <a href="https://portal.azure.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">portal.azure.com</a> e entre como administrador.</p>
            </li>
            <li>
                <strong>Encontre seu Registro de Aplicativo:</strong>
                <p>Vá para <strong>Microsoft Entra ID</strong> &gt; <strong>Registros de aplicativo</strong> e encontre o aplicativo com este Client ID:</p>
                <CodeBlock text={clientId} />
            </li>
            <li>
                <strong>Adicione Permissões de API:</strong>
                <p>No registro do seu aplicativo, vá para a seção <strong>Permissões de API</strong>. Clique em <strong>+ Adicionar uma permissão</strong> e selecione <strong>Microsoft Graph</strong> &gt; <strong>Permissões delegadas</strong>. Adicione as seguintes permissões:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li><CodeBlock text="Group.Read.All" /></li>
                    <li><CodeBlock text="Sites.Manage.All" /></li>
                    <li><CodeBlock text="Sites.Read.All" /></li>
                    <li><CodeBlock text="User.Read" /></li>
                </ul>
            </li>
             <li>
                <strong>Conceda Consentimento do Administrador:</strong>
                <p>Após adicionar as permissões, clique no botão <strong>Conceder consentimento de administrador para [Seu Tenant]</strong>. O status de todas as permissões deve mostrar um sinal verde de verificação.</p>
            </li>
            <li>
                <strong>Recarregue a Aplicação:</strong>
                <p>Uma vez concedido o consentimento, recarregue esta página.</p>
                <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-accent">
                    Recarregar Aplicação
                </button>
            </li>
        </ol>
      </div>
    </div>
  );
};

export default PermissionsError;