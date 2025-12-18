
import { GoogleGenAI } from "@google/genai";
import { Site, DriveItem, Group, PermissionRole } from '../types';

export const generateActionSummary = async (
    site: Site,
    folder: DriveItem,
    group: Group,
    role: PermissionRole
): Promise<string> => {
    // Guideline: Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
        Aja como um assistente de segurança do SharePoint.
        Explique de forma concisa e amigável o impacto da seguinte ação de permissão:
        
        - Site: ${site.displayName}
        - Pasta: ${folder.name}
        - Grupo Alvo: ${group.displayName}
        - Nível de Acesso: ${role === 'write' ? 'Escrita e Modificação (RW)' : 'Apenas Leitura (R)'}
        
        Sua explicação deve:
        1. Mencionar que a herança de permissões da pasta será interrompida para garantir a exclusividade do grupo.
        2. Confirmar que o grupo ${group.displayName} terá acesso ${role === 'write' ? 'de edição' : 'apenas de visualização'}.
        3. Ser muito breve (máximo 3 frases).
        4. Usar um tom profissional em português.
    `;

    try {
        // Guideline: Use ai.models.generateContent to query GenAI with model and prompt directly.
        // Guideline: gemini pro is 'gemini-3-pro-preview'
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
        });
        
        // Guideline: Access text property directly (not a method).
        return response.text || "Pronto para aplicar as alterações de segurança.";
    } catch (error) {
        console.error("Erro ao chamar Gemini:", error);
        throw error;
    }
};
