import React from 'react';

const QuantityInput = ({ value, onChange, unit, disabled, error }) => {
  return (
    <div>
      <label htmlFor="quantity-input" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
        2. Quantity <span className="text-rose-500">*</span>
      </label>

      <div className="relative rounded-xl shadow-xs">
        <input
          type="number"
          id="quantity-input"
          name="quantity"
          step="any"
          min="0.001"
          placeholder="e.g. 10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'quantity-error' : 'quantity-unit-info'}
          className={`w-full pl-3.5 pr-20 py-2.5 rounded-xl border text-sm font-bold bg-white text-gray-900 transition-colors focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-600'
              : 'border-gray-300 focus:ring-forest-600/20 focus:border-forest-600'
          }`}
        />

        {/* Dynamic Unit Badge */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span
            id="quantity-unit-info"
            className="text-xs font-bold text-forest-950 bg-forest-50 border border-forest-200/80 px-2 py-0.5 rounded-md tracking-wide"
          >
            {unit}
          </span>
        </div>
      </div>

      {error ? (
        <p id="quantity-error" className="mt-1.5 text-xs text-rose-600 font-bold" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-1 text-[11px] text-gray-500 font-medium">
          Derived unit: <span className="font-semibold text-gray-700">{unit}</span>
        </p>
      )}
    </div>
  );
};

export default QuantityInput;
