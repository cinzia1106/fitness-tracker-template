// src/services/GASBackend.ts

export const FOOD_CATEGORIES = {
    '蛋白質': { emoji: '🥩', label: 'Protein' },
    '碳水': { emoji: '🍚', label: 'Carbs' },
    '蔬菜': { emoji: '🥦', label: 'Veggies' },
    '水果': { emoji: '🍎', label: 'Fruits' },
    '脂肪': { emoji: '🥑', label: 'Fats' },
    '乳製品': { emoji: '🥛', label: 'Dairy' },
    '飲品': { emoji: '☕', label: 'Drinks' },
    '水': { emoji: '💧', label: 'Water' },
    '其他': { emoji: '🍽️', label: 'Others' },
} as const;

export type FoodCategoryType = keyof typeof FOOD_CATEGORIES;

export interface FoodItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    unit: string;
    category: FoodCategoryType;
}

export interface NutritionLog {
    rowIndex: number;
    time: string;
    date: string;
    mealName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    amount: number;
    unit: string;
    category: string;
}

export interface ComboItem {
    name: string;
    totalCalories: number;
    items: { name: string; amount: number; calories: number; unit: string; }[];
}

export interface WorkoutLog {
    rowIndex: number;
    type: 'Strength' | 'Aerobic';
    exercise: string;
    sets?: number;
    reps?: number;
    weight?: number;
    rpe?: number;
    time?: number;
    intensity?: string;
    heartRate?: number;
}

export interface RoutineDict {
    [key: string]: {
        exercise: string;
        w12: { sets: number; reps: string };
        w3: { sets: number; reps: string };
        note: string;
    }[];
}

export interface HistoryMap {
    [exerciseName: string]: {
        date: string;
        weight: number;
        reps: number;
    }
}

// [修改] 更新 BodyDataLog 介面
export interface BodyDataLog {
    rowIndex?: number;
    weight: number;
    waist: number;
    hip: number;
    gripL: number;
    gripR: number;
    bedTime: string; // HH:mm
    wakeTime: string; // HH:mm
    mood: number; // [修改] 1-5 數字
    menstrual: boolean;
}

// [新增] 最新數據介面
export interface LatestMetrics {
    weight: number;
    waist: number;
    hip: number;
    gripL: number;
    gripR: number;
}

export interface AnalyticsDataPoint {
    date: string; // YYYY-MM-DD
    weight: number | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sleep: number | null;
    mood: number | null;
    workoutCount: number;
}
// [修改] 改為讀取環境變數，如果沒讀到(公開版)，就用空字串或測試網址
const API_URL = import.meta.env.VITE_API_URL || "";

class GASBackendService {
    private isGAS = typeof window !== 'undefined' && (window as any).google && (window as any).google.script;

