
import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus, ChecklistData, FinancialData } from '../types';
import { authService } from '../services/authService';
import { UserIntakeModal } from './UserIntakeModal';
import { X, Search, Trash2, Eye, Shield, User as UserIcon, Lock, Briefcase, Plus, Check, Clock, AlertCircle, MessageCircle, Edit2, LogOut, CheckCircle2, FileText, ShieldCheck, ListChecks, Target } from 'lucide-react';
import { ChecklistModal } from './ChecklistModal';

interface AdminDashboardProps {
    currentUser: User;
    onClose: () => void;
    onSelectUser: (userId: string) => void;
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onClose, onSelectUser, onLogout }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals state
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // New User Form State
    const [newUser, setNewUser] = useState({ name: '', email: '', whatsapp: '', password: '', role: 'USER' as UserRole });

    // Password field for edit (separated because User type usually doesn't show it in UI lists)
    const [editPassword, setEditPassword] = useState('');

    const [showIntakeModal, setShowIntakeModal] = useState(false);
    const [intakeUser, setIntakeUser] = useState<User | null>(null);

    const [showChecklistModal, setShowChecklistModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showPhaseModal, setShowPhaseModal] = useState(false);
    const [selectedPhaseUser, setSelectedPhaseUser] = useState<User | null>(null);
    const [selectedUserFinancialData, setSelectedUserFinancialData] = useState<FinancialData | undefined>(undefined);

    const handleOpenChecklist = async (user: User) => {
        setSelectedUser(user);

        // Fetch financial data for the user to populate the checklist inputs
        try {
            const data = await authService.getDiagnosticByAdmin(user.id);
            setSelectedUserFinancialData(data || undefined);
        } catch (error) {
            console.error("Error fetching financial data for checklist:", error);
            setSelectedUserFinancialData(undefined);
        }

        setShowChecklistModal(true);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const userList = await authService.listUsers();

            // Definição da hierarquia de cargos
            const roleHierarchy: Record<string, number> = {
                'ADMIN': 0,
                'SECRETARY': 1,
                'USER': 2
            };

            const sortedList = (userList || []).sort((a, b) => {
                // 1. Order by Role
                const roleA = roleHierarchy[a.role] ?? 99;
                const roleB = roleHierarchy[b.role] ?? 99;

                if (roleA !== roleB) {
                    return roleA - roleB;
                }

                // 2. If same role, order by creation date (older first -> "ordem de criação")
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });

            setUsers(sortedList);
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Erro ao carregar lista de usuários. Tente recarregar a página.');
        }
    };

    const visibleUsers = (users || []).filter(u => {
        // Secretários só veem usuários comuns
        if (currentUser.role === 'SECRETARY') {
            return u.role === 'USER';
        }
        // Admins veem todos
        return true;
    });

    const filteredUsers = visibleUsers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (userId: string) => {
        if (confirm('Tem certeza? Isso apaga o usuário e o diagnóstico dele para sempre.')) {
            try {
                await authService.deleteUser(userId);
                loadUsers();
            } catch (error: any) {
                alert('Erro ao deletar usuário: ' + (error.message || 'Erro desconhecido'));
            }
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password) return alert('Email e senha obrigatórios');

        // Admins podem criar qualquer papel. Se for Secretary, forçamos 'USER' (embora a UI deva impedir)
        const roleToCreate = canCreateAdminOrSecretary ? newUser.role : 'USER';

        const res = await authService.createUserByAdmin({
            ...newUser,
            role: roleToCreate
        });

        if (res.success && res.user) {
            setShowCreate(false);
            setNewUser({ name: '', email: '', whatsapp: '', password: '', role: 'USER' });
            loadUsers();

            // Auto-open Intake Modal
            setIntakeUser(res.user);
            setShowIntakeModal(true);
        } else {
            alert(res.message);
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        const updates: Partial<User> = {
            name: editingUser.name,
            email: editingUser.email,
            whatsapp: editingUser.whatsapp,
        };

        if (editPassword.trim()) {
            updates.password = editPassword.trim();
        }

        const res = await authService.updateUserData(editingUser.id, updates);
        if (res.success) {
            setShowEdit(false);
            setEditingUser(null);
            setEditPassword('');
            loadUsers();
        } else {
            alert(res.message);
        }
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setEditPassword(''); // Reset password field
        setShowEdit(true);
        setShowCreate(false);
    };

    const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
        await authService.updateUserStatus(userId, newStatus, currentUser.name);
        loadUsers();
    };

    const canCreateUser = currentUser.role === 'ADMIN' || currentUser.role === 'SECRETARY';
    const canCreateAdminOrSecretary = currentUser.role === 'ADMIN';
    const canDelete = currentUser.role === 'ADMIN';

    // Ícones e Labels para Status
    const getStatusInfo = (status: UserStatus) => {
        switch (status) {
            case 'NEW': return { icon: <AlertCircle size={14} />, label: 'Pré-cadastro', color: 'text-slate-500 bg-slate-800' }; // Cinza
            case 'ACTIVE': return { icon: <CheckCircle2 size={14} />, label: 'Consultoria', color: 'text-emerald-400 bg-emerald-500/10' }; // Verde
            case 'CONVERTED': return { icon: <Check size={14} />, label: 'Mentoria', color: 'text-sky-400 bg-sky-500/10' }; // Azul
            case 'CONTACTED': return { icon: <Clock size={14} />, label: 'Acompanhamento', color: 'text-amber-400 bg-amber-500/10' }; // Dourado
            case 'LOST': return { icon: <X size={14} />, label: 'Perdido', color: 'text-rose-400 bg-rose-500/10' };
            default: return { icon: <AlertCircle size={14} />, label: 'Novo', color: 'text-slate-400 bg-slate-800' };
        }
    };

    return (
        <>
            <div className={`fixed inset-0 z-[90] bg-[#0f172a] text-slate-200 overflow-y-auto animate-in fade-in ${showIntakeModal ? 'print:hidden' : ''}`}>
                {/* Header */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                        {/* Title & User Info */}
                        <div>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Painel Administrativo</h1>
                            <p className="text-sm text-slate-400">Gerenciamento de usuários e diagnósticos</p>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Buscar nome ou email..."
                                    className="bg-slate-800 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:border-sky-500 transition-all w-64"
                                />
                            </div>
                            {canCreateUser && (
                                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-900 rounded-xl font-bold text-xs uppercase hover:bg-emerald-400 transition-colors">
                                    <Plus size={16} /> Novo Usuário
                                </button>
                            )}
                            <button onClick={onLogout} className="p-2 bg-slate-800 rounded-xl hover:bg-rose-500 hover:text-white text-slate-400 transition-colors" title="Sair do Sistema">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                    <th className="p-4">Usuário</th>
                                    <th className="p-4">Status / Fase</th>
                                    <th className="p-4">Função</th>
                                    <th className="p-4 text-center">Checklist</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => {
                                        const status = getStatusInfo(user.status);
                                        return (
                                            <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 font-bold uppercase border border-slate-700">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-200">{user.name}</div>
                                                            <div className="text-xs text-slate-500">{user.email}</div>
                                                            {user.whatsapp && <div className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1"><MessageCircle size={10} /> {user.whatsapp}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <div className={`px-2 py-1 rounded-md border flex items-center gap-1.5 ${status.color} border-current/20`}>
                                                            {status.icon}
                                                            <span className="text-[10px] font-black uppercase tracking-tight">{status.label}</span>
                                                        </div>

                                                        {/* SELECT FOR STATUS CHANGE */}
                                                        <div className="relative group/edit">
                                                            <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase cursor-pointer hover:text-sky-400 transition-colors bg-slate-800/50 px-2 py-1 rounded border border-slate-700 hover:border-sky-500/50">
                                                                <Edit2 size={8} /> Alterar Status
                                                            </div>
                                                            <select
                                                                value={user.status}
                                                                onChange={(e) => handleStatusChange(user.id, e.target.value as UserStatus)}
                                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                                title="Alterar status do usuário"
                                                            >
                                                                <option className="bg-slate-800 text-slate-300" value="NEW">Pré-cadastro (Bloqueado)</option>
                                                                <option className="bg-slate-800 text-slate-300" value="ACTIVE">Consultoria (Módulos 1-4)</option>
                                                                <option className="bg-slate-800 text-slate-300" value="CONVERTED">Mentoria (Módulos 5-10)</option>
                                                                <option className="bg-slate-800 text-slate-300" value="CONTACTED">Acompanhamento (Todos)</option>
                                                                <option className="bg-slate-800 text-slate-300" value="LOST">Perdido</option>
                                                            </select>
                                                        </div>

                                                        {user.lastContactedBy && user.status !== 'NEW' && (
                                                            <span className="text-[8px] text-slate-600 font-bold uppercase">
                                                                Atualizado por: {user.lastContactedBy}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${user.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-400' :
                                                        (user.role === 'SECRETARY' ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400')
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPhaseUser(user);
                                                            setShowPhaseModal(true);
                                                        }}
                                                        className={`p-2 rounded-lg transition-colors ${user.checklistPhase && user.checklistPhase !== 'LOCKED'
                                                            ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                            : 'bg-slate-800 text-slate-600 hover:bg-slate-700 hover:text-slate-400'
                                                            }`}
                                                        title={`Fase Atual: ${user.checklistPhase === 'PHASE_1' ? 'Fase 1' : (user.checklistPhase === 'PHASE_2' ? 'Fase 2' : 'Bloqueado')}`}
                                                    >
                                                        <ShieldCheck size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenChecklist(user)} // Use new handler
                                                        className="p-2 rounded-lg bg-slate-800 text-slate-600 hover:bg-slate-700 hover:text-white transition-colors ml-2"
                                                        title="Editar Checklist"
                                                    >
                                                        <ListChecks size={16} />
                                                    </button>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => { setIntakeUser(user); setShowIntakeModal(true); }} className="p-2 hover:bg-sky-500/20 rounded-lg text-slate-500 hover:text-sky-400 transition-colors" title="Ficha Individual"><FileText size={16} /></button>
                                                        <button onClick={() => openEditModal(user)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"><Edit2 size={16} /></button>
                                                        {user.role === 'USER' && (
                                                            <button onClick={() => onSelectUser(user.id)} className="p-2 hover:bg-sky-500/20 rounded-lg text-slate-500 hover:text-sky-400 transition-colors"><Eye size={16} /></button>
                                                        )}
                                                        {canDelete && user.id !== currentUser.id && user.id !== 'admin-main' && (
                                                            <button onClick={() => handleDelete(user.id)} className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showCreate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden">
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">Novo Usuário</h3>
                            <div className="space-y-3">
                                <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="Nome" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-emerald-500" />
                                <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="Email" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-emerald-500" />
                                <input value={newUser.whatsapp} onChange={e => setNewUser({ ...newUser, whatsapp: e.target.value })} placeholder="Whatsapp" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-emerald-500" />
                                <input value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Senha" type="password" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-emerald-500" />

                                {/* Role Selection: Visible only if ADMIN */}
                                {canCreateAdminOrSecretary && (
                                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-emerald-500 text-slate-300">
                                        <option value="USER" className="bg-slate-800">Usuário</option>
                                        <option value="SECRETARY" className="bg-slate-800">Secretário</option>
                                        <option value="ADMIN" className="bg-slate-800">Admin</option>
                                    </select>
                                )}

                                <div className="flex gap-2 mt-4 pt-2">

                                    <button onClick={() => setShowCreate(false)} className="flex-1 py-3 bg-slate-800 rounded-xl text-slate-400 font-bold text-xs uppercase hover:bg-slate-700">Cancelar</button>
                                    <button onClick={handleCreateUser} className="flex-1 py-3 bg-emerald-500 rounded-xl text-slate-900 font-bold text-xs uppercase hover:bg-emerald-400">Criar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showEdit && editingUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden">
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">Editar Usuário</h3>
                            <div className="space-y-3">
                                <input value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} placeholder="Nome" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-sky-500" />
                                <input value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} placeholder="Email" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-sky-500" />
                                <input value={editingUser.whatsapp} onChange={e => setEditingUser({ ...editingUser, whatsapp: e.target.value })} placeholder="Whatsapp" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-sky-500" />
                                <input value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="Nova Senha (opcional)" type="password" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-sky-500" />
                                <div className="flex gap-2 mt-4 pt-2">
                                    <button onClick={() => setShowEdit(false)} className="flex-1 py-3 bg-slate-800 rounded-xl text-slate-400 font-bold text-xs uppercase hover:bg-slate-700">Cancelar</button>
                                    <button onClick={handleUpdateUser} className="flex-1 py-3 bg-sky-500 rounded-xl text-slate-900 font-bold text-xs uppercase hover:bg-sky-400">Salvar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showIntakeModal && intakeUser && (
                <UserIntakeModal
                    user={intakeUser}
                    isOpen={showIntakeModal}
                    onClose={() => setShowIntakeModal(false)}
                />
            )}


            {showChecklistModal && selectedUser && (
                <ChecklistModal
                    isOpen={showChecklistModal}
                    onClose={() => {
                        setShowChecklistModal(false);
                        setSelectedUser(null);
                    }}
                    initialProgress={selectedUser.checklistProgress || []}
                    initialData={selectedUser.checklistData || {}}
                    readOnly={false}
                    financialData={selectedUserFinancialData}
                    phase={selectedUser.checklistPhase || 'LOCKED'}
                    onSave={async (newProgress, newData) => { // Updated signature
                        if (selectedUser) {
                            await authService.updateChecklistProgress(selectedUser.id, newProgress);
                            await authService.updateChecklistData(selectedUser.id, newData);

                            // Atualizar estado local
                            // Atualizar estado local
                            setUsers(prevUsers => prevUsers.map(u =>
                                u.id === selectedUser.id ? {
                                    ...u,
                                    checklistProgress: newProgress,
                                    checklistData: newData
                                } : u
                            ));

                            setSelectedUser(prev => prev ? {
                                ...prev,
                                checklistProgress: newProgress,
                                checklistData: newData
                            } : null);
                        }
                    }}
                />
            )}
            {showPhaseModal && selectedPhaseUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <ShieldCheck size={20} className="text-emerald-500" />
                                    Fase do Checklist
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">Gerencie o nível de acesso do usuário.</p>
                            </div>
                            <button
                                onClick={() => setShowPhaseModal(false)}
                                className="text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    if (selectedPhaseUser) {
                                        authService.updateUserChecklistPhase(selectedPhaseUser.id, 'LOCKED');
                                        setUsers(users.map(u => u.id === selectedPhaseUser.id ? { ...u, checklistPhase: 'LOCKED' } : u));
                                        setShowPhaseModal(false);
                                    }
                                }}
                                className={`w-full p-4 rounded-xl border flex items-center justify-between group transition-all ${selectedPhaseUser.checklistPhase === 'LOCKED' || !selectedPhaseUser.checklistPhase
                                    ? 'bg-slate-800 border-rose-500/50 text-white shadow-lg shadow-rose-900/10'
                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${selectedPhaseUser.checklistPhase === 'LOCKED' || !selectedPhaseUser.checklistPhase ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-900 text-slate-600'}`}>
                                        <Lock size={18} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-sm font-bold uppercase">Bloqueado</span>
                                        <span className="block text-[10px] opacity-70">Sem acesso ao checklist</span>
                                    </div>
                                </div>
                                {(selectedPhaseUser.checklistPhase === 'LOCKED' || !selectedPhaseUser.checklistPhase) && <CheckCircle2 size={18} className="text-rose-500" />}
                            </button>

                            <button
                                onClick={() => {
                                    if (selectedPhaseUser) {
                                        authService.updateUserChecklistPhase(selectedPhaseUser.id, 'PHASE_1');
                                        setUsers(users.map(u => u.id === selectedPhaseUser.id ? { ...u, checklistPhase: 'PHASE_1' } : u));
                                        setShowPhaseModal(false);
                                    }
                                }}
                                className={`w-full p-4 rounded-xl border flex items-center justify-between group transition-all ${selectedPhaseUser.checklistPhase === 'PHASE_1'
                                    ? 'bg-slate-800 border-rose-500/50 text-white shadow-lg shadow-rose-900/10'
                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${selectedPhaseUser.checklistPhase === 'PHASE_1' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-900 text-slate-600'}`}>
                                        <ListChecks size={18} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-sm font-bold uppercase">Fase 1: Diagnóstico</span>
                                        <span className="block text-[10px] opacity-70">Checklist base (Sanhaço)</span>
                                    </div>
                                </div>
                                {selectedPhaseUser.checklistPhase === 'PHASE_1' && <CheckCircle2 size={18} className="text-rose-500" />}
                            </button>

                            <button
                                onClick={() => {
                                    if (selectedPhaseUser) {
                                        authService.updateUserChecklistPhase(selectedPhaseUser.id, 'PHASE_2');
                                        setUsers(users.map(u => u.id === selectedPhaseUser.id ? { ...u, checklistPhase: 'PHASE_2' } : u));
                                        setShowPhaseModal(false);
                                    }
                                }}
                                className={`w-full p-4 rounded-xl border flex items-center justify-between group transition-all ${selectedPhaseUser.checklistPhase === 'PHASE_2'
                                    ? 'bg-slate-800 border-amber-500/50 text-white shadow-lg shadow-amber-900/10'
                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${selectedPhaseUser.checklistPhase === 'PHASE_2' ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-900 text-slate-600'}`}>
                                        <Target size={18} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-sm font-bold uppercase">Fase 2: Retorno</span>
                                        <span className="block text-[10px] opacity-70">Negociação e Ajustes</span>
                                    </div>
                                </div>
                                {selectedPhaseUser.checklistPhase === 'PHASE_2' && <CheckCircle2 size={18} className="text-amber-500" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
