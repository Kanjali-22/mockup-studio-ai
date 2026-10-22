import { useState } from 'react';
import { ChevronDown, ShieldCheck, Sliders } from 'lucide-react';
import type { ModelId, OutputFormat } from '../types';
import { MODEL_OPTIONS } from '../utils/constants';

interface GenerationSettingsProps {
  model: ModelId;
  outputFormat: OutputFormat;
  strength: number;
  seed?: number;
  workflow: 'relight' | 'composite' | 'auto';
  removeBackground: boolean;
  productScale: number;
  positionX: number;
  positionY: number;
  contactShadow: boolean;
  colorMatch: boolean;
  debug: boolean;
  onModelChange: (model: ModelId) => void;
  onOutputFormatChange: (format: OutputFormat) => void;
  onStrengthChange: (strength: number) => void;
  onSeedChange: (seed: number | undefined) => void;
  onWorkflowChange: (workflow: 'relight' | 'composite' | 'auto') => void;
  onRemoveBackgroundChange: (remove: boolean) => void;
  onProductScaleChange: (scale: number) => void;
  onPositionXChange: (x: number) => void;
  onPositionYChange: (y: number) => void;
  onContactShadowChange: (shadow: boolean) => void;
  onColorMatchChange: (match: boolean) => void;
  onDebugChange: (debug: boolean) => void;
  disabled?: boolean;
}

