import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { type MetalData } from '../data/metals';

type Unit = 'ozt' | 'g' | 'kg' | 'lb';

const UNIT_CONVERSIONS: Record<Unit, number> = {
  ozt: 1,          // troy ounce (base)
  g:   0.032151,   // 1 gram = 0.032151 troy oz
  kg:  32.1507,    // 1 kg = 32.1507 troy oz
  lb:  14.5833,    // 1 lb = 14.5833 troy oz
};

const UNIT_LABELS: Record<Unit, string> = {
  ozt: 'ozt',
  g:   'g',
  kg:  'kg',
  lb:  'lb',
};

interface ConversionCardProps {
  metal: MetalData;
}

export const ConversionCard = ({ metal }: ConversionCardProps) => {
  const [amount, setAmount] = useState<string>('1.00');
  const [unit, setUnit] = useState<Unit>('ozt');

  const numericAmount = parseFloat(amount) || 0;

  // Convert input amount to troy oz first, then multiply by spot price
  const troyOzAmount = numericAmount * UNIT_CONVERSIONS[unit];
  const result = troyOzAmount * metal.price;

  return (
    <div className="rounded-lg bg-black border-2 border-white/10 p-5 hover:border-white/20">
      <h3 className="text-sm font-medium text-white mb-4">Quick Convert</h3>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 bg-transparent border-2 border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-white/30 tabular-nums"
          placeholder="1.00"
        />
        <div className="relative">
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="bg-black border-2 border-white/10 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer appearance-none">
            {(Object.keys(UNIT_CONVERSIONS) as Unit[]).map((u) => (
              <option key={u} value={u}>{UNIT_LABELS[u]}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-surface-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="flex justify-center my-3 text-surface-500">
        <ChevronDown className="w-4 h-4" />
      </div>

      <div className="border-2 border-amber-500/20 bg-amber-500/5 rounded-lg px-4 py-2 flex items-baseline gap-2">
        <span className="text-lg font-semibold text-amber-500 tabular-nums">
          ${result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-xs text-surface-500">USD</span>
      </div>

      <p className="text-xs text-surface-500 mt-3 text-center">
        {numericAmount} {unit} {metal.name} = ${result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
      </p>
    </div>
  );
};