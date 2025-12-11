import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
    Dumbbell, Activity, Plus, Trash2, Check,
    ChevronRight, Calendar, ArrowRight, RefreshCw, X, Info, Flame, Timer
} from 'lucide-react';
import { DateStrip } from './DateStrip';
import { backend } from '../services/GASBackend';

export const WorkoutPage = () => {
    const {
        currentDate, setDate,
        workoutLogs, deleteWorkoutLog,
        fetchDailyData,
        routines, fetchRoutines,
        cycleWeek, setCycleWeek,
        selectedRoutine, setSelectedRoutine,
        workoutHistory,
        aerobicWeeklyGoal, aerobicWeeklyCurrent // [新增] 
    } = useStore();

    const [tab, setTab] = useState<'Strength' | 'Aerobic'>('Strength');

    // Form State
    const [exercise, setExercise] = useState('');

    // Strength Data
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [sets, setSets] = useState('');
    const [rpe, setRpe] = useState('');

    // Aerobic Data
    const [time, setTime] = useState('');
    const [intensity, setIntensity] = useState('');
    const [heartRate, setHeartRate] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchRoutines();
    }, [fetchRoutines]);

    useEffect(() => {
        if (tab === 'Aerobic') {
            setExercise('Run');
            setTime('30');
            setIntensity('3.5');
            setHeartRate('130');
        } else {
            setExercise('');
            setTime('');
            setIntensity('');
            setHeartRate('');
        }
    }, [tab]);

    const getTarget = (item: any) => {
        if (cycleWeek === 3) return item.w3;
        return item.w12;
    };

    const handleSelectPlan = (item: any) => {
        const target = getTarget(item);

        setTab('Strength');
        setExercise(item.exercise);
        setSets(String(target.sets));
        const minRep = target.reps.split(/[-~]/)[0] || '';
        setReps(minRep);

        document.getElementById('workout-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async () => {
        if (!exercise) return;
        setIsSubmitting(true);
        try {
            await backend.logWorkout({
                date: currentDate,
                type: tab,
                exercise,
                weight: Number(weight) || 0,
                reps: Number(reps) || 0,
                sets: Number(sets) || 0,
                rpe: Number(rpe) || 0,
                time: Number(time) || 0,
                intensity: intensity,
                heartRate: Number(heartRate) || 0,
                tags: []
            });
            await fetchDailyData();

            if (tab === 'Strength') {
                setExercise('');
                setWeight(''); setReps(''); setSets(''); setRpe('');
            } else {
                setExercise('Run');
                setTime('30'); setIntensity('3.5'); setHeartRate('130');
            }
        } catch (e) {
            alert('Failed to log workout');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (rowIndex: number) => {
        if (confirm('Delete this workout record?')) {
            deleteWorkoutLog(rowIndex);
        }
    };

    const cycleTitle = cycleWeek === 3 ? 'Week 3 (Intensity)' : `Week ${cycleWeek} (Volume)`;
    const cycleColor = cycleWeek === 3 ? 'bg-red-500' : 'bg-black';

    // [新增] 計算有氧剩餘量
    const aerobicRemaining = Math.max(0, aerobicWeeklyGoal - aerobicWeeklyCurrent);
    const aerobicProgress = Math.min((aerobicWeeklyCurrent / aerobicWeeklyGoal) * 100, 100);

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
            <DateStrip date={currentDate} onChange={setDate} />

            {/* 週期徽章 (Strength 模式顯示) */}
            {tab === 'Strength' && (
                <div className="flex justify-center mb-6 -mt-2">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-2 ${cycleWeek === 3 ? 'bg-red-500' : 'bg-black'}`}>
                        <span className="opacity-70 uppercase tracking-wider">Current Cycle</span>
                        <span>Week {cycleWeek}</span>
                    </div>
                </div>
            )}

            {/* 頁面內容 Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* 左欄 */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Tabs */}
                    <div className="flex bg-gray-200/50 p-1 rounded-2xl">
                        <button onClick={() => setTab('Strength')} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${tab === 'Strength' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>
                            <Dumbbell className="w-5 h-5" /> Strength
                        </button>
                        <button onClick={() => setTab('Aerobic')} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${tab === 'Aerobic' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>
                            <Activity className="w-5 h-5" /> Aerobic
                        </button>
                    </div>

                    {/* Strength 模式：顯示週期卡片 */}
                    {tab === 'Strength' && (
                        <div className={`${cycleColor} text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden transition-colors duration-500`}>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Select Cycle</p>
                                    <h2 className="text-2xl font-black italic">{cycleTitle}</h2>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-1 flex">
                                    {[1, 2, 3].map(w => (
                                        <button key={w} onClick={() => setCycleWeek(w as 1 | 2 | 3)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${cycleWeek === w ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}>{w}</button>
                                    ))}
                                </div>
                            </div>
                            {/* Routine Selector */}
                            <div className="relative z-10 mt-4">
                                <label className="text-white/60 text-xs font-bold uppercase mb-2 block">Select Routine</label>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                    {Object.keys(routines).length === 0 && <div className="text-white/40 text-xs">Please setup DB_Routines</div>}
                                    {Object.keys(routines).map(rName => (
                                        <button key={rName} onClick={() => setSelectedRoutine(selectedRoutine === rName ? null : rName)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-all ${selectedRoutine === rName ? 'bg-white text-black border-white' : 'border-white/30 text-white hover:bg-white/10'}`}>{rName}</button>
                                    ))}
                                </div>
                            </div>
                            <Dumbbell className="absolute -right-6 -bottom-6 w-40 h-40 text-white/10 -rotate-12 pointer-events-none" />
                        </div>
                    )}

                    {/* Aerobic 模式：顯示有氧週目標卡片 [新增] */}
                    {tab === 'Aerobic' && (
                        <div className="bg-cyan-500 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <p className="text-cyan-100 text-xs font-bold uppercase tracking-wider mb-1">Weekly Target</p>
                                    <div className="flex items-baseline gap-2">
                                        <h2 className="text-4xl font-black">{aerobicRemaining > 0 ? aerobicRemaining : 0}</h2>
                                        <span className="text-cyan-200 font-bold">mins left</span>
                                    </div>
                                </div>
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Timer className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between text-xs font-bold text-cyan-200 mb-1.5">
                                    <span>{aerobicWeeklyCurrent} min done</span>
                                    <span>{Math.round(aerobicProgress)}%</span>
                                </div>
                                <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${aerobicProgress}%` }}
                                    />
                                </div>
                            </div>
                            <Activity className="absolute -right-6 -bottom-6 w-40 h-40 text-white/10 -rotate-12 pointer-events-none" />
                        </div>
                    )}

                    {/* Strength 模式：待辦清單 */}
                    {tab === 'Strength' && selectedRoutine && routines[selectedRoutine] && (
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 animate-fade-in">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-500" />
                                Plan: {selectedRoutine}
                            </h3>
                            <div className="space-y-3">
                                {routines[selectedRoutine].map((item, idx) => {
                                    const isDone = workoutLogs.some(log => log.exercise === item.exercise);
                                    const target = getTarget(item);
                                    const lastHistory = workoutHistory[item.exercise];
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectPlan(item)}
                                            className={`w-full text-left p-4 rounded-2xl border transition-all group relative ${isDone ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-blue-400 hover:shadow-md'}`}
                                        >
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start">
                                                    <span className={`font-bold text-lg ${isDone ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.exercise}</span>
                                                    {item.note && (
                                                        <div className="group/tooltip relative ml-2" onClick={(e) => { e.stopPropagation(); alert(item.note); }}>
                                                            <Info className="w-5 h-5 text-blue-400/70 hover:text-blue-500 transition-colors" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{target.sets} Sets</span>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${cycleWeek === 3 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{target.reps} Reps</span>
                                                    {lastHistory && <span className="text-[10px] text-gray-400 font-medium ml-auto">Last: {lastHistory.weight}kg</span>}
                                                </div>
                                            </div>
                                            {!isDone && <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-5 h-5 text-blue-500" /></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 輸入表單 */}
                    <div id="workout-form" className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Exercise Name</label>
                                <div className="relative">
                                    <input type="text" placeholder={tab === 'Strength' ? "e.g. Bench Press" : "e.g. Running"} className="w-full bg-gray-50 rounded-2xl pl-4 pr-10 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5" value={exercise} onChange={e => setExercise(e.target.value)} />
                                    {exercise && <button onClick={() => setExercise('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
                                </div>
                                {tab === 'Strength' && exercise && workoutHistory[exercise] && (
                                    <div className="text-xs text-gray-400 mt-1 ml-1">
                                        Last: <strong>{workoutHistory[exercise].weight}kg</strong> × {workoutHistory[exercise].reps} reps
                                    </div>
                                )}
                            </div>

                            {tab === 'Strength' ? (
                                <>
                                    <div className="grid grid-cols-3 gap-3">
                                        <InputGroup label="Sets" value={sets} onChange={setSets} type="number" placeholder="3" />
                                        <InputGroup label="Reps" value={reps} onChange={setReps} type="number" placeholder="10" />
                                        <InputGroup label="Weight (kg)" value={weight} onChange={setWeight} type="number" placeholder="60" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <InputGroup label="RPE (1-10)" value={rpe} onChange={setRpe} type="number" placeholder="8" />
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    <InputGroup label="Time (min)" value={time} onChange={setTime} type="number" placeholder="30" />
                                    <InputGroup label="Intensity (1-10)" value={intensity} onChange={setIntensity} type="number" placeholder="3.5" step="0.1" min="1" max="10" />
                                    <InputGroup label="Avg HR" value={heartRate} onChange={setHeartRate} type="number" placeholder="130" />
                                </div>
                            )}

                            <button onClick={handleSubmit} disabled={isSubmitting || !exercise} className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 mt-2">
                                {isSubmitting ? 'Saving...' : <><Plus className="w-5 h-5" /> Log Workout</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 右欄：今日紀錄 */}
                <div className="lg:col-span-7">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 px-1">Today's Session</h3>
                    <div className="space-y-3">
                        {workoutLogs.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 bg-white rounded-[2rem] border border-dashed border-gray-200">
                                <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No workouts logged today.</p>
                            </div>
                        ) : (
                            workoutLogs.map((log) => {
                                const lastLog = workoutHistory[log.exercise];
                                return (
                                    <div key={log.rowIndex} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition-all">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${log.type === 'Strength' ? 'bg-blue-50 text-blue-600' : 'bg-cyan-50 text-cyan-600'}`}>
                                                    {log.type}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-lg text-gray-900">{log.exercise}</h4>
                                            <div className="text-sm text-gray-500 font-medium mt-1 flex items-center gap-2">
                                                {log.type === 'Strength' ? (
                                                    <>
                                                        <span>{log.sets} sets × {log.reps} reps <span className="text-gray-300">|</span> <b>{log.weight}kg</b> <span className="text-gray-300">|</span> RPE {log.rpe}</span>
                                                        {lastLog && <span className="text-xs text-gray-400 ml-1 border-l border-gray-200 pl-2">(Last: {lastLog.weight}kg)</span>}
                                                    </>
                                                ) : (
                                                    <span>{log.time} mins <span className="text-gray-300">|</span> Int: {log.intensity} <span className="text-gray-300">|</span> {log.heartRate} bpm</span>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(log.rowIndex)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

const InputGroup = ({ label, value, onChange, type, placeholder, step, min, max }: any) => (
    <div>
        <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            step={step}
            min={min}
            max={max}
            className="w-full bg-gray-50 rounded-2xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 placeholder-gray-300"
            value={value}
            onChange={e => onChange(e.target.value)}
        />
    </div>
);