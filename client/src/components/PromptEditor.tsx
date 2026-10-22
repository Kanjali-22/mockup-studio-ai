import { useRef, useState } from 'react';
import { Sparkles, X, ChevronDown } from 'lucide-react';
import { buildPrompt } from '../utils/promptBuilder';
import type { ProductCategory, ScenePreset } from '../types';

interface PromptEditorProps {
  prompt: string;
  negativePrompt: string;
  onPromptChange: (value: string) => void;
  onNegativePromptChange: (value: string) => void;
  category?: ProductCategory;
  scenePreset?: ScenePreset;
  disabled?: boolean;
}

const MAX_PROMPT_LENGTH = 10000;
const MAX_NEG_LENGTH = 2000;

const EXAMPLE_PROMPT =
  'Place this exact perfume bottle on a black marble pedestal with golden reflections, cinematic studio lighting, realistic shadows, and a premium luxury advertising aesthetic.';

export default function PromptEditor({
  prompt,
  negativePrompt,
  onPromptChange,
  onNegativePromptChange,
  category,
  scenePreset,
  disabled,
}: PromptEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showNegative, setShowNegative] = useState(false);

  const handleEnhance = () => {
    const enhanced = buildPrompt({
      userPrompt: prompt,
      category,
      scenePreset,
      enhance: true,
    });
    onPromptChange(enhanced);
    textareaRef.current?.focus();
  };

  const isNearLimit = prompt.length > MAX_PROMPT_LENGTH * 0.85;

  return (
    <div className="space-y-3">
      {/* Main prompt */}
      <div>
        <div className="relative">
          <textarea
            ref={textareaRef}
            id="scene-prompt"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe your product scene, lighting, surface, mood, and background..."
            disabled={disabled}
            maxLength={MAX_PROMPT_LENGTH}
            rows={5}
            className="textarea w-full pr-3 pb-7"
            aria-label="Scene prompt"
          />
          <div className="absolute bottom-2 right-3 flex items-center gap-2">
            <span
              className={`text-xs transition-colors ${
                isNearLimit ? 'text-orange-500' : 'text-muted'
              }`}
            >
              {prompt.length}/{MAX_PROMPT_LENGTH}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <button
            type="button"
            onClick={() => onPromptChange(EXAMPLE_PROMPT)}
            disabled={disabled}
            className="text-xs text-accent-600 hover:underline underline-offset-2 transition-colors"
          >
            Use example prompt
          </button>
          <div className="flex items-center gap-2">
            {prompt && (
              <button
                type="button"
                onClick={() => onPromptChange('')}
                disabled={disabled}
                className="btn-ghost py-1 px-2 text-xs gap-1"
                aria-label="Clear prompt"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleEnhance}
              disabled={disabled || !prompt.trim()}
              className="btn-secondary py-1 px-2.5 text-xs gap-1"
              title="Enhance prompt structure using local templates (no AI calls)"
            >
              <Sparkles className="w-3 h-3 text-accent-500" />
              Enhance
            </button>
          </div>
        </div>
      </div>

      {/* Example prompt callout */}
      {!prompt && (
        <div
          className="p-3 rounded-lg border text-xs cursor-pointer transition-all hover:border-accent-300 animate-fade-in"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
          onClick={() => onPromptChange(EXAMPLE_PROMPT)}
          role="button"
          tabIndex={0}
          aria-label="Use example prompt"
        >
          <span className="text-muted font-medium">Example: </span>
          <span className="text-secondary">{EXAMPLE_PROMPT}</span>
        </div>
      )}

      {/* Negative prompt toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowNegative(!showNegative)}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-secondary transition-colors"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              showNegative ? 'rotate-180' : ''
            }`}
          />
          Negative prompt <span className="text-accent-500">(optional)</span>
        </button>

        {showNegative && (
          <div className="mt-2 animate-fade-in">
            <textarea
              value={negativePrompt}
              onChange={(e) => onNegativePromptChange(e.target.value)}
              placeholder="Describe unwanted elements: distorted text, extra hands, artifacts, clutter..."
              disabled={disabled}
              maxLength={MAX_NEG_LENGTH}
              rows={2}
              className="textarea w-full text-xs"
              aria-label="Negative prompt"
            />
            <p className="text-xs text-muted mt-1 text-right">
              {negativePrompt.length}/{MAX_NEG_LENGTH}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
