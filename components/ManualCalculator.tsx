import React, { useState, useRef } from 'react';
import { Plus, Trash2, Share2, Calculator, X } from 'lucide-react';
import { CalcStandard, Log } from '../types';
import { calculateVolume } from '../utils/timberCalc';

interface Props {
  logs: Log[];
  activeStandard: CalcStandard;
  onAddLog: (log: Omit<Log, 'id' | 'timestamp'>) => Promise<void>;
  onDeleteLog: (id: string) => void;
  onClearAll: () => void;
  onStandardChange: (s: CalcStandard) => void;
}

const ManualCalculator: React.FC<Props> = ({ 
  logs, activeStandard, onAddLog, onDeleteLog, onClearAll, onStandardChange 
}) => {
  const [diameter, setDiameter] = useState('');
  const [length, setLength] = useState('6.0');
  const [price, setPrice] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const totalVolume = logs.reduce((sum, l) => sum + l.volume, 0);
  const totalPrice = totalVolume * (parseFloat(price) || 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseFloat(diameter);
    const l = parseFloat(length);
    if (d > 0 && l > 0) {
      onAddLog({
        diameter: d,
        length: l,
        volume: calculateVolume(d, l, activeStandard)
      });
      setDiameter('');
      inputRef.current?.focus();
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };

  const shareReport = () => {
    const text = `🪵 ОТЧЕТ КУБАТУРНИКА\n` +
                 `Всего: ${logs.length} шт.\n` +
                 `Объем: ${totalVolume.toFixed(3)} м³\n` +
                 (price ? `Сумма: ${totalPrice.toLocaleString()} ₽` : '');
    
    if (navigator.share) {
      navigator.share({ title: 'Лес', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Данные скопированы');
    }
  };

  return (
    <div className="space-y-4">
      {/* Result Card */}
      <div className="bg-emerald-500 p-6 rounded-[2.5rem] text-zinc-950 emerald-glow transition-all active:scale-[0.98]">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase opacity-60 tracking-wider">Общий объем</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tighter">{totalVolume.toFixed(3)}</span>
              <span className="text-sm font-bold uppercase">м³</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase opacity-60 tracking-wider">Брёвен</p>
            <p className="text-3xl font-black">{logs.length}</p>
          </div>
        </div>
        {price && (
          <div className="mt-4 pt-4 border-t border-black/10 flex justify-between items-center">
             <span className="text-[10px] font-black uppercase opacity-60">Стоимость партии</span>
             <span className="text-xl font-black">{totalPrice.toLocaleString()} ₽</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="bg-zinc-900/50 border border-zinc-900 rounded-[2rem] p-5 space-y-4">
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase px-2">Диаметр (см)</label>
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              value={diameter}
              onChange={e => setDiameter(e.target.value)}
              placeholder="20"
              className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl p-4 text-2xl font-black focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase px-2">Длина (м)</label>
            <input
              type="number"
              inputMode="decimal"
              value={length}
              onChange={e => setLength(e.target.value)}
              placeholder="6.0"
              className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl p-4 text-2xl font-black focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="col-span-2 flex gap-2">
             <input
                type="number"
                placeholder="Цена за м³ (опционально)"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none"
             />
             <button 
                type="button"
                onClick={shareReport}
                className="p-3 bg-zinc-800 rounded-xl text-zinc-400 active:bg-emerald-500 active:text-white transition-all"
             >
                <Share2 size={20} />
             </button>
          </div>
          <button
            type="submit"
            disabled={!diameter}
            className={`col-span-2 py-5 rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl ${
              diameter ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-600 opacity-50'
            }`}
          >
            <Plus size={24} /> Добавить запись
          </button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Последние записи</h2>
          <button onClick={onClearAll} className="text-[9px] font-black text-zinc-700 uppercase hover:text-red-500 transition-colors">Очистить список</button>
        </div>
        
        {logs.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-zinc-900 rounded-[2rem] flex flex-col items-center justify-center text-zinc-800">
            <Calculator size={40} className="mb-2 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">Нет данных для отображения</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="bg-zinc-900/30 border border-zinc-900 p-3 pr-4 rounded-2xl flex justify-between items-center group animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-500">
                    {log.diameter}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black text-zinc-600 uppercase">L: {log.length}м</span>
                       <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
                       <span className="text-[9px] font-black text-zinc-600 uppercase">ГОСТ</span>
                    </div>
                    <p className="text-xl font-black text-zinc-200">{log.volume.toFixed(4)} <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">м³</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteLog(log.id)}
                  className="p-2 text-zinc-800 hover:text-red-500 active:scale-90 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualCalculator;