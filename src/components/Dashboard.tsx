import { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import {
    Plus, Trash2, Loader2, Check, X, Clock,
    Beef, Wheat, Leaf, Apple, Droplet, Milk, Coffee, CircleHelp, GlassWater
} from 'lucide-react';
import { AddMealDrawer } from './AddMealDrawer';
import { CalorieGauge } from './CalorieGauge';
import { DateStrip } from './DateStrip';
import { backend, type NutritionLog } from '../services/GASBackend';

const CATEGORY_STYLES: Record<string, { icon: any, color: string, bg: string }> = {
    '蛋白質': { icon: Beef, color: 'text-rose-500', bg: 'bg-rose-50' },
    '碳水': { icon: Wheat, color: 'text-blue-500', bg: 'bg-blue-50' },
    '蔬菜': { icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    '水果': { icon: Apple, color: 'text-purple-500', bg: 'bg-purple-50' },
    '脂肪': { icon: Droplet, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    '乳製品': { icon: Milk, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    '飲品': { icon: Coffee, color: 'text-slate-500', bg: 'bg-slate-50' },
    '水': { icon: GlassWater, color: 'text-sky-500', bg: 'bg-sky-50' },
    '其他': { icon: CircleHelp, color: 'text-gray-400', bg: 'bg-gray-50' },
};

export const Dashboard = () => {
    const {
        currentDate, setDate,
        caloriesTarget, caloriesConsumed,
        proteinTarget, proteinConsumed,
        carbsTarget, carbsConsumed,
        fatTarget, fatConsumed,
        waterTarget,
        dailyLogs, deleteLog, isLoading, fetchDailyData
    } = useStore();

    const [isAddMealOpen, setIsAddMealOpen] = useState(false);
    const [isAddingWater, setIsAddingWater] = useState(false);

    useEffect(() => { fetchDailyData(); }, [fetchDailyData]);

    const totalWater = dailyLogs
        .filter(log => log.mealName === 'Water')
        .reduce((sum, log) => sum + log.amount, 0);

    const waterProgress = Math.min((totalWater / waterTarget) * 100, 100);
    const foodLogs = dailyLogs.filter(log => log.mealName !== 'Water');

    const handleAddWater = async () => {
        setIsAddingWater(true);
        try {
            await backend.logNutrition({
                date: currentDate,
                mealName: 'Water',
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                amount: 100,
                unit: 'ml',
                category: '水'
            });
            await fetchDailyData();
        } catch (e) {
            alert('Failed to add water');
        } finally {
            setIsAddingWater(false);
        }
    };

    const handleDelete = (rowIndex: number, name: string) => {
        if (confirm(`Delete "${name}"?`)) {
            deleteLog(rowIndex);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
            <DateStrip date={currentDate} onChange={setDate} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* 左欄 */}
                <div className="lg:col-span-5 space-y-6">

                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                            </div>
                        )}
                        <CalorieGauge current={caloriesConsumed} target={caloriesTarget} />
                        <div className="w-full flex justify-between px-6 mt-[-20px] mb-6">
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Eaten</p>
                                <p className="text-xl font-black text-gray-900">{caloriesConsumed}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Goal</p>
                                <p className="text-xl font-black text-gray-900">{caloriesTarget}</p>
                            </div>
                        </div>
                        <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 border-t border-gray-100 pt-6">
                            <MacroProgress label="Protein" current={proteinConsumed} target={proteinTarget} color="bg-rose-500" bg="bg-rose-100" />
                            <MacroProgress label="Carbs" current={carbsConsumed} target={carbsTarget} color="bg-blue-500" bg="bg-blue-100" />
                            <MacroProgress label="Fat" current={fatConsumed} target={fatTarget} color="bg-yellow-500" bg="bg-yellow-100" />
                        </div>
                    </div>

                    <div className="bg-sky-50 rounded-[2rem] p-6 shadow-sm border border-sky-100 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                        <GlassWater className="w-4 h-4 text-sky-500" />
                                    </div>
                                    <span className="text-sm font-bold text-sky-900 uppercase tracking-wide">Water Tracker</span>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-4xl font-black text-sky-600">{totalWater}</span>
                                    <span className="text-sm font-bold text-sky-400">/ {waterTarget} ml</span>
                                </div>
                            </div>
                            <button
                                onClick={handleAddWater}
                                disabled={isAddingWater}
                                className="bg-white text-sky-500 p-3 rounded-2xl shadow-sm active:scale-95 transition-all hover:shadow-md disabled:opacity-70 flex flex-col items-center justify-center gap-1 w-20 h-20"
                            >
                                {isAddingWater ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6 stroke-[3px]" />}
                                <span className="text-xs font-bold">+100ml</span>
                            </button>
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between text-xs font-bold text-sky-400 mb-1.5">
                                <span>Progress</span>
                                <span>{Math.round(waterProgress)}%</span>
                            </div>
                            <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-sky-300 to-sky-500 rounded-full transition-all duration-700 ease-out"
                                    style={{ width: `${waterProgress}%` }}
                                />
                            </div>
                        </div>
                        <GlassWater className="absolute -right-6 -bottom-6 w-40 h-40 text-sky-200/40 -rotate-12 pointer-events-none" />
                    </div>

                    {/* 電腦版按鈕 */}
                    <button
                        onClick={() => setIsAddMealOpen(true)}
                        className="hidden lg:flex w-full bg-black text-white p-5 rounded-[2rem] shadow-xl items-center justify-center gap-3 active:scale-95 transition-transform hover:bg-gray-800"
                    >
                        <Plus className="w-6 h-6" />
                        <span className="font-bold text-lg">Log Food</span>
                    </button>
                </div>

                {/* 右欄 */}
                <div className="lg:col-span-7">
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h2 className="text-2xl font-bold text-gray-900">Today's Meals</h2>
                        <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                            {foodLogs.length} entries
                        </span>
                    </div>

                    <div className="space-y-3">
                        {foodLogs.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 bg-white rounded-[2rem] border border-dashed border-gray-200">
                                No food logged yet today.
                            </div>
                        ) : (
                            foodLogs.map((log) => (
                                <MealItem
                                    key={log.rowIndex}
                                    log={log}
                                    onDelete={() => deleteLog(log.rowIndex)}
                                    onUpdate={() => fetchDailyData()}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* [修改] 手機版懸浮按鈕：位置改為 bottom-24 (避開導航列)，層級改為 z-50 */}
            <div className="lg:hidden fixed bottom-24 left-0 right-0 flex justify-center z-50 pointer-events-none">
                <button
                    onClick={() => setIsAddMealOpen(true)}
                    className="pointer-events-auto bg-black text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 transition-transform hover:bg-gray-900"
                >
                    <Plus className="w-6 h-6" />
                    <span className="font-bold text-lg">Log Food</span>
                </button>
            </div>

            <AddMealDrawer isOpen={isAddMealOpen} onClose={() => setIsAddMealOpen(false)} />
        </div>
    );
};

const MealItem = ({ log, onDelete, onUpdate }: { log: NutritionLog, onDelete: () => void, onUpdate: () => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [amount, setAmount] = useState(log.amount || 0);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (isEditing && inputRef.current) inputRef.current.focus(); }, [isEditing]);

    const handleDelete = () => { if (confirm(`Delete "${log.mealName}"?`)) onDelete(); };

    const handleSave = async () => {
        if (Number(amount) === 0) { handleDelete(); return; }
        if (amount < 0) return;
        setIsSaving(true);
        try {
            await backend.updateNutritionLog(log.rowIndex, log.mealName, Number(amount));
            setIsEditing(false);
            onUpdate();
        } catch (e) { alert("Update failed"); } finally { setIsSaving(false); }
    };

    const style = CATEGORY_STYLES[log.category] || CATEGORY_STYLES['其他'];
    const Icon = style.icon;

    return (
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition-all">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center shadow-inner flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${style.color}`} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg leading-tight">{log.mealName}</h4>
                        <span className="text-xs text-gray-300 font-mono flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {log.time}
                        </span>
                    </div>
                </div>

                <div className="pl-[3.25rem] flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-2 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                        {isEditing ? (
                            <div className="flex items-center gap-1">
                                <input
                                    ref={inputRef} type="number" className="w-16 bg-white border border-blue-200 rounded px-1 py-0 text-right font-bold text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={amount} onChange={(e) => setAmount(Number(e.target.value))} onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                />
                                <span className="text-xs">{log.unit}</span>
                                <button onClick={handleSave} disabled={isSaving} className="text-green-600 hover:bg-green-100 p-1 rounded">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </button>
                                <button onClick={() => setIsEditing(false)} className="text-red-400 hover:bg-red-50 p-1 rounded"><X className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1 hover:text-blue-600 hover:bg-blue-50 px-1 rounded transition-colors group/edit"
                            >
                                <span className="font-bold text-gray-900 group-hover/edit:text-blue-600">
                                    {log.amount > 0 ? log.amount : '-'}
                                </span>
                                <span className="text-xs">{log.unit}</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="text-gray-200 hidden sm:inline">|</span>
                        <span className="text-orange-500 font-bold">{log.calories} kcal</span>
                        <span className="text-gray-200 hidden sm:inline">|</span>
                        <div className="flex gap-2">
                            <span className="text-rose-500">{log.protein}p</span>
                            <span className="text-blue-500">{log.carbs}c</span>
                            <span className="text-yellow-600">{log.fat}f</span>
                        </div>
                    </div>
                </div>
            </div>

            {!isEditing && (
                <button onClick={handleDelete} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
            )}
        </div>
    );
};

const MacroProgress = ({ label, current, target, color, bg }: any) => {
    const percent = Math.min((current / target) * 100, 100);
    return (
        <div className="flex flex-col items-center">
            <div className="text-xs font-bold text-gray-400 mb-1">{label}</div>
            <div className="text-lg font-black text-gray-900 mb-2">
                {Math.round(current)}<span className="text-[10px] text-gray-400 font-normal">/{target}g</span>
            </div>
            <div className={`w-full h-2 ${bg} rounded-full overflow-hidden`}>
                <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
};