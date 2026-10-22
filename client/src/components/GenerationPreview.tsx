import { useState, useCallback } from 'react';
import {
  Download,
  RefreshCw,
  ZoomIn,
  X,
  Copy,
  ArrowLeftRight,
  Wand2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { GenerationResult } from '../types';
import { downloadImage, getImageExtension } from '../utils/promptBuilder';
import { ASPECT_RATIO_OPTIONS } from '../utils/constants';

interface GenerationPreviewProps {
  result: GenerationResult | null;
  productPreviewUrl: string | null;
  isLoading: boolean;
  loadingStatus: string;
  error: string | null;
  onRegenerate: () => void;
  onGenerateVariation: () => void;
}

type PanelState = 'empty' | 'loading' | 'success' | 'error';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] py-16 px-8 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center mb-6 shadow-sm">
        <Wand2 className="w-9 h-9 text-accent-400" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-2">
        Your next product visual starts here
      </h3>
      <p className="text-sm text-muted max-w-xs leading-relaxed">
        Upload a product image, describe your scene, and click Generate to create a campaign-ready visual.
      </p>
      <div className="mt-6 flex flex-col gap-2 text-xs text-muted">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center font-semibold text-xs flex-shrink-0">1</span>
          <span>Upload your product photo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center font-semibold text-xs flex-shrink-0">2</span>
          <span>Choose a scene or write your own</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center font-semibold text-xs flex-shrink-0">3</span>
          <span>Click Generate &amp; download your visual</span>
        </div>
      </div>
    </div>
  );
}

function LoadingState({ status }: { status: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] py-16 px-8 text-center animate-fade-in">
      {/* Animated skeleton placeholder */}
      <div className="w-full max-w-sm mb-6">
        <div className="skeleton rounded-xl w-full h-64 mb-3" />
        <div className="skeleton rounded-lg w-3/4 h-3 mb-2" />
        <div className="skeleton rounded-lg w-1/2 h-3" />
      </div>
      <div className="flex items-center gap-2 text-sm text-secondary">
        <div className="w-4 h-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        <span className="animate-pulse-subtle">{status || 'Generating your scene...'}</span>
      </div>
      <p className="text-xs text-muted mt-2">This may take up to 60 seconds</p>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] py-16 px-8 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
        <X className="w-7 h-7 text-red-400" />
      </div>
      <h3 className="text-base font-semibold text-primary mb-2">Generation failed</h3>
      <p className="text-sm text-muted max-w-sm leading-relaxed mb-5">{error}</p>
      <button onClick={onRetry} className="btn-primary gap-2">
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>
    </div>
  );
}