    private call(functionName: string, ...args: any[]): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.isGAS) {
                // [Mock] Body Data
                if (functionName === 'getAnalytics') {
                    const mock = [];
                    const today = new Date();
                    for (let i = 14; i >= 0; i--) {
                        const d = new Date(today); d.setDate(today.getDate() - i);
                        mock.push({
                            date: d.toISOString().split('T')[0],
                            weight: 75 + Math.random(),
                            calories: 2000 + Math.random() * 500,
                            protein: 150 + Math.random() * 30,
                            carbs: 200 + Math.random() * 50,
                            fat: 60 + Math.random() * 20,
                            sleep: 6 + Math.random() * 3,
                            mood: Math.floor(Math.random() * 5) + 1,
                            workoutCount: Math.random() > 0.5 ? 1 : 0
                        });
                    }
                    resolve(mock);
                    return;
                }
                if (functionName === 'getBodyData') {
                    resolve({ weight: 75.5, waist: 80, hip: 95, gripL: 45, gripR: 48, bedTime: "23:30", wakeTime: "07:30", mood: 4, menstrual: false });
                    return;
                }
                if (functionName === 'getLatestBodyMetrics') {
                    resolve({ weight: 75.0, waist: 80, hip: 95, gripL: 45, gripR: 48 });
                    return;
                }
                if (functionName === 'logBodyData') { resolve({ success: true }); return; }
                // ... (其他 Mock) ...
                if (functionName === 'getWorkouts') { resolve([]); return; }
                if (functionName === 'getWorkoutHistory') { resolve({}); return; }
                if (functionName === 'getRoutines') { resolve({}); return; }
                if (functionName === 'logWorkout' || functionName === 'deleteWorkout') { resolve({ success: true }); return; }
                if (functionName === 'getComboList') { resolve([]); return; }
                if (functionName === 'logCombo' || functionName === 'deleteNutrition' || functionName === 'updateNutrition') { resolve({ success: true }); return; }
                if (functionName === 'getWeeklyAerobic') { resolve({ totalMinutes: 0 }); return; }
                if (functionName === 'logBodyData') { resolve({ success: true }); return; }
                try {
                    const response = await fetch(API_URL, {
                        method: "POST",
                        headers: { "Content-Type": "text/plain;charset=utf-8" },
                        body: JSON.stringify({ action: functionName === 'processRequest' ? args[0].action : functionName, data: args[0]?.data || null })
                    });
                    const result = await response.json();
                    resolve(result);
                } catch (error) { console.error("API Error:", error); reject(error); }
                return;
            }
            (window as any).google.script.run
                .withSuccessHandler((res: string) => { try { resolve(JSON.parse(res)); } catch (e) { resolve(res); } })
                .withFailureHandler((err: any) => reject(err))
            [functionName](...args);
        });
    }

    // Nutrition
    async getFoodList() { return this.call('processRequest', { action: 'getFoodList' }); }
    async getNutritionLogs(dateStr: string) { return this.call('processRequest', { action: 'getNutrition', data: { date: dateStr } }); }
    async logNutrition(data: any) { return this.call('processRequest', { action: 'logNutrition', data }); }
    async deleteNutritionLog(rowIndex: number) { return this.call('processRequest', { action: 'deleteNutrition', data: { rowIndex } }); }
    async updateNutritionLog(rowIndex: number, mealName: string, newAmount: number) { return this.call('processRequest', { action: 'updateNutrition', data: { rowIndex, mealName, newAmount } }); }
    async getComboList() { return this.call('processRequest', { action: 'getComboList' }); }
    async logCombo(date: string, comboName: string) { return this.call('processRequest', { action: 'logCombo', data: { date, comboName } }); }
    async getWorkouts(dateStr: string) { return this.call('processRequest', { action: 'getWorkouts', data: { date: dateStr } }); }
    async logWorkout(data: Omit<WorkoutLog, 'rowIndex'> & { date: string, tags: string[] }) { return this.call('processRequest', { action: 'logWorkout', data }); }
    async deleteWorkout(rowIndex: number) { return this.call('processRequest', { action: 'deleteWorkout', data: { rowIndex } }); }
    async getRoutines() { return this.call('processRequest', { action: 'getRoutines' }); }
    async getWorkoutHistory(currentDate: string) { return this.call('processRequest', { action: 'getWorkoutHistory', data: { currentDate } }); }
    async getWeeklyAerobicTotal(dateStr: string) { return this.call('processRequest', { action: 'getWeeklyAerobic', data: { date: dateStr } }); }
    async getBodyData(dateStr: string) { return this.call('processRequest', { action: 'getBodyData', data: { date: dateStr } }); }
    async logBodyData(data: BodyDataLog & { date: string }) { return this.call('processRequest', { action: 'logBodyData', data }); }

    // [修改]
    async getLatestBodyMetrics() { return this.call('processRequest', { action: 'getLatestBodyMetrics' }); }
    async getAnalyticsData() { return this.call('processRequest', { action: 'getAnalytics' }); }
}

export const backend = new GASBackendService();