import { PieChart, Pie, Cell, Label } from 'recharts';

interface Props {
    current: number;
    target: number;
}

export const CalorieGauge = ({ current, target }: Props) => {
    const percentage = Math.min((current / target) * 100, 100);

    // 圓餅圖的資料：[已完成, 剩餘]
    const data = [
        { name: 'Consumed', value: current },
        { name: 'Remaining', value: Math.max(0, target - current) },
    ];

    const remaining = target - current;

    return (
        <div className="relative flex flex-col items-center justify-center -mt-4">
            <PieChart width={300} height={160}>
                <Pie
                    data={data}
                    cx={150}
                    cy={140} // 圓心往下移，只顯示上半圓
                    startAngle={180}
                    endAngle={0}
                    innerRadius={85}
                    outerRadius={100}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                >
                    {/* 進度條顏色：漸層橘 */}
                    <Cell key="consumed" fill="url(#colorGradient)" />
                    {/* 背景顏色：淺灰 */}
                    <Cell key="remaining" fill="#f3f4f6" />
                </Pie>

                {/* 定義漸層色 */}
                <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f97316" /> {/* orange-500 */}
                        <stop offset="100%" stopColor="#ef4444" /> {/* red-500 */}
                    </linearGradient>
                </defs>
            </PieChart>

            {/* 中間的文字資訊 */}
            <div className="absolute bottom-0 text-center pb-2">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Remaining</p>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                    {remaining}
                </h2>
                <p className="text-sm text-gray-500 font-medium">kcal</p>
            </div>
        </div>
    );
};