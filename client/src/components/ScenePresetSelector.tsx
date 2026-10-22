import type { ScenePreset } from '../types';
import { SCENE_PRESET_OPTIONS } from '../utils/constants';

interface ScenePresetSelectorProps {
  selected: ScenePreset | undefined;
  onSelect: (preset: ScenePreset, promptTemplate: string) => void;
  disabled?: boolean;
}

export default function ScenePresetSelector({
  selected,
  onSelect,
  disabled,
}: ScenePresetSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SCENE_PRESET_OPTIONS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => !disabled && onSelect(preset.id, preset.promptTemplate)}
          disabled={disabled}
          className={`preset-card text-left transition-all duration-150 ${
            selected === preset.id ? 'selected' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-pressed={selected === preset.id}
        >
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-xs font-semibold text-primary leading-snug">
                {preset.label}
              </p>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">
                {preset.description}
              </p>
            </div>
            {selected === preset.id && (
              <div className="w-4 h-4 rounded-full bg-accent-500 flex-shrink-0 flex items-center justify-center mt-0.5">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                  <path
                    d="M2 5l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
          {preset.lightingHint && (
            <p className="text-xs text-accent-600 mt-1.5 font-medium">
              {preset.lightingHint}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}
