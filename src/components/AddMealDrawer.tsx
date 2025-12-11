import { useState, useEffect, useMemo } from 'react';
import {
    X, Search, Plus, Check, ChevronLeft, Loader2, Layers, Utensils,
    Beef, Wheat, Leaf, Apple, Droplet, Milk, Coffee, CircleHelp, GlassWater
} from 'lucide-react';
import { backend, type FoodItem, FOOD_CATEGORIES, type FoodCategoryType, type ComboItem } from '../services/GASBackend';
import { useStore } from '../store/useStore';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type MainTab = 'FOOD' | 'COMBO';
type ViewMode = 'CATEGORY_LIST' | 'FOOD_LIST' | 'AMOUNT_INPUT';

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

export const AddMealDrawer = ({ isOpen, onClose }: Props) => {
    const { fetchDailyData, currentDate } = useStore();

    const [allFoods, setAllFoods] = useState<FoodItem[]>([]);
    const [combos, setCombos] = useState<ComboItem[]>([]);
    const [isFetching, setIsFetching] = useState(false);

    const [activeTab, setActiveTab] = useState<MainTab>('FOOD');
    const [viewMode, setViewMode] = useState<ViewMode>('CATEGORY_LIST');
    const [selectedCategory, setSelectedCategory] = useState<FoodCategoryType | null>(null);
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [amount, setAmount] = useState<string | number>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsFetching(true);
            Promise.all([backend.getFoodList(), backend.getComboList()])
                .then(([foodsData, combosData]) => {
                    if (Array.isArray(foodsData)) setAllFoods(foodsData);
                    if (Array.isArray(combosData)) setCombos(combosData);
                })
                .catch(() => { })
                .finally(() => setIsFetching(false));
            resetUI();
        }
    }, [isOpen]);

    const resetUI = () => {
        setActiveTab('FOOD');
        setViewMode('CATEGORY_LIST');
        setSelectedCategory(null);
        setSelectedFood(null);
        setSearchTerm('');
        setAmount(1);
    };

    const filteredFoods = useMemo(() => {
        let result = allFoods;
        // [新增] 搜尋時也排除水 (以免搜到 Water 項目)
        result = result.filter(food => food.category !== '水');

        if (selectedCategory) result = result.filter(food => food.category === selectedCategory);
        if (searchTerm) result = result.filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return result;
    }, [allFoods, selectedCategory, searchTerm]);

    const handleSelectCategory = (category: FoodCategoryType) => {
        setSelectedCategory(category);
        setViewMode('FOOD_LIST');
        setSearchTerm('');
    };

    const handleSelectFood = (food: FoodItem) => {
        setSelectedFood(food);
        setViewMode('AMOUNT_INPUT');
        if (food.unit.toLowerCase() === 'g') setAmount(100); else setAmount(1);
    };

    const handleBack = () => {
        if (viewMode === 'AMOUNT_INPUT') {
            setViewMode('FOOD_LIST');
            setSelectedFood(null);
        } else if (viewMode === 'FOOD_LIST') {
            setViewMode('CATEGORY_LIST');
            setSelectedCategory(null);
            setSearchTerm('');
        }
    };

    const getMultiplier = (val: number) => {
        if (!selectedFood) return 0;
        return selectedFood.unit.toLowerCase() === 'g' ? val / 100 : val;
    };

    const handleSubmitFood = async () => {
        if (!selectedFood) return;
        const inputVal = Number(amount) || 0;
        if (inputVal <= 0) return;

        setIsSubmitting(true);
        const multiplier = getMultiplier(inputVal);

        try {
            await backend.logNutrition({
                date: currentDate,
                mealName: selectedFood.name,
                calories: Math.round(selectedFood.calories * multiplier),
                protein: Math.round(selectedFood.protein * multiplier),
                carbs: Math.round(selectedFood.carbs * multiplier),
                fat: Math.round(selectedFood.fat * multiplier),
                amount: inputVal,
                unit: selectedFood.unit,
                category: selectedFood.category
            });
            await fetchDailyData();
            onClose();
        } catch (e) {
            alert('Failed to save.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddCombo = async (comboName: string) => {
        if (confirm(`Add combo "${comboName}"?`)) {
            setIsSubmitting(true);
            try {
                await backend.logCombo(currentDate, comboName);
                await fetchDailyData();
                onClose();
            } catch (e) {
                alert('Failed to add combo.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val)) setAmount(val);
    };
    const adjustAmount = (delta: number) => {
        const current = Number(amount) || 0;
        let step = delta;
        if (selectedFood?.unit.toLowerCase() === 'g') step = delta * 10;
        setAmount(Math.max(0, current + step));
    };

    if (!isOpen) return null;

    let title = 'Add Meal';
    if (activeTab === 'COMBO') title = 'My Combos';
    else if (viewMode === 'FOOD_LIST' && selectedCategory) title = FOOD_CATEGORIES[selectedCategory]?.label || 'Food List';
    else if (viewMode === 'AMOUNT_INPUT') title = 'Edit Amount';

    const getCategoryStyle = (catKey: string) => {
        return CATEGORY_STYLES[catKey] || CATEGORY_STYLES['其他'];
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-gray-50 w-full max-w-md rounded-t-[2.5rem] h-[85vh] flex flex-col shadow-2xl animate-slide-up overflow-hidden">

                <div className="flex justify-between items-center p-5 bg-gray-50 z-10 min-h-[70px]">
                    {viewMode !== 'CATEGORY_LIST' && activeTab === 'FOOD' ? (
                        <button onClick={handleBack} className="p-3 text-gray-500 hover:text-black bg-white rounded-full shadow-sm border border-gray-100">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <button onClick={onClose} className="p-3 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm border border-gray-100">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                    <span className="font-bold text-lg text-gray-900 tracking-tight">{title}</span>
                    <div className="w-11"></div>
                </div>

                {(viewMode === 'CATEGORY_LIST' || activeTab === 'COMBO') && (
                    <div className="px-6 pb-2">
                        <div className="bg-gray-200/60 p-1.5 rounded-2xl flex">
                            <button
                                onClick={() => { setActiveTab('FOOD'); setViewMode('CATEGORY_LIST'); }}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'FOOD' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                            >
                                <Utensils className="w-4 h-4" />
                                Foods
                            </button>
                            <button
                                onClick={() => setActiveTab('COMBO')}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'COMBO' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                            >
                                <Layers className="w-4 h-4" />
                                Combos
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-hidden relative">

                    {isFetching || isSubmitting ? (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                            <p className="font-medium tracking-wide">{isSubmitting ? 'Adding...' : 'Syncing...'}</p>
                        </div>
                    ) : null}

                    {/* COMBOS */}
                    {activeTab === 'COMBO' && (
                        <div className="p-6 overflow-y-auto h-full animate-fade-in space-y-4 pb-24">
                            {combos.length === 0 ? (
                                <div className="text-center text-gray-400 mt-10">No combos found</div>
                            ) : (
                                combos.map((combo, idx) => (
                                    <div key={idx} onClick={() => handleAddCombo(combo.name)} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 active:scale-[0.98] transition-all cursor-pointer hover:shadow-md group">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-bold text-xl text-gray-900">{combo.name}</h3>
                                            <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                                                {combo.totalCalories} kcal
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            {combo.items.map((item, i) => (
                                                <div key={i} className="flex justify-between text-sm text-gray-500 border-b border-gray-50 pb-1 last:border-0">
                                                    <span>{item.name}</span>
                                                    <span className="text-gray-300 font-mono">{item.amount}{item.unit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* CATEGORIES */}
                    {activeTab === 'FOOD' && viewMode === 'CATEGORY_LIST' && (
                        <div className="p-6 overflow-y-auto h-full animate-fade-in">
                            <div className="grid grid-cols-2 gap-4 pb-20">
                                {Object.entries(FOOD_CATEGORIES)
                                    .filter(([key]) => key !== '水') // [修改] 這裡過濾掉「水」分類
                                    .map(([key, { label }]) => {
                                        const style = getCategoryStyle(key);
                                        const Icon = style.icon;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => handleSelectCategory(key as FoodCategoryType)}
                                                className={`
                        ${style.bg} p-6 rounded-[1.8rem] shadow-sm border-0 
                        flex flex-col items-center justify-center gap-4 
                        active:scale-95 transition-all hover:brightness-95 h-36
                      `}
                                            >
                                                <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm ${style.color}`}>
                                                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                                                </div>
                                                <span className={`font-bold text-base ${style.color.replace('text-', 'text-opacity-80 ')}`}>
                                                    {label}
                                                </span>
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    {/* FOOD LIST */}
                    {activeTab === 'FOOD' && viewMode === 'FOOD_LIST' && (
                        <div className="flex flex-col h-full animate-fade-in bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] mt-2">
                            <div className="p-6 pb-2">
                                <div className="relative">
                                    <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search food..."
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-lg font-medium placeholder-gray-400"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 pb-20">
                                {filteredFoods.map((food, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSelectFood(food)}
                                        className="p-4 mb-2 bg-white rounded-2xl border border-gray-50 flex justify-between items-center active:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-lg">{food.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                <span className="font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">{food.calories} kcal</span>
                                                <span className="text-gray-300">/</span>
                                                <span className="text-gray-400 text-xs">{food.unit === 'g' ? '100g' : food.unit}</span>
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* INPUT */}
                    {activeTab === 'FOOD' && viewMode === 'AMOUNT_INPUT' && selectedFood && (
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center animate-fade-in bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] mt-2">

                            {(() => {
                                const style = getCategoryStyle(selectedFood.category);
                                const Icon = style.icon;
                                return (
                                    <div className={`w-24 h-24 ${style.bg} rounded-full flex items-center justify-center mb-5 shadow-inner`}>
                                        <Icon className={`w-10 h-10 ${style.color}`} strokeWidth={2} />
                                    </div>
                                );
                            })()}

                            <h3 className="text-3xl font-black mb-1 text-center text-gray-900 tracking-tight">{selectedFood.name}</h3>
                            <p className="text-gray-400 font-medium mb-8">
                                {selectedFood.calories} kcal / {selectedFood.unit === 'g' ? '100g' : selectedFood.unit}
                            </p>

                            <div className="flex items-center justify-center gap-6 mb-10 p-2 bg-gray-50 rounded-[2rem] w-full max-w-xs border border-gray-100">
                                <button onClick={() => adjustAmount(-1)} className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black active:scale-90 shadow-sm transition-all">
                                    <span className="text-2xl font-light">-</span>
                                </button>
                                <div className="flex flex-col items-center w-24">
                                    <input type="text" inputMode="decimal" value={amount} onChange={handleAmountChange} className="w-full text-center text-5xl font-black text-gray-900 bg-transparent border-none focus:ring-0 p-0 outline-none placeholder-gray-200" />
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">{selectedFood.unit}</span>
                                </div>
                                <button onClick={() => adjustAmount(1)} className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center active:scale-90 shadow-lg transition-all">
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="w-full grid grid-cols-3 gap-3 mb-auto">
                                <MacroCard label="CARBS" value={selectedFood.carbs * getMultiplier(Number(amount) || 0)} color="bg-blue-50 text-blue-600 border-blue-100" />
                                <MacroCard label="PROTEIN" value={selectedFood.protein * getMultiplier(Number(amount) || 0)} color="bg-rose-50 text-rose-600 border-rose-100" />
                                <MacroCard label="FAT" value={selectedFood.fat * getMultiplier(Number(amount) || 0)} color="bg-yellow-50 text-yellow-600 border-yellow-100" />
                            </div>

                            <button
                                onClick={handleSubmitFood}
                                disabled={isSubmitting || (Number(amount) || 0) <= 0}
                                className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl mt-8 mb-4 disabled:opacity-50 disabled:scale-100"
                            >
                                <Check className="w-6 h-6" />
                                <span>Add {Math.round(selectedFood.calories * getMultiplier(Number(amount) || 0))} kcal</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MacroCard = ({ label, value, color }: any) => (
    <div className={`p-3 rounded-2xl text-center border ${color} shadow-sm flex flex-col justify-center aspect-[4/3]`}>
        <div className="text-[10px] font-black opacity-60 mb-1 tracking-wider">{label}</div>
        <div className="font-black text-xl leading-none">{Math.round(value)}<span className="text-xs ml-0.5 font-bold opacity-80">g</span></div>
    </div>
);