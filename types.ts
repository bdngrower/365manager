
// Representa um site do SharePoint
export interface Site {
    id: string;
    name: string;
    webUrl: string;
    displayName: string;
}
  
// Representa uma Document Library (Drive) no SharePoint
export interface Drive {
    id: string;
    name: string;
    description: string;
}

// Representa um item em um Drive (ex: pasta)
export interface DriveItem {
    id: string;
    name: string;
    webUrl: string;
    folder: {}; 
    parentReference?: {
        id: string;
        path: string;
    };
}

// Representa um usuário do Entra ID
export interface User {
    id: string;
    displayName: string;
    userPrincipalName: string;
    mail?: string;
}

// Representa um grupo do Entra ID
export interface Group {
    id: string;
    displayName: string;
    description: string | null;
}

// Representa os papéis de permissão
export enum PermissionRole {
    READ = 'read',
    WRITE = 'write',
}

export interface InvitePayload {
    requireSignIn: boolean;
    sendInvitation: boolean;
    roles: string[];
    recipients: Array<{
        objectId: string;
    }>;
}

export interface Permission {
    id: string;
    roles: string[];
    grantedToV2: {
        group?: { id: string; displayName: string; };
        siteGroup?: { displayName: string; };
    };
}
