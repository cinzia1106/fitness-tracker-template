import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { DateStrip } from './DateStrip';
import { backend } from '../services/GASBackend';
import {
    Scale, Ruler, Moon, BicepsFlexed, Check, Loader2,
    Smile, Flower2, AlertCircle, Sun, Clock, X
} from 'lucide-react';

export const BodyDataPage = () => {
    const { currentDate, setDate, bodyData, latestMetrics, fetchDailyData } = useStore();

    // Local State
    const [weight, setWeight] = useState('');
    const [waist, setWaist] = useState('');
    const [hip, setHip] = useState('');
    const [gripL, setGripL] = useState('');
    const [gripR, setGripR] = useState('');
    const [bedTime, setBedTime] = useState('');
    const [wakeTime, setWakeTime] = useState('');
    const [mood, setMood] = useState<number>(0);
    const [menstrual, setMenstrual] = useState(false);
    const [poop, setPoop] = useState(false); // [新增]

    // Time Picker State
    const [showPicker, setShowPicker] = useState(false);
    const [pickerType, setPickerType] = useState<'bed' | 'wake' | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const isSaturday = new Date(currentDate).getDay() === 6;

    useEffect(() => {
        if (bodyData) {
            setWeight(bodyData.weight ? String(bodyData.weight) : '');
            setWaist(bodyData.waist ? String(bodyData.waist) : '');
            setHip(bodyData.hip ? String(bodyData.hip) : '');
            setGripL(bodyData.gripL ? String(bodyData.gripL) : '');
            setGripR(bodyData.gripR ? String(bodyData.gripR) : '');
            setBedTime(bodyData.bedTime || '');
            setWakeTime(bodyData.wakeTime || '');
            setMood(typeof bodyData.mood === 'number' ? bodyData.mood : 0);
            setMenstrual(bodyData.menstrual || false);
            setPoop(bodyData.poop || false); // [新增]
        } else {
            setWeight(latestMetrics.weight ? String(latestMetrics.weight) : '');
            setWaist(latestMetrics.waist ? String(latestMetrics.waist) : '');
            setHip(latestMetrics.hip ? String(latestMetrics.hip) : '');
            setGripL(latestMetrics.gripL ? String(latestMetrics.gripL) : '');
            setGripR(latestMetrics.gripR ? String(latestMetrics.gripR) : '');
            setBedTime(''); setWakeTime('');
            setMood(0); setMenstrual(false); setPoop(false); // [新增]
        }
    }, [bodyData, currentDate, latestMetrics]);

    const handleSave = async (overrideData: any = {}) => {
        setIsSubmitting(true);
        try {
            await backend.logBodyData({
                date: currentDate,
                weight: Number(weight) || 0,
                waist: Number(waist) || 0,
                hip: Number(hip) || 0,
                gripL: Number(gripL) || 0,
                gripR: Number(gripR) || 0,
                bedTime,
                wakeTime,
                mood: mood || 0,
                menstrual,
                poop, // [新增]
                ...overrideData
            });
            await fetchDailyData();
        } catch (e) {
            alert('Failed to save');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDeviceTime = () => {
        const d = new Date();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleRecordNow = (type: 'bed' | 'wake') => {
        const timeStr = getDeviceTime();
        if (type === 'bed') {
            setBedTime(timeStr);
            handleSave({ bedTime: timeStr });
        } else {
            setWakeTime(timeStr);
            handleSave({ wakeTime: timeStr });
        }
    };

    const openPicker = (type: 'bed' | 'wake') => {
        setPickerType(type);
        setShowPicker(true);
    };

    const onTimePicked = (time: string) => {
        if (pickerType === 'bed') {
            setBedTime(time);
            handleSave({ bedTime: time });
        } else {
            setWakeTime(time);
            handleSave({ wakeTime: time });
        }
        setShowPicker(false);
    };

    const MOOD_EMOJIS = ['😭', '😟', '😐', '🙂', '😀'];

    return (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
            <DateStrip date={currentDate} onChange={setDate} />

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="p-2 bg-purple-50 rounded-xl text-purple-500"><Scale className="w-5 h-5" /></span>
                    Body Metrics
                </h2>

                <div className="space-y-8">

                    {/* 1. Weight */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Daily Check</label>
                        <div className="bg-purple-50 p-4 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-purple-500"><Scale className="w-6 h-6" /></div>
                                <span className="font-bold text-gray-700 text-lg">Weight</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <input
                                    type="number" step="0.1" placeholder="-"
                                    className="w-24 bg-transparent text-right text-3xl font-black text-purple-600 placeholder-purple-300 focus:outline-none"
                                    value={weight} onChange={e => setWeight(e.target.value)}
                                />
                                <span className="text-sm font-bold text-purple-400">kg</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Saturday Check */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Weekly Check (Sat)</label>
                            {!isSaturday && (
                                <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Not Saturday
                                </span>
                            )}
                        </div>
                        <div className={`grid grid-cols-2 gap-3 transition-opacity ${!isSaturday ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                            <InputCard label="Waist" unit="cm" value={waist} onChange={setWaist} icon={Ruler} color="text-blue-500" disabled={!isSaturday} />
                            <InputCard label="Hip" unit="cm" value={hip} onChange={setHip} icon={Ruler} color="text-cyan-500" disabled={!isSaturday} />
                            <InputCard label="Grip (L)" unit="kg" value={gripL} onChange={setGripL} icon={BicepsFlexed} color="text-orange-500" disabled={!isSaturday} />
                            <InputCard label="Grip (R)" unit="kg" value={gripR} onChange={setGripR} icon={BicepsFlexed} color="text-orange-500" disabled={!isSaturday} />
                        </div>
                    </div>

                    {/* 3. Sleep Tracker */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Sleep Tracker</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => openPicker('bed')}
                                className={`relative overflow-hidden p-6 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 transition-all active:scale-95 border group ${bedTime ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-200' : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'}`}
                            >
                                <Moon className={`w-8 h-8 ${bedTime ? 'text-white' : 'text-indigo-400'}`} strokeWidth={2} />
                                <span className={`text-xs font-bold uppercase tracking-wide ${bedTime ? 'text-indigo-100' : 'text-gray-400'}`}>Bedtime</span>
                                {bedTime ? <div className="text-3xl font-black tracking-tight mt-1">{bedTime}</div> : <span className="text-sm font-medium">Tap to Record</span>}
                                <div onClick={(e) => { e.stopPropagation(); handleRecordNow('bed'); }} className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm p-2 rounded-xl shadow-sm z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white/40"><Clock className={`w-5 h-5 ${bedTime ? 'text-white' : 'text-indigo-400'}`} /></div>
                            </button>

                            <button
                                onClick={() => openPicker('wake')}
                                className={`relative overflow-hidden p-6 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 transition-all active:scale-95 border group ${wakeTime ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200' : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'}`}
                            >
                                <Sun className={`w-8 h-8 ${wakeTime ? 'text-white' : 'text-orange-400'}`} strokeWidth={2} />
                                <span className={`text-xs font-bold uppercase tracking-wide ${wakeTime ? 'text-orange-100' : 'text-gray-400'}`}>Wake Up</span>
                                {wakeTime ? <div className="text-3xl font-black tracking-tight mt-1">{wakeTime}</div> : <span className="text-sm font-medium">Tap to Record</span>}
                                <div onClick={(e) => { e.stopPropagation(); handleRecordNow('wake'); }} className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm p-2 rounded-xl shadow-sm z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white/40"><Clock className={`w-5 h-5 ${wakeTime ? 'text-white' : 'text-orange-400'}`} /></div>
                            </button>
                        </div>
                    </div>

                    {/* 4. Mood & Period & Poop */}
                    <div className="grid grid-cols-1 gap-4">
                        {/* Mood */}
                        <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100">
                            <div className="flex items-center gap-2 mb-3 text-yellow-600 font-bold">
                                <Smile className="w-5 h-5" /> Mood
                            </div>
                            <div className="flex justify-between text-2xl">
                                {MOOD_EMOJIS.map((emoji, idx) => {
                                    const score = idx + 1;
                                    const isSelected = mood === score;
                                    return (
                                        <button key={score} onClick={() => setMood(score)} className={`transition-transform duration-200 ${isSelected ? 'scale-125 drop-shadow-md grayscale-0' : 'grayscale opacity-40 hover:opacity-100 hover:grayscale-0'}`}>{emoji}</button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Toggles (Period & Poop) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 flex flex-col justify-between h-24">
                                <div className="flex items-center gap-2 text-pink-600 font-bold">
                                    <Flower2 className="w-5 h-5" /> Period
                                </div>
                                <button
                                    onClick={() => setMenstrual(!menstrual)}
                                    className={`w-full py-2 rounded-xl font-bold text-sm transition-colors ${menstrual ? 'bg-pink-500 text-white shadow-md' : 'bg-white text-gray-400 border border-gray-200'}`}
                                >
                                    {menstrual ? 'Yes' : 'No'}
                                </button>
                            </div>

                            {/* [新增] Poop Tracker */}
                            <div className="bg-stone-100 p-4 rounded-2xl border border-stone-200 flex flex-col justify-between h-24">
                                <div className="flex items-center gap-2 text-stone-600 font-bold">
                                    <span className="text-xl">💩</span> Poop
                                </div>
                                <button
                                    onClick={() => setPoop(!poop)}
                                    className={`w-full py-2 rounded-xl font-bold text-sm transition-colors ${poop ? 'bg-stone-600 text-white shadow-md' : 'bg-white text-gray-400 border border-gray-200'}`}
                                >
                                    {poop ? 'Yes' : 'No'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => handleSave()}
                        disabled={isSubmitting}
                        className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 mt-4"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Save Daily Log</>}
                    </button>

                </div>

                <TimePickerModal
                    isOpen={showPicker}
                    onClose={() => setShowPicker(false)}
                    onConfirm={onTimePicked}
                    initialValue={pickerType === 'bed' ? bedTime : wakeTime}
                    title={pickerType === 'bed' ? 'Bedtime' : 'Wake Up Time'}
                />
            </div>
        </div>
    );
};

const InputCard = ({ label, unit, value, onChange, icon: Icon, color, disabled }: any) => (
    <div className={`bg-gray-50 p-3 rounded-2xl flex flex-col justify-center gap-1 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <span className={`text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1`}>
            <Icon className={`w-3 h-3 ${color}`} /> {label}
        </span>
        <div className="flex items-baseline gap-1">
            <input
                type="number" step="0.1"
                placeholder="-"
                className="w-full bg-transparent text-xl font-black text-gray-900 placeholder-gray-300 focus:outline-none"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
            <span className="text-[10px] font-bold text-gray-400">{unit}</span>
        </div>
    </div>
);

const TimePickerModal = ({ isOpen, onClose, onConfirm, initialValue, title }: any) => {
    const [hour, setHour] = useState('00');
    const [minute, setMinute] = useState('00');

    useEffect(() => {
        if (isOpen) {
            let time = initialValue;
            if (!time) {
                const d = new Date();
                const h = String(d.getHours()).padStart(2, '0');
                const m = String(d.getMinutes()).padStart(2, '0');
                time = `${h}:${m}`;
            }
            const [h, m] = time.split(':');
            setHour(h || '00');
            setMinute(m || '00');
        }
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden pb-safe h-[400px] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white z-10">
                    <button onClick={onClose} className="p-2 text-gray-400"><X className="w-6 h-6" /></button>
                    <span className="font-bold text-lg">{title}</span>
                    <button onClick={() => onConfirm(`${hour}:${minute}`)} className="p-2 text-blue-600 font-bold"><Check className="w-6 h-6" /></button>
                </div>
                <div className="flex-1 flex relative overflow-hidden">
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-14 bg-gray-100/50 -z-10 mx-4 rounded-xl pointer-events-none" />
                    <div className="flex-1 overflow-y-auto snap-y snap-mandatory no-scrollbar py-32 text-center">
                        {hours.map(h => (
                            <div key={h} onClick={() => setHour(h)} className={`snap-center h-14 flex items-center justify-center text-3xl font-bold cursor-pointer transition-all ${hour === h ? 'text-black scale-110' : 'text-gray-300 scale-90'}`}>{h}</div>
                        ))}
                        <div className="h-32"></div>
                    </div>
                    <div className="flex items-center justify-center font-black text-3xl pb-2 text-gray-300">:</div>
                    <div className="flex-1 overflow-y-auto snap-y snap-mandatory no-scrollbar py-32 text-center">
                        {minutes.map(m => (
                            <div key={m} onClick={() => setMinute(m)} className={`snap-center h-14 flex items-center justify-center text-3xl font-bold cursor-pointer transition-all ${minute === m ? 'text-black scale-110' : 'text-gray-300 scale-90'}`}>{m}</div>
                        ))}
                        <div className="h-32"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};