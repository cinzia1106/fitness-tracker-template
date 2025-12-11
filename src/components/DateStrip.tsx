import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    date: string;
    onChange: (date: string) => void;
}

export const DateStrip = ({ date, onChange }: Props) => {
    const currentDateObj = new Date(date);

    // 1. 產生 7 天 (-3 ~ +3)
    const days = [];
    for (let i = -3; i <= 3; i++) {
        const d = new Date(currentDateObj);
        d.setDate(d.getDate() + i);
        days.push(d);
    }

    const isToday = (d: Date) => {
        const today = new Date();
        return d.toDateString() === today.toDateString();
    };

    const toIsoString = (d: Date) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };

    const shiftDate = (days: number) => {
        const newDate = new Date(currentDateObj);
        newDate.setDate(newDate.getDate() + days);
        onChange(toIsoString(newDate));
    };

    return (
        // [RWD 修正] 移除 -mx-5，改用 w-full
        <div className="flex flex-col gap-2 mb-8 w-full">
            {/* 標題區 */}
            <div className="flex justify-between items-center px-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                    {currentDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>

                {!isToday(currentDateObj) && (
                    <button
                        onClick={() => onChange(toIsoString(new Date()))}
                        className="text-xs font-bold text-orange-500 bg-orange-50 px-4 py-2 rounded-full hover:bg-orange-100 transition"
                    >
                        Back to Today
                    </button>
                )}
            </div>

            {/* RWD 日期滑動條 */}
            <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between relative z-10 w-full">

                <button onClick={() => shiftDate(-7)} className="p-3 text-gray-300 hover:text-gray-600 rounded-full hover:bg-gray-50 transition">
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex-1 flex justify-around items-center px-2 gap-2">
                    {days.map((dayObj, index) => {
                        const dateStr = toIsoString(dayObj);
                        const isSelected = dateStr === date;
                        const todayMark = isToday(dayObj);

                        // 手機顯示 5 個，電腦顯示 7 個
                        const hideOnMobile = (index === 0 || index === 6) ? 'hidden lg:flex' : 'flex';

                        return (
                            <button
                                key={dateStr}
                                onClick={() => onChange(dateStr)}
                                className={`
                  ${hideOnMobile} flex-col items-center justify-center 
                  w-12 h-16 sm:w-16 sm:h-20 rounded-2xl transition-all duration-300 relative
                  ${isSelected ? 'bg-black text-white shadow-xl scale-110 z-10' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}
                `}
                            >
                                <span className={`text-[10px] sm:text-xs font-bold uppercase mb-1 ${isSelected ? 'text-gray-400' : ''}`}>
                                    {dayObj.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                                </span>

                                <span className={`text-xl sm:text-2xl font-black leading-none ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                    {dayObj.getDate()}
                                </span>

                                {todayMark && !isSelected && (
                                    <span className="absolute bottom-2 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <button onClick={() => shiftDate(7)} className="p-3 text-gray-300 hover:text-gray-600 rounded-full hover:bg-gray-50 transition">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};