export default function GenerationPreview({
  result,
  productPreviewUrl,
  isLoading,
  loadingStatus,
  error,
  onRegenerate,
  onGenerateVariation,
}: GenerationPreviewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [sliderX, setSliderX] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  let state: PanelState = 'empty';
  if (isLoading) state = 'loading';
  else if (error) state = 'error';
  else if (result) state = 'success';

  const handleDownload = useCallback(() => {
    if (!result) return;
    const ext = getImageExtension(result.mimeType);
    const filename = `mockup-studio-${Date.now()}.${ext}`;
    downloadImage(result.imageBase64, result.mimeType, filename);
    toast.success('Image downloaded!');
  }, [result]);

  const handleCopyPrompt = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.prompt).then(() => {
      toast.success('Prompt copied!');
    });
  };

  // Before/After slider
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setSliderX(Math.max(0, Math.min(100, x)));
    },
    [isDragging]
  );

  const aspectRatioOption = ASPECT_RATIO_OPTIONS.find(
    (a) => a.value === result?.aspectRatio
  );

  // Compute display aspect ratio style
  const aspectStyle = aspectRatioOption
    ? { aspectRatio: `${aspectRatioOption.widthRatio} / ${aspectRatioOption.heightRatio}` }
    : {};

  const imgSrc = result
    ? `data:${result.mimeType};base64,${result.imageBase64}`
    : '';

  if (state === 'empty') return <EmptyState />;
  if (state === 'loading') return <LoadingState status={loadingStatus} />;
  if (state === 'error') return <ErrorState error={error!} onRetry={onRegenerate} />;

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {/* Image display */}
      <div className="relative group">
        {showBeforeAfter && productPreviewUrl ? (
          /* Before/After comparison slider */
          <div
            className="relative overflow-hidden rounded-xl border-default border cursor-ew-resize select-none"
            style={aspectStyle}
            onMouseMove={handleMouseMove}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            {/* After (generated) - full */}
            <img
              src={imgSrc}
              alt="Generated visual"
              className="absolute inset-0 w-full h-full object-contain"
            />
            {/* Before (original) - clipped */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderX}%` }}
            >
              <img
                src={productPreviewUrl}
                alt="Original product"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ width: `${100 / (sliderX / 100)}%`, maxWidth: 'unset' }}
              />
            </div>
            {/* Slider line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize"
              style={{ left: `${sliderX}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center">
                <ArrowLeftRight className="w-3.5 h-3.5 text-charcoal-600" />
              </div>
            </div>
            {/* Labels */}
            <div className="absolute top-2 left-3 px-2 py-1 bg-black/60 text-white text-xs rounded-md">Before</div>
            <div className="absolute top-2 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-md">After</div>
          </div>
        ) : (
          /* Normal image display */
          <div
            className="relative rounded-xl overflow-hidden border-default border cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
            style={aspectStyle}
          >
            <img
              src={imgSrc}
              alt="Generated product visual"
              className="w-full h-full object-contain"
              style={{ background: '#f5f5f5' }}
            />
            {/* Zoom hint */}
            <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-sm text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={handleDownload} className="btn-primary flex-1 min-w-[120px]">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button onClick={onRegenerate} className="btn-secondary gap-2">
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </button>
        <button onClick={onGenerateVariation} className="btn-secondary gap-2">
          <Wand2 className="w-4 h-4" />
          Variation
        </button>
        {productPreviewUrl && (
          <button
            onClick={() => setShowBeforeAfter(!showBeforeAfter)}
            className={`btn-ghost gap-1.5 ${showBeforeAfter ? 'text-accent-600' : ''}`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            {showBeforeAfter ? 'Hide' : 'Compare'}
          </button>
        )}
      </div>

      {/* Generation metadata & Product Preservation Status */}
      <div className="rounded-lg p-3 space-y-2 text-xs" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-muted font-medium uppercase tracking-wider" style={{ fontSize: '10px' }}>
              Generation Details
            </span>
            {result?.productPreserved && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                ✓ Product Preserved
              </span>
            )}
          </div>
          <button
            onClick={handleCopyPrompt}
            className="btn-ghost py-0.5 px-2 text-xs gap-1"
          >
            <Copy className="w-3 h-3" />
            Copy prompt
          </button>
        </div>
        <p className="text-secondary leading-relaxed line-clamp-3">{result?.prompt}</p>
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-divider">
          {result?.workflowUsed && (
            <span className="text-muted">
              Workflow: <span className="text-accent-600 font-semibold">{result.workflowUsed === 'replace-background-and-relight' ? 'Replace Background & Relight' : '100% Pixel Composite'}</span>
            </span>
          )}
          <span className="text-muted">
            Model: <span className="text-secondary font-medium">{result?.model}</span>
          </span>
          <span className="text-muted">
            Ratio: <span className="text-secondary font-medium">{result?.aspectRatio}</span>
          </span>
          {result?.seed && (
            <span className="text-muted">
              Seed: <span className="text-secondary font-mono">{result.seed}</span>
            </span>
          )}
          <span className="text-muted">
            Format: <span className="text-secondary font-medium">{result?.outputFormat}</span>
          </span>
        </div>

        {/* Debug diagnostics panel if debugInfo returned */}
        {result?.debugInfo && (
          <div className="mt-2 p-2 rounded bg-neutral-100 dark:bg-neutral-900 border border-divider text-[11px] font-mono text-muted space-y-0.5">
            <div><strong className="text-secondary">Endpoint:</strong> {result.debugInfo.endpointCalled}</div>
            <div><strong className="text-secondary">Duration:</strong> {result.debugInfo.durationMs}ms {result.debugInfo.pollCount ? `(${result.debugInfo.pollCount} polls)` : ''}</div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={imgSrc}
            alt="Generated visual full preview"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
