
import React, { useState, useEffect } from 'react';
import { Site, Drive, DriveItem, Group, PermissionRole, User, Permission } from '../types';
import * as GraphService from '../services/graphService';
import { SiteIcon, FolderIcon, GroupIcon, LoadingIcon, SuccessIcon, SparklesIcon, CheckIcon, ShieldErrorIcon, DocumentIcon, LogoIcon } from './Icons';

type Tab = 'dashboard' | 'single' | 'bulk' | 'groups' | 'clone' | 'reports';

const PermissionManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [groups, setGroups] = useState<Group[]>([]);

    useEffect(() => {
        GraphService.getPermissionGroups().then(setGroups);
    }, []);

    const tabs = [
        { id: 'dashboard', label: 'HOME', icon: '🏠' },
        { id: 'single', label: 'ÚNICO', icon: '📁' },
        { id: 'bulk', label: 'MASSA', icon: '📚' },
        { id: 'groups', label: 'MEMBROS', icon: '👥' },
        { id: 'clone', label: 'CLONAR', icon: '👤' },
        { id: 'reports', label: 'RELATÓRIOS', icon: '📝' },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <nav className="flex space-x-1 bg-slate-800/40 p-1.5 rounded-2xl max-w-fit mx-auto border border-slate-700/50 shadow-2xl no-print">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`py-2 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(0,120,212,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>

            <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] shadow-2xl p-6 border border-gray-100 dark:border-slate-800 min-h-[600px] transition-all relative overflow-hidden backdrop-blur-sm print:bg-transparent print:shadow-none print:p-0">
                <div className="relative z-10">
                    {activeTab === 'dashboard' && <Dashboard groups={groups} />}
                    {activeTab === 'single' && <SingleApplier groups={groups} />}
                    {activeTab === 'bulk' && <BulkApplier groups={groups} />}
                    {activeTab === 'groups' && <GroupMemberManager groups={groups} />}
                    {activeTab === 'clone' && <UserCloner />}
                    {activeTab === 'reports' && <SecurityReports />}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTES AUXILIARES ---

const RoleBadge = ({ role, isPrint = false }: { role: string, isPrint?: boolean }) => {
    const isEdit = role.toLowerCase().includes('write') || role.toLowerCase().includes('edit');
    if (isPrint) {
        return <span className="role-badge-print uppercase">{isEdit ? 'EDITAR' : 'LEITURA'}</span>;
    }
    return (
        <span className={`text-[9px] font-black px-2.5 py-1 rounded-md border uppercase tracking-tighter ${isEdit ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-slate-500/10 border-slate-500/30 text-slate-400'}`}>
            {isEdit ? 'EDITAR' : 'LEITURA'}
        </span>
    );
};

