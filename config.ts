
import { Configuration } from "@azure/msal-browser";

export const msalConfigTemplate: Omit<Configuration, 'auth'> & { auth: Omit<Configuration['auth'], 'clientId' | 'authority'> } = {
  auth: {
    // A autoridade agora será montada dinamicamente: https://login.microsoftonline.com/{tenantId}
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "Sites.Read.All", "Sites.Manage.All", "Group.Read.All"]
};
