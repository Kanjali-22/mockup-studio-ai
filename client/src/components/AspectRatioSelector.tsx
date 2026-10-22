import type { AspectRatio } from '../types';
import { ASPECT_RATIO_OPTIONS } from '../utils/constants';

interface AspectRatioSelectorProps {
  selected: AspectRatio;
  onSelect: (ratio: AspectRatio) => void;
  disabled?: boolean;
}

export default function AspectRatioSelector({
  selected,
  onSelect,
  disabled,
}: AspectRatioSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {ASPECT_RATIO_OPTIONS.map((option) => {
        const isSelected = selected === option.value;
        // Normalize for display (max dimension = 36px)
        const maxDim = 36;
        const scale = maxDim / Math.max(option.widthRatio, option.heightRatio);
        const w = Math.round(option.widthRatio * scale);
        const h = Math.round(option.heightRatio * scale);

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && onSelect(option.value)}
            disabled={disabled}
            className={`flex flex-col items-center gap-2 p-2.5 rounded-lg border transition-all duration-150 text-center
              ${isSelected
                ? 'border-accent-500 bg-accent-50'
                : 'border-default bg-card hover:border-accent-300 hover:bg-accent-50/30'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-pressed={isSelected}
            title={`${option.label} (${option.value})`}
          >
            {/* Visual ratio rectangle */}
            <div
              className={`rounded border-2 flex-shrink-0 transition-colors duration-150 ${
                isSelected ? 'border-accent-500 bg-accent-100' : 'border-charcoal-300 bg-gray-100'
              }`}
              style={{ width: `${w}px`, height: `${h}px` }}
            />
            <div>
              <p className={`text-xs font-semibold leading-none ${isSelected ? 'text-accent-700' : 'text-primary'}`}>
                {option.label}
              </p>
              <p className="text-xs text-muted mt-0.5 leading-snug">{option.value}</p>
              <p className="text-xs text-muted leading-snug" style={{ fontSize: '10px' }}>
                {option.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
