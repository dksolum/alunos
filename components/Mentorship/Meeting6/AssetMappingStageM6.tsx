import React, { useState } from 'react';
import { Save, CheckCircle2, Home, Landmark, Coins, Plus, Trash2, DollarSign, MessageSquare, ToggleLeft, ToggleRight, ArrowUpRight, RefreshCw } from 'lucide-react';

interface AssetMappingItem {
    id: string;
    category: 'Imóveis' | 'Investimentos' | 'Outros patrimônios';
    description: string;
    currentValue: number;
    generatesIncome: boolean;
    incomeValue?: number;
    observation: string;
    origin?: 'M5' | 'M6';
}

interface AssetMappingStageM6Props {
    meetingData: any;
    m5Data?: any;
    onUpdateMeetingData: (data: any) => void;
    readOnly?: boolean;
}

export const AssetMappingStageM6: React.FC<AssetMappingStageM6Props> = ({
    meetingData,
    m5Data,
    onUpdateMeetingData,
    readOnly = false
}) => {
    const [assets, setAssets] = useState<AssetMappingItem[]>(meetingData?.assetMapping || []);
    const [showSuccess, setShowSuccess] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const categories: AssetMappingItem['category'][] = ['Imóveis', 'Investimentos', 'Outros patrimônios'];

    const handleRefresh = () => {
        if (!m5Data?.assetMapping || m5Data.assetMapping.length === 0) {
            alert("Nenhum patrimônio cadastrado na Reunião 5 para sincronizar.");
            return;
        }

        if (confirm("Deseja sincronizar com o Mapeamento atualizado da Reunião 5? Isso mesclará e atualizará os valores do patrimônio com base na R5.")) {
            setRefreshing(true);
            const m5Assets: AssetMappingItem[] = m5Data.assetMapping;
            const updatedAssets = [...assets];

            m5Assets.forEach(m5Asset => {
                const existingIndex = updatedAssets.findIndex(a => a.id === m5Asset.id);
                if (existingIndex >= 0) {
                    // Update existing values with potentially newer values from M5
                    updatedAssets[existingIndex] = {
                        ...updatedAssets[existingIndex],
                        currentValue: m5Asset.currentValue,
                        generatesIncome: m5Asset.generatesIncome,
                        incomeValue: m5Asset.incomeValue,
                        description: m5Asset.description
                    };
                } else {
                    // Add new asset from M5
                    updatedAssets.push(m5Asset);
                }
            });

            setAssets(updatedAssets);
            onUpdateMeetingData((prev: any) => ({ ...prev, assetMapping: updatedAssets }));
            setRefreshing(false);

            alert("Patrimônio sincronizado com sucesso!");
        }
    };

    const handleAddAsset = (category: AssetMappingItem['category']) => {
        if (readOnly) return;
        const newAsset: AssetMappingItem = {
            id: crypto.randomUUID(),
            category,
            description: '',
            currentValue: 0,
            generatesIncome: false,
            incomeValue: 0,
            observation: '',
            origin: 'M6'
        };
        const newAssets = [...assets, newAsset];
        setAssets(newAssets);
    };

    const handleUpdateAsset = (id: string, field: keyof AssetMappingItem, value: any) => {
        if (readOnly) return;
        const newAssets = assets.map(a => a.id === id ? { ...a, [field]: value } : a);
        setAssets(newAssets);
    };

    const handleRemoveAsset = (id: string) => {
        if (readOnly) return;
        setAssets(assets.filter(a => a.id !== id));
    };

    const handleSave = () => {
        onUpdateMeetingData((prev: any) => ({ ...prev, assetMapping: assets }));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Imóveis': return <Home className="text-sky-400" size={20} />;
            case 'Investimentos': return <Landmark className="text-emerald-400" size={20} />;
            default: return <Coins className="text-amber-400" size={20} />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Imóveis': return 'border-sky-500/30 bg-sky-500/5';
            case 'Investimentos': return 'border-emerald-500/30 bg-emerald-500/5';
            default: return 'border-amber-500/30 bg-amber-500/5';
        }
    };

    const totalPatrimony = assets.reduce((acc, curr) => acc + (curr.currentValue || 0), 0);
    const totalMonthlyIncome = assets.reduce((acc, curr) => acc + (curr.generatesIncome ? (curr.incomeValue || 0) : 0), 0);

    return (
        <div className="space-y-8 animate-fade-in relative pb-10">
            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                        <Landmark className="text-sky-400" size={24} />
                        Mapeamento de Patrimônio
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                        Levantamento detalhado de bens, ativos e suas respectivas rentabilidades
                    </p>
                </div>

                <div className="flex gap-4 items-center">
                    {!readOnly && (
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all
                                ${refreshing ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}
                            `}
                            title="Sincronizar Atualizações da M5"
                        >
                            <RefreshCw size={16} className={`mb-1 ${refreshing ? 'animate-spin' : ''}`} />
                            <span className="text-[8px] font-black uppercase tracking-widest leading-none">Sinc M5</span>
                        </button>
                    )}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-3 text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Patrimônio Total</p>
                        <p className="text-lg font-black text-white">
                            {totalPatrimony.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-6 py-3 text-right">
                        <p className="text-[10px] text-emerald-500/60 uppercase font-black tracking-widest">Renda Passiva Mensal</p>
                        <p className="text-lg font-black text-emerald-400">
                            {totalMonthlyIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Category Groups */}
            <div className="space-y-10">
                {categories.map(category => (
                    <div key={category} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-3">
                                {getCategoryIcon(category)}
                                <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest">{category}</h4>
                            </div>
                            {!readOnly && (
                                <button
                                    onClick={() => handleAddAsset(category)}
                                    className="p-1 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase transition-all flex items-center gap-2"
                                >
                                    <Plus size={14} />
                                    Adicionar
                                </button>
                            )}
                        </div>

                        <div className="grid gap-4">
                            {assets.filter(a => a.category === category).length === 0 ? (
                                <div className="py-8 text-center border-2 border-dashed border-slate-800/50 rounded-2xl">
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Nenhum item em {category}</p>
                                </div>
                            ) : (
                                assets.filter(a => a.category === category).map(asset => (
                                    <div key={asset.id} className={`rounded-[1.5rem] border p-6 transition-all group ${getCategoryColor(category)} relative`}>
                                        {!readOnly && (
                                            <button
                                                onClick={() => handleRemoveAsset(asset.id)}
                                                className="absolute top-4 right-4 p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                            {/* Description */}
                                            <div className="md:col-span-5 space-y-1.5">
                                                <div className="flex items-center justify-between px-1">
                                                    <label className="text-[10px] text-slate-500 uppercase font-black">Descrição do Bem / Ativo</label>
                                                    {asset.origin && (
                                                        <span className={`px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest ${asset.origin === 'M5'
                                                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                                                : 'text-teal-400 bg-teal-500/10 border-teal-500/20'
                                                            }`}>
                                                            Origem: R{asset.origin.replace('M', '')}
                                                        </span>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={asset.description}
                                                    disabled={readOnly}
                                                    placeholder="Ex: Apartamento em SP, Ações Petrobras, Carro..."
                                                    onChange={(e) => handleUpdateAsset(asset.id, 'description', e.target.value)}
                                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-sky-500 transition-all shadow-inner"
                                                />
                                            </div>

                                            {/* Value */}
                                            <div className="md:col-span-3 space-y-1.5">
                                                <label className="text-[10px] text-slate-500 uppercase font-black px-1">Valor Atual Estimado</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                                    <input
                                                        type="text"
                                                        value={asset.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        disabled={readOnly}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value.replace(/[^\d]/g, '')) / 100;
                                                            handleUpdateAsset(asset.id, 'currentValue', val || 0);
                                                        }}
                                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-sm font-bold text-white outline-none focus:border-sky-500 transition-all shadow-inner"
                                                    />
                                                </div>
                                            </div>

                                            {/* Income Toggle */}
                                            <div className="md:col-span-4 space-y-1.5">
                                                <label className="text-[10px] text-slate-500 uppercase font-black px-1">Gera Renda Recorrente?</label>
                                                <div className="flex items-center gap-4 py-1.5 px-1">
                                                    <button
                                                        onClick={() => handleUpdateAsset(asset.id, 'generatesIncome', !asset.generatesIncome)}
                                                        disabled={readOnly}
                                                        className={`flex items-center gap-2 transition-all ${asset.generatesIncome ? 'text-emerald-400' : 'text-slate-600'}`}
                                                    >
                                                        {asset.generatesIncome ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{asset.generatesIncome ? 'Sim' : 'Não'}</span>
                                                    </button>

                                                    {asset.generatesIncome && (
                                                        <div className="flex-1 animate-in slide-in-from-left-2 fade-in duration-300">
                                                            <div className="relative">
                                                                <ArrowUpRight className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={14} />
                                                                <input
                                                                    type="text"
                                                                    value={(asset.incomeValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                    disabled={readOnly}
                                                                    placeholder="Renda Mensal"
                                                                    onChange={(e) => {
                                                                        const val = parseFloat(e.target.value.replace(/[^\d]/g, '')) / 100;
                                                                        handleUpdateAsset(asset.id, 'incomeValue', val || 0);
                                                                    }}
                                                                    className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 pl-10 text-sm font-black text-emerald-400 outline-none focus:border-emerald-500 transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Observation */}
                                            <div className="md:col-span-12 space-y-1.5">
                                                <label className="text-[10px] text-slate-500 uppercase font-black px-1">Observações</label>
                                                <div className="flex items-start gap-3 bg-slate-950/30 border border-slate-800/50 rounded-xl px-4 py-3">
                                                    <MessageSquare size={16} className="text-slate-700 mt-1" />
                                                    <textarea
                                                        value={asset.observation}
                                                        disabled={readOnly}
                                                        placeholder="Detalhes sobre liquidez, taxas, localização..."
                                                        onChange={(e) => handleUpdateAsset(asset.id, 'observation', e.target.value)}
                                                        className="w-full bg-transparent text-xs text-slate-400 outline-none resize-none pt-0.5"
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {!readOnly && assets.length > 0 && (
                <div className="flex justify-end pt-8 border-t border-slate-800">
                    <button onClick={handleSave} className="bg-sky-500 hover:bg-sky-600 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-sky-500/20 uppercase text-xs tracking-widest">
                        {showSuccess ? <><CheckCircle2 size={18} /> Patrimônio Salvo!</> : <><Save size={20} /> Salvar Mapeamento</>}
                    </button>
                </div>
            )}
        </div>
    );
};