export default function GenerationSettings({
  model,
  outputFormat,
  strength,
  seed,
  workflow,
  removeBackground,
  productScale,
  positionX,
  positionY,
  contactShadow,
  colorMatch,
  debug,
  onModelChange,
  onOutputFormatChange,
  onStrengthChange,
  onSeedChange,
  onWorkflowChange,
  onRemoveBackgroundChange,
  onProductScaleChange,
  onPositionXChange,
  onPositionYChange,
  onContactShadowChange,
  onColorMatchChange,
  onDebugChange,
  disabled,
}: GenerationSettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const selectedModel = MODEL_OPTIONS.find((m) => m.id === model) ?? MODEL_OPTIONS[0];

  return (
    <div className="space-y-4">
      {/* Product-Preserving Workflow Selector */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="workflow-select" className="label mb-0 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Product Fidelity Workflow
          </label>
        </div>
        <select
          id="workflow-select"
          value={workflow}
          onChange={(e) => onWorkflowChange(e.target.value as 'relight' | 'composite' | 'auto')}
          disabled={disabled}
          className="input w-full text-xs font-medium"
        >
          <option value="auto">Auto (Relight with 100% Composite Fallback)</option>
          <option value="relight">Stability AI: Replace Background & Relight</option>
          <option value="composite">100% Pixel-Preserving Sharp Composite</option>
        </select>
        <p className="text-[11px] text-muted mt-1 leading-normal">
          {workflow === 'relight'
            ? 'Uses Stability AI Replace Background and Relight to blend lighting seamlessly while preserving the subject.'
            : workflow === 'composite'
            ? 'Removes background, generates scene separately, and composites product with 100% untouched original pixels.'
            : 'Attempts photorealistic AI relighting first, with seamless fallback to sharp compositing.'}
        </p>
      </div>

      {/* Product Placement & Scaling Controls */}
      <div className="p-3.5 rounded-xl border border-divider bg-neutral-50/70 dark:bg-neutral-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-accent-600" />
            Product Placement & Scale
          </span>
          <span className="text-[11px] font-mono text-accent-600 font-medium">
            {Math.round(productScale * 100)}% scale
          </span>
        </div>

        {/* Product Scale */}
        <div>
          <div className="flex justify-between text-[11px] text-secondary mb-1">
            <span>Product Size / Scale</span>
            <span className="font-mono">{Math.round(productScale * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.30"
            max="0.95"
            step="0.05"
            value={productScale}
            onChange={(e) => onProductScaleChange(parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-neutral-700 accent-accent-500 cursor-pointer"
          />
        </div>

        {/* Horizontal Position X */}
        <div>
          <div className="flex justify-between text-[11px] text-secondary mb-1">
            <span>Horizontal Offset (X)</span>
            <span className="font-mono">{positionX > 0 ? `+${positionX}%` : `${positionX}%`}</span>
          </div>
          <input
            type="range"
            min="-40"
            max="40"
            step="5"
            value={positionX}
            onChange={(e) => onPositionXChange(parseInt(e.target.value, 10))}
            disabled={disabled}
            className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-neutral-700 accent-accent-500 cursor-pointer"
          />
        </div>

        {/* Vertical Position Y */}
        <div>
          <div className="flex justify-between text-[11px] text-secondary mb-1">
            <span>Vertical Offset (Y)</span>
            <span className="font-mono">{positionY > 0 ? `+${positionY}%` : `${positionY}%`}</span>
          </div>
          <input
            type="range"
            min="-40"
            max="40"
            step="5"
            value={positionY}
            onChange={(e) => onPositionYChange(parseInt(e.target.value, 10))}
            disabled={disabled}
            className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-neutral-700 accent-accent-500 cursor-pointer"
          />
        </div>

        {/* Toggles */}
        <div className="pt-2 border-t border-divider grid grid-cols-2 gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={removeBackground}
              onChange={(e) => onRemoveBackgroundChange(e.target.checked)}
              disabled={disabled}
              className="rounded text-accent-600 focus:ring-accent-500"
            />
            <span className="text-[11px] text-primary">Remove Background</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={contactShadow}
              onChange={(e) => onContactShadowChange(e.target.checked)}
              disabled={disabled}
              className="rounded text-accent-600 focus:ring-accent-500"
            />
            <span className="text-[11px] text-primary">Contact Shadow</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={colorMatch}
              onChange={(e) => onColorMatchChange(e.target.checked)}
              disabled={disabled}
              className="rounded text-accent-600 focus:ring-accent-500"
            />
            <span className="text-[11px] text-primary">Ambient Rim Light</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={debug}
              onChange={(e) => onDebugChange(e.target.checked)}
              disabled={disabled}
              className="rounded text-accent-600 focus:ring-accent-500"
            />
            <span className="text-[11px] text-primary">Debug Metadata</span>
          </label>
        </div>
      </div>

      {/* Model selector */}
      <div>
        <label htmlFor="model-select" className="label">
          Generation Model
        </label>
        <div className="relative">
          <select
            id="model-select"
            value={model}
            onChange={(e) => onModelChange(e.target.value as ModelId)}
            disabled={disabled}
            className="input w-full appearance-none pr-8 text-xs"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </div>
        <p className="text-[11px] text-muted mt-1">{selectedModel.description}</p>
      </div>

      {/* Output format */}
      <div>
        <label className="label">Output Format</label>
        <div className="flex gap-2">
          {(['png', 'jpeg', 'webp'] as OutputFormat[]).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => !disabled && onOutputFormatChange(fmt)}
              disabled={disabled}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 uppercase tracking-wide
                ${outputFormat === fmt
                  ? 'border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-300'
                  : 'border-divider bg-card text-secondary hover:border-accent-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced settings toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-secondary transition-colors"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
          />
          Advanced options (Seed)
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-3 animate-fade-in">
            {/* Image Influence (for diffusion fallback) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-secondary font-medium">Image Influence (Strength)</span>
                <span className="font-mono text-accent-600 font-medium">{strength.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="1.0"
                step="0.05"
                value={strength}
                onChange={(e) => onStrengthChange(parseFloat(e.target.value))}
                disabled={disabled}
                className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-neutral-700 accent-accent-500 cursor-pointer"
              />
            </div>

            {/* Seed */}
            <div>
              <label htmlFor="seed-input" className="label text-xs">
                Seed <span className="text-muted normal-case font-normal">(optional — for reproducible scenes)</span>
              </label>
              <input
                id="seed-input"
                type="number"
                min="0"
                max="4294967294"
                value={seed ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onSeedChange(val === '' ? undefined : parseInt(val, 10));
                }}
                disabled={disabled}
                placeholder="Random"
                className="input w-full text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
