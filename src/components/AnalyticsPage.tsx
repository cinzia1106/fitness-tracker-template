import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, LineChart, Line, ComposedChart
} from 'recharts';
import { TrendingUp, Utensils, Moon } from 'lucide-react';

export const AnalyticsPage = () => {
    const { fetchAnalytics, analyticsData, isLoading } = useStore();

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // 格式化日期 X 軸顯示 (MM/DD)
    const formatXAxis = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 animate-fade-in">
            <h2 className="text-2xl font-black text-gray-900 mb-6 px-1">Data Analytics</h2>

            {isLoading ? (
                <div className="flex justify-center py-20 text-gray-400">Loading charts...</div>
            ) : (
                <div className="space-y-8">

                    {/* 1. Weight Trend */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-500 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
                            <h3 className="font-bold text-gray-700">Weight Trend</h3>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analyticsData}>
                                    <defs>
                                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        labelFormatter={(l) => new Date(l).toDateString()}
                                    />
                                    <Area type="monotone" dataKey="weight" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={3} connectNulls />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Calories & Macros */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-orange-50 text-orange-500 rounded-xl"><Utensils className="w-5 h-5" /></div>
                            <h3 className="font-bold text-gray-700">Calories & Macros</h3>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analyticsData} stackOffset="sign">
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    {/* Stacked Bars */}
                                    <Bar dataKey="protein" stackId="a" fill="#f43f5e" name="Protein" /> {/* Rose */}
                                    <Bar dataKey="carbs" stackId="a" fill="#3b82f6" name="Carbs" />   {/* Blue */}
                                    <Bar dataKey="fat" stackId="a" fill="#eab308" name="Fat" />       {/* Yellow */}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. Sleep & Mood */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl"><Moon className="w-5 h-5" /></div>
                            <h3 className="font-bold text-gray-700">Sleep & Mood</h3>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={analyticsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="left" domain={[0, 12]} hide />
                                    <YAxis yAxisId="right" domain={[0, 6]} orientation="right" hide />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    <Legend />

                                    <Bar yAxisId="left" dataKey="sleep" barSize={10} fill="#6366f1" radius={[4, 4, 0, 0]} name="Sleep (hr)" />
                                    <Line yAxisId="right" type="monotone" dataKey="mood" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} name="Mood (1-5)" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};