import React, { useState, useEffect } from 'react';
import { Site, Drive, DriveItem, Group, PermissionRole, User, Permission } from '../types';
import * as GraphService from '../services/graphService';
import * as GeminiService from '../services/geminiService';
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

            <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] shadow-2xl p-6 border border-gray-100 dark:border-slate-800 min-h-[600px] transition-all relative overflow-hidden backdrop-blur-sm print:bg-transparent print:shadow-none print:p-0 print:border-none print:rounded-none">
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

const RoleBadge = ({ role }: { role: string }) => {
    const isEdit = role.toLowerCase().includes('write') || role.toLowerCase().includes('edit');
    return (
        <span className={`text-[9px] font-black px-2.5 py-1 rounded-md border uppercase tracking-tighter ${isEdit ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-600 text-white border-slate-400'}`}>
            {isEdit ? 'EDITAR' : 'LEITURA'}
        </span>
    );
};

const SitesOptions = () => {
    const [sites, setSites] = useState<Site[]>([]);
    useEffect(() => { GraphService.getSites().then(setSites); }, []);
    return <>{sites.map(s => <option key={s.id} value={JSON.stringify(s)}>{s.displayName}</option>)}</>;
};

const DrivesOptions = ({ siteId }: { siteId: string }) => {
    const [drives, setDrives] = useState<Drive[]>([]);
    useEffect(() => { if (siteId) GraphService.getDrives(siteId).then(setDrives); }, [siteId]);
    return <>{drives.map(d => <option key={d.id} value={JSON.stringify(d)}>{d.name}</option>)}</>;
};

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

    useEffect(() => { load(); }, [siteId, driveId]);

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
                    {path.length > 0 && <button onClick={() => { setPath([]); load(); }} className="text-slate-400 hover:text-white px-2 font-black text-xs">✕ VOLTAR</button>}
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

