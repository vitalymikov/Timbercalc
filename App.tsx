import React, { useState, useEffect, useRef } from 'react';
import { Plus, Share2, History, Package, Info, X, Calculator, Trash2 } from 'lucide-react';

// --- Константы ---
enum CalcStandard {
  GOST = 'ГОСТ 2708-75',
  CYLINDER = 'Цилиндр (Huber)'
}

interface LogEntry {
  id: string;
  diameter: number;
  length: number;
  volume: number;
  timestamp: string;
}

// --- Логика расчета ---
const calculateVolume = (d: number, l: number, std: CalcStandard): number => {
  if (std === CalcStandard.GOST) {
    // Аппроксимация ГОСТ 2708-75
    const volume = (0.00007854 * d * d * l) * (1 + 0.005 * l);
    return Number(volume.toFixed(4));
  }
  const dM = d / 100;
  const vol = (Math.PI * Math.pow(dM / 2, 2) * l);
  return Number(vol.toFixed(4));
};

const App: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('timber_v8');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [diameter, setDiameter] = useState('');
  const [length, setLength] = useState('6.0');
  const [price, setPrice] = useState('');
  const [standard, setStandard] = useState<CalcStandard>(CalcStandard.GOST);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('timber_v8', JSON.stringify(logs));
  }, [logs]);

  const totalVolume = logs.reduce((sum, l) => sum + l.volume, 0);
  const totalPrice = totalVolume * (parseFloat(price) || 0);

  const addLog = (e?: React.FormEvent) => {
    e?.preventDefault();
    const d = parseFloat(diameter);
    const l = parseFloat(length);
    if (d > 0 && l > 0) {
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        diameter: d,
        length: l,
        volume: calculateVolume(d, l, standard),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setLogs([newLog, ...logs]);
      setDiameter('');
      inputRef.current?.focus();
      if (navigator.vibrate) navigator.vibrate(20);
    }
  };

  const deleteLog = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  const shareReport = () => {
    const text = `🪵 КУБАТУРНИК ОТЧЕТ\nКол-во: ${logs.length}\nОбъем: ${totalVolume.toFixed(3)} м³\n${price ? `Сумма: ${totalPrice.toLocaleString()} ₽` : ''}`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Скопировано!');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      <header className="p-5 border-b border-zinc-900 glass z-50 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black italic uppercase tracking-tighter">Timber<span className="text-emerald-500">Calc</span></h1>
          <p className="text-[10px] font-bold text-zinc-600 uppercase">Pro v8</p>
        </div>
        <button onClick={shareReport} className="p-2 bg-zinc-900 rounded-xl text-zinc-500 active:scale-90 transition-all">
          <Share2 size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-32">
        <div className="bg-emerald-500 p-6 rounded-[2rem] text-zinc-950 emerald-glow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase opacity-60">Итого</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black tracking-tighter">{totalVolume.toFixed(3)}</span>
                <span className="text-sm font-bold opacity-70">м³</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase opacity-60">Штук</p>
              <p className="text-3xl font-black">{logs.length}</p>
            </div>
          </div>
          {price && (
            <div className="mt-4 pt-4 border-t border-black/10 flex justify-between items-center font-black">
              <span className="text-[10px] uppercase opacity-60">Стоимость</span>
              <span className="text-xl">{totalPrice.toLocaleString()} ₽</span>
            </div>
          )}
        </div>

        <div className="bg-zinc-900/50 p-5 rounded-[2rem] border border-zinc-900 space-y-4 shadow-xl">
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {Object.values(CalcStandard).map(std => (
              <button
                key={std}
                onClick={() => setStandard(std)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${standard === std ? 'bg-zinc-100 text-zinc-950 shadow-lg' : 'text-zinc-600'}`}
              >
                {std === CalcStandard.GOST ? 'ГОСТ' : 'Формула'}
              </button>
            ))}
          </div>

          <form onSubmit={addLog} className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-600 uppercase px-2">Диаметр (см)</label>
              <input
                ref={inputRef}
                type="number"
                inputMode="decimal"
                value={diameter}
                onChange={e => setDiameter(e.target.value)}
                placeholder="20"
                className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl p-4 text-2xl font-black focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-600 uppercase px-2">Длина (м)</label>
              <input
                type="number"
                inputMode="decimal"
                value={length}
                onChange={e => setLength(e.target.value)}
                placeholder="6.0"
                className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl p-4 text-2xl font-black focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                placeholder="Цена за куб (опционально)"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-xs font-bold text-zinc-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!diameter}
              className={`col-span-2 py-5 rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl ${diameter ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-700'}`}
            >
              <Plus size={24} /> Добавить
            </button>
          </form>
        </div>

        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-2xl flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center font-black text-emerald-500 text-sm italic">
                  {log.diameter}
                </div>
                <div>
                  <p className="text-[9px] font-black text-zinc-600 uppercase italic">L: {log.length}м • {log.timestamp}</p>
                  <p className="text-xl font-black">{log.volume.toFixed(4)} <span className="text-[10px] text-zinc-700">м³</span></p>
                </div>
              </div>
              <button onClick={() => deleteLog(log.id)} className="p-2 text-zinc-800 active:text-red-500">
                <X size={18} />
              </button>
            </div>
          ))}
          {logs.length > 0 && (
            <button onClick={() => window.confirm('Очистить список?') && setLogs([])} className="w-full py-4 text-[9px] font-black text-zinc-800 uppercase tracking-widest">
              Очистить историю
            </button>
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-zinc-900 p-4 pb-10 flex justify-around">
        <button className="flex flex-col items-center gap-1 text-emerald-500"><Package size={20} /><span className="text-[9px] font-bold uppercase">Расчет</span></button>
        <button className="flex flex-col items-center gap-1 text-zinc-700"><History size={20} /><span className="text-[9px] font-bold uppercase tracking-tighter">История</span></button>
        <button className="flex flex-col items-center gap-1 text-zinc-700"><Info size={20} /><span className="text-[9px] font-bold uppercase tracking-tighter">Справка</span></button>
      </nav>
    </div>
  );
};

export default App;