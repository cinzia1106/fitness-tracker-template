// ... (前段常數保持不變) ...
export const FOOD_CATEGORIES = { /*...*/ } as const;
export type FoodCategoryType = keyof typeof FOOD_CATEGORIES;
export interface FoodItem { /*...*/ }
export interface NutritionLog { /*...*/ }
export interface ComboItem { /*...*/ }
export interface WorkoutLog { /*...*/ }
export interface RoutineDict { /*...*/ }
export interface HistoryMap { /*...*/ }

// [修改] Body Data 介面
export interface BodyDataLog {
    rowIndex?: number;
    weight: number;
    waist: number;
    hip: number;
    gripL: number;
    gripR: number;
    bedTime: string; // HH:mm
    wakeTime: string; // HH:mm
    mood: number;
    menstrual: boolean;
    poop: boolean; // [新增]
}

export interface LatestMetrics {
    weight: number;
    waist: number;
    hip: number;
    gripL: number;
    gripR: number;
}

export interface AnalyticsDataPoint { /*...*/ }

const API_URL = "https://script.google.com/macros/s/AKfycbx......./exec";

class GASBackendService {
    private isGAS = typeof window !== 'undefined' && (window as any).google && (window as any).google.script;

    private call(functionName: string, ...args: any[]): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.isGAS) {
                // [Mock]
                if (functionName === 'getBodyData') {
                    resolve({ weight: 75.5, waist: 80, hip: 95, gripL: 45, gripR: 48, bedTime: "23:30", wakeTime: "07:30", mood: 4, menstrual: false, poop: false });
                    return;
                }
                if (functionName === 'getLatestBodyMetrics') { resolve({ weight: 75.0, waist: 80, hip: 95, gripL: 45, gripR: 48 }); return; }
                if (functionName === 'logBodyData') { resolve({ success: true }); return; }
                // ... (其他 Mock)
                if (functionName === 'getWorkouts') { resolve([]); return; }
                if (functionName === 'getWorkoutHistory') { resolve({}); return; }
                if (functionName === 'getRoutines') { resolve({}); return; }
                if (functionName === 'logWorkout' || functionName === 'deleteWorkout') { resolve({ success: true }); return; }
                if (functionName === 'getComboList') { resolve([]); return; }
                if (functionName === 'logCombo' || functionName === 'deleteNutrition' || functionName === 'updateNutrition') { resolve({ success: true }); return; }
                if (functionName === 'getWeeklyAerobic') { resolve({ totalMinutes: 0 }); return; }
                if (functionName === 'getAnalytics') { resolve([]); return; }
                if (functionName === 'getNutritionLogs') { resolve([]); return; }
                if (functionName === 'getFoodList') { resolve([]); return; }

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

    // ... (其他方法保持不變) ...
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
    async getLatestBodyMetrics() { return this.call('processRequest', { action: 'getLatestBodyMetrics' }); }
    async logBodyData(data: BodyDataLog & { date: string }) { return this.call('processRequest', { action: 'logBodyData', data }); }
    async getAnalyticsData() { return this.call('processRequest', { action: 'getAnalytics' }); }
}

export const backend = new GASBackendService();