// --- MÓDULO ÚNICO ---
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
        if (!site || !drive || !folder || selectedGroups.length === 0) return;
        setLoading(true);
        try {
            await GraphService.applyMultiplePermissions(site.id, drive.id, folder.id, selectedGroups.map(sg => ({ groupId: sg.group.id, role: sg.role })));
            setSuccess(true);
        } finally { setLoading(false); }
    };

    if (success) return (
        <div className="text-center py-20 animate-slide-up">
            <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><SuccessIcon className="w-10 h-10 text-emerald-500" /></div>
            <h2 className="text-xl font-black mb-6 uppercase text-slate-200">Segurança Aplicada!</h2>
            <button onClick={() => { setSuccess(false); setFolder(null); setSelectedGroups([]); }} className="px-8 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest">NOVA OPERAÇÃO</button>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
            <div className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select onChange={(e) => setSite(e.target.value ? JSON.parse(e.target.value) : null)} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700 text-xs font-bold text-slate-200 outline-none">
                        <option value="">Site...</option>
                        <SitesOptions />
                    </select>
                    {site && (
                        <select onChange={(e) => setDrive(e.target.value ? JSON.parse(e.target.value) : null)} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700 text-xs font-bold text-slate-200 outline-none">
                            <option value="">Biblioteca...</option>
                            <DrivesOptions siteId={site.id} />
                        </select>
                    )}
                </div>
                {site && drive && <FolderBrowser siteId={site.id} driveId={drive.id} onSelect={setFolder} selectedId={folder?.id} />}
            </div>
            <div className="bg-slate-800/20 p-6 rounded-[2.5rem] border border-slate-800/50 flex flex-col gap-6 h-[500px]">
                <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">Configurar Grupos _GS_</h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                    {groups.map(g => (
                        <button key={g.id} onClick={() => toggleGroup(g)} className={`w-full text-left p-3 rounded-xl border text-[11px] font-bold flex justify-between items-center transition-all ${selectedGroups.find(x => x.group.id === g.id) ? 'bg-primary border-primary text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                            {g.displayName}
                            <RoleBadge role={g.displayName.toUpperCase().includes('RW') ? 'write' : 'read'} />
                        </button>
                    ))}
                </div>
                <button onClick={handleApply} disabled={!folder || selectedGroups.length === 0 || loading} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl transition-all uppercase tracking-widest disabled:opacity-30">
                    {loading ? <LoadingIcon className="w-5 h-5 mx-auto" /> : 'APLICAR PERMISSÕES'}
                </button>
            </div>
        </div>
    );
};

// --- MÓDULO MASSA ---
const BulkApplier = ({ groups }: { groups: Group[] }) => {
    const [site, setSite] = useState<Site | null>(null);
    const [drive, setDrive] = useState<Drive | null>(null);
    const [parentFolder, setParentFolder] = useState<DriveItem | null>(null);
    const [children, setChildren] = useState<DriveItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'select' | 'review'>('select');
    const [finalSelections, setFinalSelections] = useState<Record<string, string[]>>({});

    useEffect(() => {
        if (site && drive && parentFolder) {
            GraphService.getFolders(site.id, drive.id, parentFolder.id).then(setChildren);
        }
    }, [parentFolder, site, drive]);

    const handleGoToReview = () => {
        const initialSelections: Record<string, string[]> = {};
        selectedIds.forEach(id => {
            const folder = children.find(c => c.id === id)!;
            const related = groups.filter(g => g.displayName.toLowerCase().includes(folder.name.toLowerCase()));
            if (related.length > 0) {
                const bestMatch = related.find(g => g.displayName.includes('RW')) || related[0];
                initialSelections[id] = [bestMatch.id];
            }
        });
        setFinalSelections(initialSelections);
        setStep('review');
    };

    const handleApplyBulk = async () => {
        setLoading(true);
        try {
            for (const fid of Object.keys(finalSelections)) {
                const gids = finalSelections[fid];
                const payloads = gids.map(gid => ({
                    groupId: gid,
                    role: groups.find(x => x.id === gid)?.displayName.includes('RW') ? PermissionRole.WRITE : PermissionRole.READ
                }));
                await GraphService.applyMultiplePermissions(site!.id, drive!.id, fid, payloads);
            }
            alert('Concluído!');
            setStep('select');
            setSelectedIds([]);
        } finally { setLoading(false); }
    };

    return (
        <div className="animate-slide-up space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select onChange={(e) => setSite(e.target.value ? JSON.parse(e.target.value) : null)} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 text-xs font-bold text-slate-200">
                    <option value="">Site...</option>
                    <SitesOptions />
                </select>
                {site && <select onChange={(e) => setDrive(e.target.value ? JSON.parse(e.target.value) : null)} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 text-xs font-bold text-slate-200"><option value="">Drive...</option><DrivesOptions siteId={site.id}/></select>}
            </div>
            {site && drive && !parentFolder && <FolderBrowser siteId={site.id} driveId={drive.id} onSelect={setParentFolder} />}
            {parentFolder && step === 'select' && (
                <div className="space-y-6 animate-slide-up">
                    <div className="flex flex-wrap gap-2">
                        {children.map(c => (
                            <button key={c.id} onClick={() => setSelectedIds(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])} className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${selectedIds.includes(c.id) ? 'bg-primary border-primary text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleGoToReview} disabled={selectedIds.length === 0} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">REVISAR ASSOCIAÇÕES ({selectedIds.length})</button>
                </div>
            )}
            {step === 'review' && (
                <div className="space-y-4 animate-slide-up">
                    {selectedIds.map(fid => {
                        const f = children.find(x => x.id === fid)!;
                        return (
                            <div key={fid} className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                                <span className="text-xs font-black text-white">{f.name}</span>
                                <div className="flex gap-2">
                                    {groups.filter(g => g.displayName.toLowerCase().includes(f.name.toLowerCase())).map(g => (
                                        <button key={g.id} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase">{g.displayName}</button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    <button onClick={handleApplyBulk} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">EXECUTAR EM MASSA</button>
                </div>
            )}
        </div>
    );
};

// --- MÓDULO MEMBROS ---
const GroupMemberManager = ({ groups }: { groups: Group[] }) => {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);

    useEffect(() => {
        if (selectedGroup) {
            setLoading(true);
            GraphService.getGroupMembers(selectedGroup.id).then(m => { setMembers(m); setLoading(false); });
        }
    }, [selectedGroup]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 3) GraphService.searchUsers(searchQuery).then(setSearchResults);
            else setSearchResults([]);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleAdd = async (u: User) => {
        if (!selectedGroup) return;
        await GraphService.addMemberToGroup(selectedGroup.id, u.id);
        setMembers([...members, u]);
        setSearchQuery('');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-slide-up">
            <div className="md:col-span-4 space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Diretório de Grupos</h3>
                <div className="bg-slate-800/40 rounded-[2rem] border border-slate-800 h-[500px] overflow-y-auto custom-scrollbar">
                    {groups.map(g => (
                        <button key={g.id} onClick={() => setSelectedGroup(g)} className={`w-full text-left p-4 border-b border-slate-800 transition-all ${selectedGroup?.id === g.id ? 'bg-primary/20 border-l-4 border-l-primary' : 'hover:bg-slate-800/40'}`}>
                            <span className={`text-xs font-bold ${selectedGroup?.id === g.id ? 'text-primary' : 'text-slate-300'}`}>{g.displayName}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="md:col-span-8 space-y-6">
                {selectedGroup && (
                    <>
                        <div className="bg-slate-800/20 p-6 rounded-[2.5rem] border border-slate-800">
                             <input type="text" placeholder="Adicionar por Nome ou E-mail..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-primary" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                             {searchResults.length > 0 && (
                                 <div className="mt-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
                                     {searchResults.map(u => <button key={u.id} onClick={() => handleAdd(u)} className="w-full p-3 text-left hover:bg-slate-700 border-b border-slate-700 text-xs font-bold text-white">{u.displayName}</button>)}
                                 </div>
                             )}
                        </div>
                        <div className="bg-slate-800/20 rounded-[2.5rem] border border-slate-800 h-[380px] overflow-y-auto custom-scrollbar p-6">
                            <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4">Membros Ativos ({members.length})</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {members.map(m => (
                                    <div key={m.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex justify-between items-center group">
                                        <div className="truncate"><p className="text-xs font-bold text-slate-200 truncate">{m.displayName}</p></div>
                                        <button onClick={() => GraphService.removeMemberFromGroup(selectedGroup.id, m.id).then(() => setMembers(members.filter(x => x.id !== m.id)))} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- MÓDULO CLONAR ---
const UserCloner = () => {
    const [src, setSrc] = useState<User | null>(null);
    const [dst, setDst] = useState<User | null>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.length >= 3) GraphService.searchUsers(query).then(setResults);
        else setResults([]);
    }, [query]);

    const handleClone = async () => {
        if (!src || !dst) return;
        setLoading(true);
        try {
            const groups = await GraphService.getUserGroups(src.id);
            for (const g of groups) await GraphService.addMemberToGroup(g.id, dst.id);
            alert('Perfil clonado!');
            setSrc(null); setDst(null);
        } finally { setLoading(false); }
    };

    return (
        <div className="flex flex-col items-center gap-10 py-10 animate-slide-up">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-20 w-full max-w-4xl">
                 <div className="text-center space-y-4">
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Origem (Modelo)</p>
                     <input type="text" placeholder="Buscar..." className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs text-white" onChange={(e) => { setQuery(e.target.value); }} />
                     {src ? <div className="p-4 bg-primary/10 rounded-2xl border border-primary text-xs font-black uppercase">{src.displayName}</div> : <div className="p-4 bg-slate-900 border border-slate-800 text-xs italic text-slate-600">Selecione o modelo</div>}
                 </div>
                 <div className="text-center space-y-4">
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Destino (Novo)</p>
                     <input type="text" placeholder="Buscar..." className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs text-white" onChange={(e) => { setQuery(e.target.value); }} />
                     {dst ? <div className="p-4 bg-primary/10 rounded-2xl border border-primary text-xs font-black uppercase">{dst.displayName}</div> : <div className="p-4 bg-slate-900 border border-slate-800 text-xs italic text-slate-600">Selecione o alvo</div>}
                 </div>
             </div>
             {results.length > 0 && (
                 <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden">
                     {results.map(u => (
                         <button key={u.id} className="w-full p-4 text-left border-b border-slate-700 hover:bg-slate-700 text-xs font-bold text-white" onClick={() => { if (!src) setSrc(u); else setDst(u); setResults([]); }}>{u.displayName}</button>
                     ))}
                 </div>
             )}
             <button onClick={handleClone} disabled={!src || !dst || loading} className="px-20 py-5 bg-primary text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl disabled:opacity-20">EXECUTAR CLONAGEM</button>
        </div>
    );
};

// --- ABA RELATÓRIOS ---
const SecurityReports = () => {
    const [site, setSite] = useState<Site | null>(null);
    const [drive, setDrive] = useState<Drive | null>(null);
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    const generateReport = async () => {
        if (!site || !drive) return;
        setLoading(true);
        setReportData([]);
        try {
            const rootFolders = await GraphService.getFolders(site.id, drive.id);
            const foldersToAudit = rootFolders.filter(f => f.name.toLowerCase() !== 'general');
            const results = [];
            for (const f of foldersToAudit) {
                const perms = await GraphService.getFolderPermissions(site.id, drive.id, f.id);
                const gsGroups = perms.filter(p => (p.grantedToV2?.group?.displayName || p.grantedToV2?.siteGroup?.displayName)?.startsWith('_GS_'));
                const groupsWithMembers = [];
                for (const p of gsGroups) {
                    const gid = p.grantedToV2?.group?.id;
                    if (gid) {
                        const members = await GraphService.getGroupMembers(gid);
                        groupsWithMembers.push({ name: p.grantedToV2?.group?.displayName || p.grantedToV2?.siteGroup?.displayName, role: p.roles[0], members });
                    }
                }
                if (groupsWithMembers.length > 0) results.push({ folder: f.name, groups: groupsWithMembers });
            }
            setReportData(results);
        } finally { setLoading(false); }
    };

    if (isPreviewMode) return (
        <div id="printable-report-wrapper" className="fixed inset-0 z-[100] preview-overlay overflow-y-auto print:static print:bg-transparent print:z-auto">
            {/* TOOLBAR EXECUTIVA - NO PRINT */}
            <div className="no-print flex justify-center py-6 sticky top-0 z-[110] bg-[#0b1120]/80 backdrop-blur-md border-b border-white/5 shadow-2xl">
                <div className="w-full max-w-4xl px-4 flex justify-between items-center">
                    <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3"><LogoIcon className="w-5 h-5 text-primary" /> VISUALIZAÇÃO DO RELATÓRIO</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setIsPreviewMode(false)} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-[10px] font-black uppercase transition-all">VOLTAR</button>
                        <button onClick={() => window.print()} className="px-8 py-2.5 bg-primary hover:bg-accent text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-primary/30 transition-all">SALVAR PDF</button>
                    </div>
                </div>
            </div>

            {/* CONTAINER DO RELATÓRIO */}
            <div className="flex justify-center py-12 print:p-0 print:block">
                <div id="printable-report" className="report-paper animate-slide-up print:m-0 print:animate-none">
                    <div className="report-header flex justify-between items-end pb-8 mb-12 border-b-2 border-white/10">
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter m-0 text-white">Relatório de Acessos</h1>
                            <p className="text-xl font-bold text-slate-300 uppercase">{site?.displayName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-black text-slate-400">EMISSÃO: {new Date().toLocaleDateString('pt-BR')}</p>
                            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Auditoria de Segurança</p>
                        </div>
                    </div>
                    <div className="space-y-16">
                        {reportData.map((item, idx) => (
                            <div key={idx} className="break-inside-avoid">
                                <h4 className="font-black text-sm text-primary uppercase mb-4 tracking-tight">{item.folder}</h4>
                                <div className="grid grid-cols-1 gap-5">
                                    {item.groups.map((g: any, gIdx: number) => (
                                        <div key={gIdx} className="report-group-card">
                                            <div className="flex justify-between items-center mb-5">
                                                <span className="text-xs font-black text-white">{g.name}</span>
                                                <RoleBadge role={g.role} />
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                                                {g.members.map((m: any, mIdx: number) => (
                                                    <span key={mIdx} className="member-tag">{m.displayName}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-slide-up space-y-6">
            <div className="no-print bg-slate-800/30 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select onChange={(e) => setSite(e.target.value ? JSON.parse(e.target.value) : null)} className="bg-slate-900 p-3 rounded-xl text-xs font-bold text-slate-200 outline-none"><option value="">Unidade...</option><SitesOptions /></select>
                    {site && <select onChange={(e) => setDrive(e.target.value ? JSON.parse(e.target.value) : null)} className="bg-slate-900 p-3 rounded-xl text-xs font-bold text-slate-200"><option value="">Biblioteca...</option><DrivesOptions siteId={site.id}/></select>}
                </div>
                <button onClick={generateReport} disabled={!drive || loading} className="px-8 py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest">{loading ? <LoadingIcon className="w-4 h-4" /> : 'ESCANEAR'}</button>
                {reportData.length > 0 && <button onClick={() => setIsPreviewMode(true)} className="px-6 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase flex items-center gap-2">PDF EXECUTIVO</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportData.map((item, idx) => (
                    <div key={idx} className="bg-slate-800/20 p-6 rounded-[2.5rem] border border-slate-800/40">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-4">{item.folder}</p>
                        <div className="space-y-4">
                            {item.groups.map((g: any, gIdx: number) => <div key={gIdx} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-xs font-black text-white">{g.name}</div>)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard = ({ groups }: { groups: Group[] }) => {
    return (
        <div className="space-y-8 animate-slide-up text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/30 p-8 rounded-3xl border border-slate-800 flex items-center gap-6">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary"><GroupIcon className="w-8 h-8" /></div>
                    <div className="text-left"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grupos GS</p><p className="text-3xl font-black text-slate-200">{groups.length}</p></div>
                </div>
                <div className="md:col-span-2 bg-slate-800/30 p-8 rounded-3xl border border-slate-800 flex items-center">
                    <p className="text-slate-400 italic text-sm leading-relaxed">Central de governança delegada para Microsoft SharePoint. Utilize os módulos ao lado para aplicar, auditar ou clonar permissões de segurança baseadas em Entra ID Groups.</p>
                </div>
            </div>
        </div>
    );
};

export default PermissionManager;