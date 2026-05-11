type Props = {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  compact?: boolean;
  /** Нельзя добавить ещё (нет в наличии и т.п.); уменьшить можно */
  disableIncrease?: boolean;
};

export function QuantityStepper({ value, onIncrease, onDecrease, compact, disableIncrease }: Props) {
  if (value <= 0) {
    return (
      <button
        type="button"
        onClick={() => {
          if (!disableIncrease) onIncrease();
        }}
        disabled={disableIncrease}
        className={`${compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"} rounded-xl font-semibold ${
          disableIncrease
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-[var(--fresh-green)] text-white"
        }`}
      >
        +
      </button>
    );
  }

  return (
    <div className={`flex items-center ${compact ? "gap-1.5" : "gap-2"}`}>
      <button
        type="button"
        onClick={onDecrease}
        className={`${
          compact ? "w-6 h-6 text-xs" : "w-7 h-7 text-sm"
        } rounded-lg bg-gray-100 text-gray-700 font-semibold`}
      >
        -
      </button>
      <span className={`${compact ? "min-w-4 text-xs" : "min-w-5 text-sm"} text-center font-semibold`}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => {
          if (!disableIncrease) onIncrease();
        }}
        disabled={disableIncrease}
        className={`${
          compact ? "w-6 h-6 text-xs" : "w-7 h-7 text-sm"
        } rounded-lg font-semibold ${
          disableIncrease ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[var(--fresh-green)] text-white"
        }`}
      >
        +
      </button>
    </div>
  );
}

