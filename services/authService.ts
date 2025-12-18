
import { PublicClientApplication, AccountInfo, AuthenticationResult, InteractionRequiredAuthError, Configuration } from "@azure/msal-browser";
import { msalConfigTemplate, loginRequest } from "../config";

let msalInstance: PublicClientApplication | null = null;
let msalInitializedPromise: Promise<void> | null = null;

export const initializeMsal = (clientId: string, tenantId: string): Promise<void> => {
  const fullMsalConfig: Configuration = {
    ...msalConfigTemplate,
    auth: {
      ...msalConfigTemplate.auth,
      clientId: clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      navigateToLoginRequestUrl: true
    },
  };
  
  msalInstance = new PublicClientApplication(fullMsalConfig);
  msalInitializedPromise = msalInstance.initialize();
  return msalInitializedPromise;
};

export const getMsalInstance = (): PublicClientApplication | null => {
  return msalInstance;
};

export const handleRedirect = async (): Promise<AuthenticationResult | null> => {
    if (!msalInstance) return null;
    await msalInitializedPromise;
    try {
        const result = await msalInstance.handleRedirectPromise();
        if (result) {
            msalInstance.setActiveAccount(result.account);
        }
        return result;
    } catch (error) {
        console.error("Erro no processamento do redirect:", error);
        throw error;
    }
}

export const login = async (): Promise<void> => {
  if (!msalInstance) return;
  await msalInitializedPromise;
  // Usando redirect em vez de popup para evitar bloqueios de segurança do browser
  return msalInstance.loginRedirect(loginRequest);
};

export const logout = async (): Promise<void> => {
  if (!msalInstance) return;
  await msalInitializedPromise;
  const account = getAccount();
  if (account) {
    await msalInstance.logoutRedirect({ account });
  }
};

export const getAccount = (): AccountInfo | null => {
  return msalInstance ? msalInstance.getActiveAccount() : null;
};

export const acquireToken = async (): Promise<string> => {
  if (!msalInstance) throw new Error("MSAL não inicializado");
  await msalInitializedPromise;
  const account = getAccount();
  if (!account) throw new Error("Usuário não logado.");

  const request = { ...loginRequest, account };

  try {
    const response = await msalInstance.acquireTokenSilent(request);
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // Se falhar o silencioso, redireciona para login novamente
      await msalInstance.acquireTokenRedirect(request);
      return ""; // O app irá recarregar
    }
    throw error;
  }
};