// --- ABA RELATÓRIOS (CORREÇÃO PARA PDF PROFISSIONAL) ---
const SecurityReports = () => {
    const [site, setSite] = useState<Site | null>(null);
    const [drive, setDrive] = useState<Drive | null>(null);
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const exportToPDF = () => {
        if (!site || !drive || reportData.length === 0) return;

        const currentDate = new Date().toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Auditoria - ${site.displayName}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #f1f5f9;
            padding: 40px 20px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(30, 41, 59, 0.6);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
            padding: 40px;
            border-bottom: 3px solid #0078d4;
        }
        
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
        }
        
        .title-section h1 {
            font-size: 32px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            color: white;
        }
        
        .title-section p {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .date-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 12px 20px;
            border-radius: 12px;
            text-align: right;
            backdrop-filter: blur(10px);
        }
        
        .date-badge .label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.8;
            margin-bottom: 4px;
        }
        
        .date-badge .value {
            font-size: 14px;
            font-weight: 700;
        }
        
        .metadata {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            background: rgba(0, 0, 0, 0.2);
            padding: 20px;
            border-radius: 12px;
        }
        
        .metadata-item {
            display: flex;
            flex-direction: column;
        }
        
        .metadata-item .label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.7;
            margin-bottom: 4px;
        }
        
        .metadata-item .value {
            font-size: 16px;
            font-weight: 700;
        }
        
        .content {
            padding: 40px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 24px;
            color: #0078d4;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .section-title::before {
            content: '';
            width: 4px;
            height: 24px;
            background: #0078d4;
            border-radius: 2px;
        }
        
        .folder-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            transition: transform 0.2s;
        }
        
        .folder-card:hover {
            transform: translateY(-2px);
            border-color: rgba(0, 120, 212, 0.5);
        }
        
        .folder-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid rgba(100, 116, 139, 0.3);
        }
        
        .folder-icon {
            font-size: 24px;
        }
        
        .folder-path {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            font-weight: 700;
        }
        
        .folder-name {
            font-size: 20px;
            font-weight: 900;
            color: #0078d4;
            text-transform: uppercase;
        }
        
        .group-card {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
        }
        
        .group-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(100, 116, 139, 0.3);
        }
        
        .group-name {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .group-icon {
            font-size: 18px;
        }
        
        .role-badge {
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .role-badge.write {
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.4);
        }
        
        .role-badge.read {
            background: rgba(100, 116, 139, 0.2);
            color: #94a3b8;
            border: 1px solid rgba(100, 116, 139, 0.4);
        }
        
        .members-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .member-tag {
            background: rgba(241, 245, 249, 0.1);
            color: #e2e8f0;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
            border: 1px solid rgba(241, 245, 249, 0.2);
        }
        
        .footer {
            background: rgba(15, 23, 42, 0.8);
            padding: 24px 40px;
            text-align: center;
            border-top: 2px solid rgba(100, 116, 139, 0.3);
        }
        
        .footer-text {
            font-size: 11px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 700;
        }
        
        .stats-bar {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 32px;
        }
        
        .stat-card {
            background: rgba(0, 120, 212, 0.1);
            border: 1px solid rgba(0, 120, 212, 0.3);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 28px;
            font-weight: 900;
            color: #0078d4;
            margin-bottom: 4px;
        }
        
        .stat-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            font-weight: 700;
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(0, 120, 212, 0.4);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s;
        }
        
        .print-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(0, 120, 212, 0.5);
        }
        
        .print-button:active {
            transform: translateY(0);
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .folder-card:hover {
                transform: none;
            }
            
            .print-button {
                display: none !important;
            }
        }
    </style>
    <script>
        function generatePDF() {
            const button = document.querySelector('.print-button');
            const originalText = button.innerHTML;
            button.innerHTML = '⏳ Gerando PDF...';
            button.disabled = true;
            
            const element = document.querySelector('.container');
            const opt = {
                margin: [10, 10, 10, 10],
                filename: 'Relatorio_Auditoria_${site.displayName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#0f172a'
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                }
            };
            
            html2pdf().set(opt).from(element).save().then(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }).catch((error) => {
                console.error('Erro ao gerar PDF:', error);
                button.innerHTML = '❌ Erro - Tente novamente';
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 2000);
            });
        }
    </script>
