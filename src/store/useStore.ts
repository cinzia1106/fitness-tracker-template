import { create } from 'zustand'
import { backend, type NutritionLog, type WorkoutLog, type RoutineDict, type HistoryMap, type BodyDataLog, type LatestMetrics, type AnalyticsDataPoint } from '../services/GASBackend'

interface AppState {
    currentView: 'NUTRITION' | 'WORKOUT' | 'BODY' | 'ANALYTICS'; // [新增] ANALYTICS
    currentDate: string;

    // Nutrition
    caloriesTarget: number;
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
    waterTarget: number;
    caloriesConsumed: number;
    proteinConsumed: number;
    carbsConsumed: number;
    fatConsumed: number;
    dailyLogs: NutritionLog[];

    // Workout
    workoutLogs: WorkoutLog[];
    routines: RoutineDict;
    cycleWeek: 1 | 2 | 3;
    selectedRoutine: string | null;
    workoutHistory: HistoryMap;
    aerobicWeeklyGoal: number;
    aerobicWeeklyCurrent: number;

    // Body Data
    bodyData: BodyDataLog | null;
    latestMetrics: LatestMetrics;

    // [新增] Analytics Data
    analyticsData: AnalyticsDataPoint[];

    workoutDone: boolean;
    isLoading: boolean;

    // Actions
    setView: (view: 'NUTRITION' | 'WORKOUT' | 'BODY' | 'ANALYTICS') => void;
    setDate: (date: string) => void;
    fetchDailyData: () => Promise<void>;
    fetchAnalytics: () => Promise<void>; // [新增]
    deleteLog: (rowIndex: number) => Promise<void>;
    deleteWorkoutLog: (rowIndex: number) => Promise<void>;
    toggleWorkout: () => void;
    setCycleWeek: (week: 1 | 2 | 3) => void;
    setSelectedRoutine: (name: string | null) => void;
    fetchRoutines: () => Promise<void>;
}

const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getPersistedWeek = (): 1 | 2 | 3 => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('cycleWeek');
        if (saved) return Number(saved) as 1 | 2 | 3;
    }
    return 1;
};

export const useStore = create<AppState>((set, get) => ({
    currentView: 'NUTRITION',
    currentDate: getToday(),

    caloriesTarget: 2500,
    proteinTarget: 180,
    carbsTarget: 250,
    fatTarget: 70,
    waterTarget: 3000,

    caloriesConsumed: 0,
    proteinConsumed: 0,
    carbsConsumed: 0,
    fatConsumed: 0,

    dailyLogs: [],
    workoutLogs: [],
    routines: {},
    cycleWeek: getPersistedWeek(),
    selectedRoutine: null,
    workoutHistory: {},
    aerobicWeeklyGoal: 150,
    aerobicWeeklyCurrent: 0,

    bodyData: null,
    latestMetrics: { weight: 0, waist: 0, hip: 0, gripL: 0, gripR: 0 },
    analyticsData: [], // [新增]

    workoutDone: false,
    isLoading: false,

    setView: (view) => set({ currentView: view }),
    setCycleWeek: (week) => { localStorage.setItem('cycleWeek', String(week)); set({ cycleWeek: week }); },
    setSelectedRoutine: (name) => set({ selectedRoutine: name }),

    setDate: (date) => {
        set({ currentDate: date });
        get().fetchDailyData();
    },

    fetchDailyData: async () => {
        const { currentDate } = get();
        set({ isLoading: true });
        try {
            const [nutriLogs, workLogs, history, aerobic, body, latest] = await Promise.all([
                backend.getNutritionLogs(currentDate),
                backend.getWorkouts(currentDate),
                backend.getWorkoutHistory(currentDate),
                backend.getWeeklyAerobicTotal(currentDate),
                backend.getBodyData(currentDate),
                backend.getLatestBodyMetrics()
            ]);

            let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
            if (Array.isArray(nutriLogs)) {
                nutriLogs.forEach((log: any) => {
                    totalCalories += log.calories || 0;
                    totalProtein += log.protein || 0;
                    totalCarbs += log.carbs || 0;
                    totalFat += log.fat || 0;
                });
            }

            set({
                caloriesConsumed: totalCalories,
                proteinConsumed: totalProtein,
                carbsConsumed: totalCarbs,
                fatConsumed: totalFat,
                dailyLogs: Array.isArray(nutriLogs) ? nutriLogs : [],
                workoutLogs: Array.isArray(workLogs) ? workLogs : [],
                workoutHistory: history || {},
                aerobicWeeklyCurrent: aerobic?.totalMinutes || 0,
                bodyData: body,
                latestMetrics: latest || { weight: 0, waist: 0, hip: 0, gripL: 0, gripR: 0 },
                isLoading: false
            });

        } catch (error) {
            console.error(error);
            set({ isLoading: false, dailyLogs: [], workoutLogs: [], bodyData: null });
        }
    },

    // [新增] 抓取分析資料
    fetchAnalytics: async () => {
        set({ isLoading: true });
        try {
            const data = await backend.getAnalyticsData();
            set({ analyticsData: data, isLoading: false });
        } catch (e) {
            console.error(e);
            set({ isLoading: false });
        }
    },

    fetchRoutines: async () => { try { const data = await backend.getRoutines(); set({ routines: data }); } catch (e) { console.error(e); } },
    deleteLog: async (rowIndex) => { set({ isLoading: true }); try { await backend.deleteNutritionLog(rowIndex); await get().fetchDailyData(); } catch (e) { alert("Delete failed"); set({ isLoading: false }); } },
    deleteWorkoutLog: async (rowIndex) => { set({ isLoading: true }); try { await backend.deleteWorkout(rowIndex); await get().fetchDailyData(); } catch (e) { alert("Delete failed"); set({ isLoading: false }); } },
    toggleWorkout: () => set((state) => ({ workoutDone: !state.workoutDone })),
}))