
import { Site, Drive, DriveItem, Group, PermissionRole, User, InvitePayload, Permission } from '../types';
import * as AuthService from './authService';

const GRAPH_API_BASE_URL = 'https://graph.microsoft.com/v1.0';

interface GraphCollectionResponse<T> {
    value: T[];
}

async function graphFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await AuthService.acquireToken();
    const headers = new Headers(options.headers || {});
    headers.append('Authorization', `Bearer ${token}`);
    headers.append('Content-Type', 'application/json');

    const response = await fetch(`${GRAPH_API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Microsoft Graph API request failed');
    }
    
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export const getSites = async (): Promise<Site[]> => {
    const response = await graphFetch<GraphCollectionResponse<Site>>('/sites?search=*');
    return response.value;
};

export const getDrives = async (siteId: string): Promise<Drive[]> => {
    const response = await graphFetch<GraphCollectionResponse<Drive>>(`/sites/${siteId}/drives`);
    return response.value;
};

export const getFolders = async (siteId: string, driveId: string, folderId?: string): Promise<DriveItem[]> => {
    const endpoint = folderId 
        ? `/sites/${siteId}/drives/${driveId}/items/${folderId}/children`
        : `/sites/${siteId}/drives/${driveId}/root/children`;
    
    const response = await graphFetch<GraphCollectionResponse<DriveItem>>(endpoint);
    return response.value.filter(item => item.folder && item.name !== 'Forms');
};

export const getFolderPermissions = async (siteId: string, driveId: string, folderId: string): Promise<Permission[]> => {
    const response = await graphFetch<GraphCollectionResponse<Permission>>(`/sites/${siteId}/drives/${driveId}/items/${folderId}/permissions`);
    return response.value;
};

export const getPermissionGroups = async (): Promise<Group[]> => {
    const response = await graphFetch<GraphCollectionResponse<Group>>("/groups?$filter=startswith(displayName,'_GS_')&$select=id,displayName,description");
    return response.value;
};

export const getGroupMembers = async (groupId: string): Promise<User[]> => {
    try {
        const response = await graphFetch<GraphCollectionResponse<User>>(`/groups/${groupId}/members`);
        return response.value;
    } catch (e) {
        console.error("Erro ao buscar membros:", e);
        return [];
    }
};

export const getUserGroups = async (userId: string): Promise<Group[]> => {
    const response = await graphFetch<GraphCollectionResponse<any>>(`/users/${userId}/memberOf`);
    // Filtramos apenas por grupos (ignorando roles de diretório)
    return response.value
        .filter(item => item['@odata.type'] === '#microsoft.graph.group')
        .map(g => ({
            id: g.id,
            displayName: g.displayName,
            description: g.description
        }));
};

export const applyMultiplePermissions = async (
    siteId: string, 
    driveId: string, 
    folderId: string, 
    selections: Array<{groupId: string, role: PermissionRole}>
): Promise<void> => {
    // 1. Quebra herança explicitamente
    try {
        await graphFetch(`/sites/${siteId}/drives/${driveId}/items/${folderId}/inheritPermissions`, { method: 'POST' });
        await graphFetch(`/sites/${siteId}/drives/${driveId}/items/${folderId}/inheritPermissions`, { method: 'DELETE' });
    } catch(e) {}

    // 2. Remove grupos padrão (Membros/Visitantes) para evitar conflitos de privilégio
    const currentPermissions = await graphFetch<GraphCollectionResponse<any>>(`/sites/${siteId}/drives/${driveId}/items/${folderId}/permissions`);
    for (const perm of currentPermissions.value) {
        const displayName = perm.grantedToV2?.siteGroup?.displayName || "";
        if (displayName.toLowerCase().includes("visitors") || displayName.toLowerCase().includes("members")) {
            try { await graphFetch(`/sites/${siteId}/drives/${driveId}/items/${folderId}/permissions/${perm.id}`, { method: 'DELETE' }); } catch (e) {}
        }
    }

    // 3. Aplica novas permissões GS
    for (const selection of selections) {
        const payload: InvitePayload = {
            requireSignIn: true,
            sendInvitation: false,
            roles: [selection.role === PermissionRole.WRITE ? 'write' : 'read'],
            recipients: [{ objectId: selection.groupId }]
        };
        await graphFetch(`/sites/${siteId}/drives/${driveId}/items/${folderId}/invite`, { method: 'POST', body: JSON.stringify(payload) });
    }
};

export const addMemberToGroup = async (groupId: string, userId: string): Promise<void> => {
    await graphFetch(`/groups/${groupId}/members/$ref`, {
        method: 'POST',
        body: JSON.stringify({ "@odata.id": `https://graph.microsoft.com/v1.0/users/${userId}` })
    });
};

export const removeMemberFromGroup = async (groupId: string, userId: string): Promise<void> => {
    await graphFetch(`/groups/${groupId}/members/${userId}/$ref`, { method: 'DELETE' });
};

export const searchUsers = async (query: string): Promise<User[]> => {
    if (!query || query.length < 3) return [];
    const response = await graphFetch<GraphCollectionResponse<User>>(`/users?$filter=startswith(displayName,'${query}') or startswith(userPrincipalName,'${query}') or startswith(mail,'${query}')&$top=8`);
    return response.value;
};