</head>
<body>
    <button class="print-button" onclick="generatePDF()">
        📄 Salvar como PDF
    </button>
    <div class="container">
        <div class="header">
            <div class="header-top">
                <div class="logo-section">
                    <div class="logo">🛡️</div>
                    <div class="title-section">
                        <h1>Relatório de Auditoria</h1>
                        <p>Governança de Grupos e Membros</p>
                    </div>
                </div>
                <div class="date-badge">
                    <div class="label">Data de Geração</div>
                    <div class="value">${currentDate}</div>
                </div>
            </div>
            <div class="metadata">
                <div class="metadata-item">
                    <div class="label">Site SharePoint</div>
                    <div class="value">${site.displayName}</div>
                </div>
                <div class="metadata-item">
                    <div class="label">Biblioteca</div>
                    <div class="value">${drive.name}</div>
                </div>
                <div class="metadata-item">
                    <div class="label">Status</div>
                    <div class="value">✓ Completo</div>
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="stats-bar">
                <div class="stat-card">
                    <div class="stat-value">${reportData.length}</div>
                    <div class="stat-label">Pastas Auditadas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${reportData.reduce((sum, item) => sum + item.groups.length, 0)}</div>
                    <div class="stat-label">Grupos Configurados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${reportData.reduce((sum, item) => sum + item.groups.reduce((gSum: number, g: any) => gSum + g.members.length, 0), 0)}</div>
                    <div class="stat-label">Total de Membros</div>
                </div>
            </div>
            
            <div class="section-title">
                📂 Estrutura de Permissões
            </div>
            
            ${reportData.map(item => `
                <div class="folder-card">
                    <div class="folder-header">
                        <div>
                            <div class="folder-path">${item.parent}</div>
                            <div class="folder-name">📁 ${item.folder}</div>
                        </div>
                    </div>
                    
                    ${item.groups.map((group: any) => {
                        const isWrite = group.role.toLowerCase().includes('write') || group.role.toLowerCase().includes('edit');
                        return `
                        <div class="group-card">
                            <div class="group-header">
                                <div class="group-name">
                                    <span class="group-icon">👥</span>
                                    ${group.name}
                                </div>
                                <div class="role-badge ${isWrite ? 'write' : 'read'}">
                                    ${isWrite ? 'EDITAR' : 'LEITURA'}
                                </div>
                            </div>
                            <div class="members-container">
                                ${group.members.map((member: any) => `
                                    <span class="member-tag">${member.displayName}</span>
                                `).join('')}
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p class="footer-text">
                🔒 Documento Confidencial - Este relatório contém informações sensíveis sobre a estrutura de segurança do SharePoint.<br>
                Gerado por Governance Pro v3 - SharePoint Security Center
            </p>
        </div>
    </div>
</body>
</html>
        `;

        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.close();
        }
    };

    const generateReport = async () => {
        if (!site || !drive) return;
        setLoading(true);
        setReportData([]);
        setStatus('Escaneando diretórios General / Compartilha...');
        
        try {
            const rootFolders = await GraphService.getFolders(site.id, drive.id);
            const generalFolder = rootFolders.find(f => f.name.toLowerCase() === 'general');

            if (!generalFolder) {
                setStatus('Estrutura "General" não encontrada.');
                setLoading(false);
                return;
            }

            const foldersToAudit: Array<{item: DriveItem, path: string}> = [];
            const generalSubFolders = await GraphService.getFolders(site.id, drive.id, generalFolder.id);
            
            for (const f of generalSubFolders) {
                if (f.name.toLowerCase() === 'compartilha') {
                    const compartilhaSubFolders = await GraphService.getFolders(site.id, drive.id, f.id);
                    for (const cf of compartilhaSubFolders) {
                        foldersToAudit.push({ item: cf, path: 'General / Compartilha' });
                    }
                } else {
                    foldersToAudit.push({ item: f, path: 'General' });
                }
            }

            const results = [];
            for (const entry of foldersToAudit) {
                setStatus(`Auditoria: ${entry.item.name}...`);
                const perms = await GraphService.getFolderPermissions(site.id, drive.id, entry.item.id);
                const gsGroups = perms.filter(p => (p.grantedToV2?.group?.displayName || p.grantedToV2?.siteGroup?.displayName)?.startsWith('_GS_'));
                
                const groupsWithMembers = [];
                for (const p of gsGroups) {
                    const gid = p.grantedToV2?.group?.id;
                    if (gid) {
                        const members = await GraphService.getGroupMembers(gid);
                        if (members && members.length > 0) {
                            groupsWithMembers.push({ 
                                name: p.grantedToV2?.group?.displayName || p.grantedToV2?.siteGroup?.displayName,
                                role: p.roles[0],
                                members 
                            });
                        }
                    }
                }

                if (groupsWithMembers.length > 0) {
                    results.push({ 
                        parent: entry.path,
                        folder: entry.item.name, 
                        groups: groupsWithMembers 
                    });
                }
            }
            setReportData(results);
            setStatus(results.length > 0 ? '' : 'Sem dados de permissões ativos.');
        } catch (e) {
            setStatus('Erro na geração. Verifique os logs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-slide-up space-y-6">
            {/* Header de Ações - Oculto no Print */}
            <div className="no-print bg-slate-800/30 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Configurações do Relatório de Auditoria</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select onChange={(e) => setSite(e.target.value ? JSON.parse(e.target.value) : null)} className="w-full bg-slate-900 border-none rounded-xl p-3 text-xs font-bold text-slate-200 outline-none focus:ring-1 focus:ring-primary">
                            <option value="">Selecione o Site...</option>
                            <SitesOptions />
                        </select>
                        {site && (
                            <select onChange={(e) => setDrive(e.target.value ? JSON.parse(e.target.value) : null)} className="w-full bg-slate-900 border-none rounded-xl p-3 text-xs font-bold text-slate-200 outline-none focus:ring-1 focus:ring-primary">
                                <option value="">Selecione a Biblioteca...</option>
                                <DrivesOptions siteId={site.id} />
                            </select>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={generateReport} disabled={!drive || loading} className="flex-1 md:flex-none px-8 py-4 bg-primary text-white rounded-2xl text-[11px] font-black shadow-xl disabled:opacity-30 active:scale-95 transition-all uppercase tracking-widest">
                        {loading ? <LoadingIcon className="w-4 h-4" /> : 'GERAR AUDITORIA'}
                    </button>
                    {reportData.length > 0 && (
                        <button onClick={exportToPDF} className="px-6 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black shadow-xl active:scale-95 transition-all flex items-center gap-2">
                             <DocumentIcon className="w-4 h-4" /> EXPORTAR PDF
                        </button>
                    )}
                </div>
            </div>

            {status && <p className="text-center text-xs font-bold text-slate-500 animate-pulse no-print uppercase tracking-tighter">{status}</p>}

            {/* CONTEÚDO DO RELATÓRIO - DESIGN PROFISSIONAL PARA PDF */}
            <div id="report-content" className="space-y-4 print:block">
                
                {/* Cabeçalho Formal (Apenas no Impresso) */}
                <div className="hidden print:print-header">
                    <div>
                        <h1 className="text-black uppercase">Relatório de Auditoria de Acessos</h1>
                        <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">Confidencial - Segurança da Informação</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-black">Site: {site?.displayName}</p>
                        <p className="text-[10px] font-black text-black">Biblioteca: {drive?.name}</p>
                        <p className="text-[9px] text-gray-500 mt-1 uppercase font-bold">Gerado em: {new Date().toLocaleString()}</p>
                    </div>
                </div>

                {reportData.length > 0 && (
                    <div className="space-y-4">
                        {reportData.map((item, idx) => (
                            <div key={idx} className="bg-slate-800/20 p-5 rounded-3xl border border-slate-800/40 print:report-item-card">
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800 print:border-black">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-black text-slate-500 uppercase print:text-black">{item.parent} /</span>
                                        <h4 className="font-black text-sm text-primary uppercase print:text-black tracking-tight">{item.folder}</h4>
                                    </div>
                                    <FolderIcon className="w-4 h-4 text-yellow-500 no-print" />
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    {item.groups.map((g: any, gIdx: number) => (
                                        <div key={gIdx} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 print:report-group-box">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <GroupIcon className="w-3.5 h-3.5 text-indigo-400 print:text-black" />
                                                    <span className="text-xs font-black text-slate-200 print:text-black uppercase tracking-tight">{g.name}</span>
                                                </div>
                                                {/* Usamos o Badge de Impressão (mais formal) */}
                                                <RoleBadge role={g.role} isPrint={true} />
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800 print:border-gray-400">
                                                {g.members.map((m: any, mIdx: number) => (
                                                    <span key={mIdx} className="text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-400 font-bold print:bg-white print:border-black print:text-black">
                                                        {m.displayName}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Rodapé do Documento (Apenas no Impresso) */}
                <div className="hidden print:block mt-10 pt-4 border-t border-black">
                   <p className="text-[8px] text-gray-500 text-center uppercase font-black">Este documento contém informações sensíveis e deve ser tratado de acordo com as políticas de governança.</p>
                </div>
            </div>
        </div>
    );
};

// --- GESTÃO DE MEMBROS ---
const GroupMemberManager = ({ groups }: { groups: Group[] }) => {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<User[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (selectedGroup) {
            setLoadingMembers(true);
            GraphService.getGroupMembers(selectedGroup.id).then(res => {
                setMembers(res);
                setLoadingMembers(false);
            });
        }
    }, [selectedGroup]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 3) {
                setIsSearching(true);
                const res = await GraphService.searchUsers(searchQuery);
                setSearchResults(res);
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleAddMember = async (user: User) => {
        if (!selectedGroup) return;
        try {
            await GraphService.addMemberToGroup(selectedGroup.id, user.id);
            setMembers([...members, user]);
            setSearchQuery('');
            setSearchResults([]);
        } catch (e) {
            alert("Erro ao adicionar membro.");
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!selectedGroup) return;
        if (!confirm("Remover este usuário do grupo?")) return;
        try {
            await GraphService.removeMemberFromGroup(selectedGroup.id, userId);
            setMembers(members.filter(m => m.id !== userId));
        } catch (e) {
            alert("Erro ao remover membro.");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-slide-up">
            <div className="md:col-span-4 space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Grupos de Governança</h3>
                <div className="bg-slate-800/30 rounded-[2rem] border border-slate-800 overflow-hidden h-[500px] overflow-y-auto custom-scrollbar">
                    {groups.map(g => (
                        <button key={g.id} onClick={() => setSelectedGroup(g)} className={`w-full text-left p-4 border-b border-slate-800 flex items-center gap-3 transition-all ${selectedGroup?.id === g.id ? 'bg-primary/20 border-l-4 border-l-primary' : 'hover:bg-slate-800/40'}`}>
                            <GroupIcon className={`w-4 h-4 ${selectedGroup?.id === g.id ? 'text-primary' : 'text-slate-500'}`} />
                            <span className={`text-xs font-bold ${selectedGroup?.id === g.id ? 'text-primary' : 'text-slate-300'}`}>{g.displayName}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="md:col-span-8 space-y-6">
                {selectedGroup ? (
                    <>
                        <div className="bg-slate-800/20 p-6 rounded-[2.5rem] border border-slate-800">
                            <h2 className="text-xl font-black mb-4 flex items-center gap-3"><GroupIcon className="w-6 h-6 text-primary" /> {selectedGroup.displayName}</h2>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="🔍 Buscar usuário para adicionar..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchResults.length > 0 && (
                                    <div className="absolute z-20 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                                        {searchResults.map(user => (
                                            <button key={user.id} onClick={() => handleAddMember(user)} className="w-full text-left p-3 hover:bg-slate-700 border-b border-slate-700 last:border-0 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-white">{user.displayName}</span>
                                                    <span className="text-[10px] text-slate-400">{user.userPrincipalName}</span>
                                                </div>
                                                <CheckIcon className="w-4 h-4 text-emerald-500" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {isSearching && <div className="absolute right-3 top-3"><LoadingIcon className="w-4 h-4 text-primary" /></div>}
                            </div>
                        </div>

                        <div className="bg-slate-800/20 rounded-[2.5rem] border border-slate-800 overflow-hidden">
                            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Membros Atuais ({members.length})</span>
                            </div>
                            <div className="h-[300px] overflow-y-auto custom-scrollbar">
                                {loadingMembers ? (
                                    <div className="flex items-center justify-center h-full"><LoadingIcon className="w-8 h-8 text-primary" /></div>
                                ) : members.map(m => (
                                    <div key={m.id} className="p-4 border-b border-slate-800 flex items-center justify-between group hover:bg-slate-800/40">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black uppercase text-slate-400">
                                                {m.displayName.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-200">{m.displayName}</span>
                                                <span className="text-[10px] text-slate-500">{m.userPrincipalName}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveMember(m.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                                            <ShieldErrorIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-slate-800/10 h-full flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-800 text-slate-500">
                        <GroupIcon className="w-16 h-16 mb-4 opacity-10" />
                        <p className="text-sm font-bold uppercase tracking-widest">Selecione um grupo para gerenciar</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- FOLDER BROWSER ---
const FolderBrowser = ({ siteId, driveId, onSelect, selectedId }: any) => {
    const [folders, setFolders] = useState<DriveItem[]>([]);
    const [path, setPath] = useState<DriveItem[]>([]);
    const [loading, setLoading] = useState(false);

    const load = async (fid?: string) => {
        setLoading(true);
        try {
            const res = await GraphService.getFolders(siteId, driveId, fid);
            setFolders(res);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const jumpToGeneral = () => {
        const general = folders.find(f => f.name.toLowerCase() === 'general');
        if (general) { setPath([general]); load(general.id); }
    };

    const navigateTo = (f: DriveItem) => {
        setPath([...path, f]);
        load(f.id);
    };

    return (
        <div className="bg-slate-800/30 rounded-[2.5rem] border border-slate-800 overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[150px]">
                    {path.length > 0 ? path.map(p => p.name).join(' / ') : 'Raiz'}
                </span>
                <div className="flex gap-2">
                    <button onClick={jumpToGeneral} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[9px] font-black">GENERAL</button>
                    {path.length > 0 && <button onClick={() => { setPath([]); load(); }} className="text-slate-400 hover:text-white px-2">✕</button>}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {loading && <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10"><LoadingIcon className="w-8 h-8 text-primary" /></div>}
                {folders.map(f => (
                    <div key={f.id} 
                        className={`flex items-center justify-between p-4 border-b border-slate-800 transition-all cursor-pointer ${selectedId === f.id ? 'bg-primary/20 border-l-4 border-l-primary' : 'hover:bg-slate-800/40'}`}
                        onClick={() => onSelect(f)}
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <FolderIcon className={`w-5 h-5 ${selectedId === f.id ? 'text-primary' : 'text-yellow-500'}`} />
                            <span className={`text-xs font-bold ${selectedId === f.id ? 'text-primary' : 'text-slate-200'}`}>{f.name}</span>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigateTo(f); }} 
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-[9px] font-black uppercase transition-colors"
                        >
                            ABRIR
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- APLICADORES ---
const SingleApplier = ({ groups }: { groups: Group[] }) => {
    const [site, setSite] = useState<Site | null>(null);
    const [drive, setDrive] = useState<Drive | null>(null);
    const [folder, setFolder] = useState<DriveItem | null>(null);
    const [selectedGroups, setSelectedGroups] = useState<Array<{ group: Group, role: PermissionRole }>>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const toggleGroup = (g: Group) => {
        if (selectedGroups.find(x => x.group.id === g.id)) {
            setSelectedGroups(selectedGroups.filter(x => x.group.id !== g.id));
        } else {
            const role = g.displayName.toUpperCase().includes('RW') ? PermissionRole.WRITE : PermissionRole.READ;
            setSelectedGroups([...selectedGroups, { group: g, role }]);
        }
    };

    const handleApply = async () => {
        if (!site || !drive || !folder) return;
        setLoading(true);
        try {
            await GraphService.applyMultiplePermissions(site.id, drive.id, folder.id, selectedGroups.map(sg => ({ groupId: sg.group.id, role: sg.role })));
            setSuccess(true);
        } finally { setLoading(false); }
    };

    if (success) return (
        <div className="text-center py-20 animate-slide-up">
            <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><SuccessIcon className="w-10 h-10 text-emerald-500" /></div>
            <h2 className="text-xl font-black mb-6 uppercase">Segurança Aplicada!</h2>
            <button onClick={() => { setSuccess(false); setFolder(null); setSelectedGroups([]); }} className="px-8 py-3 bg-primary text-white rounded-xl font-black text-xs">NOVA OPERAÇÃO</button>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
            <div className="space-y-6">
                {!site ? <SiteLoader onSelect={setSite} /> : !drive ? <DriveLoader siteId={site.id} onSelect={setDrive} /> : (
                    <FolderBrowser siteId={site.id} driveId={drive.id} onSelect={setFolder} selectedId={folder?.id} />
                )}
            </div>
            <div className="bg-slate-800/20 p-6 rounded-[2.5rem] border border-slate-800/50 flex flex-col gap-6 h-[500px]">
                <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">Configurar Grupos _GS_</h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                    {groups.map(g => (
                        <button key={g.id} onClick={() => toggleGroup(g)} className={`w-full text-left p-3 rounded-xl border text-[11px] font-bold flex justify-between items-center transition-all ${selectedGroups.find(x => x.group.id === g.id) ? 'bg-primary border-primary text-white shadow-lg shadow-primary/10' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                            {g.displayName}
                            <RoleBadge role={g.displayName.toUpperCase().includes('RW') ? 'write' : 'read'} />
                        </button>
                    ))}
                </div>
                <div className="pt-4 border-t border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-2">Pasta Alvo: <span className="text-slate-200">{folder?.name || 'Selecione no navegador'}</span></p>
                    <button onClick={handleApply} disabled={!folder || selectedGroups.length === 0 || loading} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">
                        {loading ? <LoadingIcon className="w-5 h-5" /> : 'APLICAR ISOLAMENTO (EDITAR)'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const BulkApplier = ({ groups }: { groups: Group[] }) => {
    const [site, setSite] = useState<Site | null>(null);
    const [drive, setDrive] = useState<Drive | null>(null);
    const [parentFolder, setParentFolder] = useState<DriveItem | null>(null);
    const [children, setChildren] = useState<DriveItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (site && drive && parentFolder) {
            GraphService.getFolders(site.id, drive.id, parentFolder.id).then(setChildren);
        }
    }, [parentFolder, site, drive]);

    const handleApplyBulk = async () => {
        setLoading(true);
        try {
            for (const id of selectedIds) {
                const folder = children.find(c => c.id === id);
                if (!folder) continue;
                const matches = groups.filter(g => g.displayName.toLowerCase().includes(folder.name.toLowerCase()));
                if (matches.length > 0) {
                    await GraphService.applyMultiplePermissions(site!.id, drive!.id, folder.id, matches.map(m => ({
                        groupId: m.id,
                        role: m.displayName.toUpperCase().includes('RW') ? PermissionRole.WRITE : PermissionRole.READ
                    })));
                }
            }
            alert('Vínculo em massa finalizado.');
            setSelectedIds([]);
        } finally { setLoading(false); }
    };

    return (
        <div className="animate-slide-up space-y-6">
            {!site ? <SiteLoader onSelect={setSite} /> : !drive ? <DriveLoader siteId={site.id} onSelect={setDrive} /> : !parentFolder ? (
                <FolderBrowser siteId={site.id} driveId={drive.id} onSelect={setParentFolder} />
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-3">
                            <FolderIcon className="w-5 h-5 text-yellow-500" />
                            <p className="font-black text-sm text-slate-200">Pastas em <span className="text-primary">{parentFolder.name}</span></p>
                        </div>
                        <button onClick={() => setParentFolder(null)} className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-xl hover:bg-primary/20 transition-all">TROCAR DIRETÓRIO</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {children.map(c => {
                            const isSel = selectedIds.includes(c.id);
                            return (
                                <button key={c.id} onClick={() => setSelectedIds(prev => isSel ? prev.filter(x => x !== c.id) : [...prev, c.id])} className={`p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${isSel ? 'bg-primary/20 border-primary text-primary shadow-lg scale-[1.02]' : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                                    <span className="text-xs font-bold truncate max-w-[80%]">{c.name}</span>
                                    {isSel && <CheckIcon className="w-4 h-4" />}
                                </button>
                            );
                        })}
                    </div>
                    <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-left"><p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Alvos selecionados: <span className="text-primary">{selectedIds.length}</span></p></div>
                        <button onClick={handleApplyBulk} disabled={selectedIds.length === 0 || loading} className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-20 flex items-center gap-3">
                            {loading ? <LoadingIcon className="w-5 h-5" /> : 'APLICAR VÍNCULOS (EDITAR)'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- USER CLONER ---
const UserCloner = () => {
    const [sourceUser, setSourceUser] = useState<User | null>(null);
    const [targetUser, setTargetUser] = useState<User | null>(null);
    const [sourceGroups, setSourceGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [success, setSuccess] = useState(false);

    const [querySource, setQuerySource] = useState('');
    const [resultsSource, setResultsSource] = useState<User[]>([]);
    const [queryTarget, setQueryTarget] = useState('');
    const [resultsTarget, setResultsTarget] = useState<User[]>([]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (querySource.length >= 3) setResultsSource(await GraphService.searchUsers(querySource));
            else setResultsSource([]);
        }, 300);
        return () => clearTimeout(timer);
    }, [querySource]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (queryTarget.length >= 3) setResultsTarget(await GraphService.searchUsers(queryTarget));
            else setResultsTarget([]);
        }, 300);
        return () => clearTimeout(timer);
    }, [queryTarget]);

    useEffect(() => {
        if (sourceUser) {
            GraphService.getUserGroups(sourceUser.id).then(setSourceGroups);
        } else {
            setSourceGroups([]);
        }
    }, [sourceUser]);

    const handleClone = async () => {
        if (!sourceUser || !targetUser || sourceGroups.length === 0) return;
        setLoading(true);
        setStatus('Iniciando clonagem...');
        
        try {
            for (let i = 0; i < sourceGroups.length; i++) {
                const group = sourceGroups[i];
                setStatus(`Adicionando ao grupo (${i + 1}/${sourceGroups.length}): ${group.displayName}`);
                try {
                    await GraphService.addMemberToGroup(group.id, targetUser.id);
                } catch (e) {
                    console.warn(`Já é membro ou erro no grupo ${group.displayName}`);
                }
            }
            setSuccess(true);
            setStatus('Clonagem concluída com sucesso!');
        } catch (e) {
            setStatus('Erro durante a clonagem.');
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <div className="text-center py-20 animate-slide-up">
            <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><SuccessIcon className="w-10 h-10 text-emerald-500" /></div>
            <h2 className="text-xl font-black mb-2 uppercase">Acessos Clonados!</h2>
            <p className="text-slate-500 text-xs mb-8">Os grupos de {sourceUser?.displayName} foram replicados para {targetUser?.displayName}.</p>
            <button onClick={() => { setSuccess(false); setSourceUser(null); setTargetUser(null); setQuerySource(''); setQueryTarget(''); }} className="px-8 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest">NOVA CLONAGEM</button>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
            <div className="space-y-6">
                <div className="bg-slate-800/30 p-6 rounded-[2.5rem] border border-slate-800">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">1. Usuário Origem (Modelo)</h3>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Buscar usuário para clonar acessos..." 
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:ring-1 focus:ring-primary outline-none"
                            value={querySource}
                            onChange={(e) => setQuerySource(e.target.value)}
                        />
                        {resultsSource.length > 0 && (
                            <div className="absolute z-20 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl">
                                {resultsSource.map(u => (
                                    <button key={u.id} onClick={() => { setSourceUser(u); setResultsSource([]); setQuerySource(u.displayName); }} className="w-full text-left p-3 hover:bg-slate-700 border-b border-slate-700 last:border-0">
                                        <p className="text-xs font-bold text-white">{u.displayName}</p>
                                        <p className="text-[10px] text-slate-400">{u.userPrincipalName}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {sourceUser && (
                        <div className="mt-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700 animate-slide-up">
                            <p className="text-[10px] font-black text-primary uppercase mb-2">Grupos que serão clonados:</p>
                            <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-1">
                                {sourceGroups.map(g => (
                                    <div key={g.id} className="text-[10px] text-slate-400 flex items-center gap-2">
                                        <CheckIcon className="w-3 h-3 text-emerald-500" /> {g.displayName}
                                    </div>
                                ))}
                                {sourceGroups.length === 0 && <p className="text-[10px] italic text-slate-500">Nenhum grupo encontrado.</p>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-800/30 p-6 rounded-[2.5rem] border border-slate-800">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">2. Usuário Destino (Receberá os acessos)</h3>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Buscar usuário que receberá os acessos..." 
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:ring-1 focus:ring-primary outline-none"
                            value={queryTarget}
                            onChange={(e) => setQueryTarget(e.target.value)}
                        />
                        {resultsTarget.length > 0 && (
                            <div className="absolute z-20 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl">
                                {resultsTarget.map(u => (
                                    <button key={u.id} onClick={() => { setTargetUser(u); setResultsTarget([]); setQueryTarget(u.displayName); }} className="w-full text-left p-3 hover:bg-slate-700 border-b border-slate-700 last:border-0">
                                        <p className="text-xs font-bold text-white">{u.displayName}</p>
                                        <p className="text-[10px] text-slate-400">{u.userPrincipalName}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {targetUser && (
                        <div className="mt-4 p-4 bg-primary/10 rounded-2xl border border-primary/30 flex items-center gap-3 animate-slide-up">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-black">
                                {targetUser.displayName.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">{targetUser.displayName}</p>
                                <p className="text-[10px] text-primary/70">{targetUser.userPrincipalName}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col justify-center items-center p-8 bg-slate-800/10 border-2 border-dashed border-slate-800 rounded-[3rem]">
                <SparklesIcon className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-lg font-black mb-4 uppercase text-center">Clonagem de Perfil</h3>
                <button 
                    onClick={handleClone} 
                    disabled={!sourceUser || !targetUser || sourceGroups.length === 0 || loading}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                >
                    {loading ? <LoadingIcon className="w-5 h-5" /> : 'CLONAR ACESSOS AGORA'}
                </button>
                {status && <p className="mt-4 text-[10px] font-black text-primary uppercase animate-pulse">{status}</p>}
            </div>
        </div>
    );
};

// --- LOADERS ---
const SiteLoader = ({ onSelect }: any) => {
    const [sites, setSites] = useState<Site[]>([]);
    useEffect(() => { GraphService.getSites().then(setSites); }, []);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sites.map(s => (
                <button key={s.id} onClick={() => onSelect(s)} className="p-5 bg-slate-800/40 border-2 border-transparent hover:border-primary rounded-[2rem] text-left transition-all group flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20"><SiteIcon className="w-6 h-6 text-primary" /></div>
                    <p className="font-black text-xs truncate text-slate-200">{s.displayName}</p>
                </button>
            ))}
        </div>
    );
};

const DriveLoader = ({ siteId, onSelect }: any) => {
    const [drives, setDrives] = useState<Drive[]>([]);
    useEffect(() => { GraphService.getDrives(siteId).then(setDrives); }, [siteId]);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {drives.map(d => (
                <button key={d.id} onClick={() => onSelect(d)} className="p-5 bg-slate-800/40 border-2 border-transparent hover:border-primary rounded-[2rem] text-left transition-all flex items-center gap-4 text-slate-200">
                    <div className="p-3 bg-yellow-500/10 rounded-xl"><FolderIcon className="w-6 h-6 text-yellow-500" /></div>
                    <p className="font-black text-xs">{d.name}</p>
                </button>
            ))}
        </div>
    );
};

const Dashboard = ({ groups }: { groups: Group[] }) => {
    const [sitesCount, setSitesCount] = useState(0);
    const [loading, setLoading] = useState(true);
    useEffect(() => { GraphService.getSites().then(s => { setSitesCount(s.length); setLoading(false); }); }, []);

    return (
        <div className="space-y-8 animate-slide-up no-print text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500"><SiteIcon className="w-6 h-6" /></div>
                    <div className="text-left"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sites</p><p className="text-2xl font-black text-slate-200">{loading ? '...' : sitesCount}</p></div>
                </div>
                <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500"><GroupIcon className="w-6 h-6" /></div>
                    <div className="text-left"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grupos _GS_</p><p className="text-2xl font-black text-slate-200">{groups.length}</p></div>
                </div>
                <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500"><ShieldErrorIcon className="w-6 h-6" /></div>
                    <div className="text-left"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Segurança</p><p className="text-2xl font-black text-emerald-500 uppercase">Forte</p></div>
                </div>
            </div>
            <div className="bg-slate-800/20 p-12 rounded-[3rem] border border-slate-800 flex flex-col items-center">
                <SparklesIcon className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-2xl font-black mb-2 tracking-tight text-slate-100">Governance Pro v3</h3>
                <p className="text-slate-400 max-w-md text-sm leading-relaxed italic">Segurança delegada para Microsoft SharePoint & OneDrive.</p>
            </div>
        </div>
    );
};

const SitesOptions = () => {
    const [sites, setSites] = useState<Site[]>([]);
    useEffect(() => { GraphService.getSites().then(setSites); }, []);
    return <>{sites.map(s => <option key={s.id} value={JSON.stringify(s)}>{s.displayName}</option>)}</>;
};

const DrivesOptions = ({ siteId }: { siteId: string }) => {
    const [drives, setDrives] = useState<Drive[]>([]);
    useEffect(() => { GraphService.getDrives(siteId).then(setDrives); }, [siteId]);
    return <>{drives.map(d => <option key={d.id} value={JSON.stringify(d)}>{d.name}</option>)}</>;
};

export default PermissionManager;