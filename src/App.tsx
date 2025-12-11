import { Dashboard } from './components/Dashboard';
import { WorkoutPage } from './components/WorkoutPage';
import { BodyDataPage } from './components/BodyDataPage';
import { AnalyticsPage } from './components/AnalyticsPage'; // [新增]
import { useStore } from './store/useStore';
import { Utensils, Dumbbell, UserRound, BarChart3 } from 'lucide-react'; // [新增] Icon

function App() {
  const { currentView, setView } = useStore();

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 font-sans pb-24">

      {/* 頁面內容區 */}
      {currentView === 'NUTRITION' && <Dashboard />}
      {currentView === 'WORKOUT' && <WorkoutPage />}
      {currentView === 'BODY' && <BodyDataPage />}
      {currentView === 'ANALYTICS' && <AnalyticsPage />}

      {/* 底部導航列 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-50">
        <div className="flex justify-between items-center max-w-md mx-auto h-16">

          <NavBtn view="NUTRITION" icon={Utensils} label="Nutrition" current={currentView} setView={setView} />
          <NavBtn view="WORKOUT" icon={Dumbbell} label="Workout" current={currentView} setView={setView} />
          <NavBtn view="BODY" icon={UserRound} label="Body" current={currentView} setView={setView} />
          <NavBtn view="ANALYTICS" icon={BarChart3} label="Data" current={currentView} setView={setView} />

        </div>
      </div>
    </div>
  )
}

const NavBtn = ({ view, icon: Icon, label, current, setView }: any) => (
  <button
    onClick={() => setView(view)}
    className={`flex flex-col items-center gap-1 w-16 transition-colors ${current === view ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
  >
    <div className={`p-1.5 rounded-xl transition-all ${current === view ? 'bg-gray-100 scale-110' : 'bg-transparent'}`}>
      <Icon className="w-5 h-5" strokeWidth={current === view ? 2.5 : 2} />
    </div>
    <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
  </button>
);

export default App