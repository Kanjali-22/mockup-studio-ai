import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Zap, AlertCircle } from 'lucide-react';

import ImageUploader from '../components/ImageUploader';
import PromptEditor from '../components/PromptEditor';
import ScenePresetSelector from '../components/ScenePresetSelector';
import AspectRatioSelector from '../components/AspectRatioSelector';
import GenerationSettings from '../components/GenerationSettings';
import GenerationPreview from '../components/GenerationPreview';

import type {
  GenerationParams,
  GenerationResult,
  ProductCategory,
  ScenePreset,
  AspectRatio,
  ModelId,
  OutputFormat,
} from '../types';
import { CATEGORY_OPTIONS, DEFAULT_PARAMS } from '../utils/constants';
import { buildPrompt, validateGenerationParams } from '../utils/promptBuilder';
import { generateImage, extractErrorMessage } from '../services/api';
import { saveCreation } from '../hooks/useCreations';

type LoadingStatus = '' | 'Preparing image...' | 'Sending to AI...' | 'Generating your scene...' | 'Processing result...';

export default function Studio() {
  // File state
  const [productFile, setProductFile] = useState<File | null>(null);
  const [productPreviewUrl, setProductPreviewUrl] = useState<string | null>(null);

  // Prompt state
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');

  // Settings state
  const [category, setCategory] = useState<ProductCategory | undefined>(undefined);
  const [scenePreset, setScenePreset] = useState<ScenePreset | undefined>(undefined);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(DEFAULT_PARAMS.aspectRatio!);
  const [model, setModel] = useState<ModelId>(DEFAULT_PARAMS.model!);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(DEFAULT_PARAMS.outputFormat!);
  const [strength, setStrength] = useState(DEFAULT_PARAMS.strength!);
  const [seed, setSeed] = useState<number | undefined>(undefined);

  // Product fidelity & placement state
  const [workflow, setWorkflow] = useState<'relight' | 'composite' | 'auto'>('auto');
  const [removeBackground, setRemoveBackground] = useState(true);
  const [productScale, setProductScale] = useState(0.65);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [contactShadow, setContactShadow] = useState(true);
  const [colorMatch, setColorMatch] = useState(false);
  const [debug, setDebug] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Scroll refs
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((file: File, url: string) => {
    setProductFile(file);
    setProductPreviewUrl(url);
    setGenerationError(null);
    setValidationErrors([]);
  }, []);

  const handleFileRemove = useCallback(() => {
    if (productPreviewUrl) {
      URL.revokeObjectURL(productPreviewUrl);
    }
    setProductFile(null);
    setProductPreviewUrl(null);
  }, [productPreviewUrl]);

  const handlePresetSelect = (preset: ScenePreset, template: string) => {
    setScenePreset(preset);
    // Only auto-fill prompt if it's empty or it's a custom scene
    if (!prompt.trim() && template) {
      setPrompt(template);
    }
  };

  const buildFinalPrompt = useCallback(() => {
    return buildPrompt({
      userPrompt: prompt,
      category,
      scenePreset,
      enhance: false,
    });
  }, [prompt, category, scenePreset]);

  const handleGenerate = useCallback(async () => {
    const finalPrompt = buildFinalPrompt();
    const params: Partial<GenerationParams> = {
      prompt: finalPrompt,
      aspectRatio,
      model,
    };

    const errors = validateGenerationParams(params, Boolean(productFile));
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    setGenerationError(null);
    setIsGenerating(true);
    setResult(null);

    // Cycle through status messages
    setLoadingStatus('Preparing image...');
    const statusTimer1 = setTimeout(() => setLoadingStatus('Sending to AI...'), 2000);
    const statusTimer2 = setTimeout(() => setLoadingStatus('Generating your scene...'), 5000);
    const statusTimer3 = setTimeout(() => setLoadingStatus('Processing result...'), 40000);

    try {
      const genParams: GenerationParams = {
        prompt: finalPrompt,
        negativePrompt: negativePrompt || undefined,
        aspectRatio,
        model,
        outputFormat,
        strength,
        seed,
        category,
        scenePreset,
        workflow,
        removeBackground,
        productScale,
        positionX,
        positionY,
        contactShadow,
        colorMatch,
        debug,
      };

      const generationResult = await generateImage(productFile!, genParams);
      setResult(generationResult);

      // Save to local history
      saveCreation({
        imageBase64: generationResult.imageBase64,
        mimeType: generationResult.mimeType,
        prompt: finalPrompt,
        aspectRatio,
        model,
        seed: generationResult.seed,
        productImageName: productFile!.name,
      });

      toast.success('Image generated!');

      // Scroll to preview on mobile
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      const msg = extractErrorMessage(err);
      setGenerationError(msg);
      toast.error(msg.slice(0, 80));
    } finally {
      clearTimeout(statusTimer1);
      clearTimeout(statusTimer2);
      clearTimeout(statusTimer3);
      setIsGenerating(false);
      setLoadingStatus('');
    }
  }, [
    buildFinalPrompt,
    aspectRatio,
    model,
    outputFormat,
    strength,
    seed,
    negativePrompt,
    category,
    scenePreset,
    productFile,
  ]);

  const handleRegenerate = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleVariation = useCallback(() => {
    setSeed(undefined); // clear seed for variation
    handleGenerate();
  }, [handleGenerate]);

  const canGenerate = Boolean(productFile && prompt.trim());

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-primary">Studio</h1>
        <p className="text-sm text-muted mt-1">
          Turn product photos into campaign-ready visuals
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px,1fr] gap-6 items-start">
        {/* ─── LEFT PANEL: Controls ─── */}
        <div className="space-y-5">

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <ul className="text-xs text-red-700 space-y-0.5">
                {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {/* A: Product Image Upload */}
          <section className="card p-4">
            <h2 className="section-title mb-3">1 · Product Image</h2>
            <ImageUploader
              file={productFile}
              previewUrl={productPreviewUrl}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              disabled={isGenerating}
            />
          </section>

          {/* D: Product Category */}
          <section className="card p-4">
            <h2 className="section-title mb-3">2 · Product Category</h2>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(category === cat.id ? undefined : cat.id)}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all duration-150
                    ${category === cat.id
                      ? 'border-accent-500 bg-accent-50 text-accent-700'
                      : 'border-default bg-card text-secondary hover:border-accent-300'
                    }
                    ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* E: Scene Presets */}
          <section className="card p-4">
            <h2 className="section-title mb-3">3 · Scene Preset</h2>
            <ScenePresetSelector
              selected={scenePreset}
              onSelect={handlePresetSelect}
              disabled={isGenerating}
            />
          </section>

          {/* B: Scene Prompt */}
          <section className="card p-4">
            <h2 className="section-title mb-3">4 · Scene Description</h2>
            <PromptEditor
              prompt={prompt}
              negativePrompt={negativePrompt}
              onPromptChange={setPrompt}
              onNegativePromptChange={setNegativePrompt}
              category={category}
              scenePreset={scenePreset}
              disabled={isGenerating}
            />
          </section>

          {/* F: Aspect Ratio */}
          <section className="card p-4">
            <h2 className="section-title mb-3">5 · Aspect Ratio</h2>
            <AspectRatioSelector
              selected={aspectRatio}
              onSelect={setAspectRatio}
              disabled={isGenerating}
            />
          </section>

          {/* G: Generation Settings */}
          <section className="card p-4">
            <h2 className="section-title mb-3">6 · Generation Settings</h2>
            <GenerationSettings
              model={model}
              outputFormat={outputFormat}
              strength={strength}
              seed={seed}
              workflow={workflow}
              removeBackground={removeBackground}
              productScale={productScale}
              positionX={positionX}
              positionY={positionY}
              contactShadow={contactShadow}
              colorMatch={colorMatch}
              debug={debug}
              onModelChange={setModel}
              onOutputFormatChange={setOutputFormat}
              onStrengthChange={setStrength}
              onSeedChange={setSeed}
              onWorkflowChange={setWorkflow}
              onRemoveBackgroundChange={setRemoveBackground}
              onProductScaleChange={setProductScale}
              onPositionXChange={setPositionX}
              onPositionYChange={setPositionY}
              onContactShadowChange={setContactShadow}
              onColorMatchChange={setColorMatch}
              onDebugChange={setDebug}
              disabled={isGenerating}
            />
          </section>

          {/* H: Generate Button */}
          <div className="sticky bottom-4 z-10">
            <button
              id="generate-button"
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className="btn-primary w-full py-3.5 text-base shadow-lg"
              aria-busy={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Image
                </>
              )}
            </button>
            {!canGenerate && !isGenerating && (
              <p className="text-xs text-muted text-center mt-2">
                {!productFile ? 'Upload a product image to continue' : 'Enter a scene description to continue'}
              </p>
            )}
            <p className="text-xs text-muted text-center mt-1.5">
              Generation consumes Stability AI credits.{' '}
              <a
                href="https://platform.stability.ai/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-600 underline underline-offset-2"
              >
                Pricing
              </a>
            </p>
          </div>
        </div>

        {/* ─── RIGHT PANEL: Preview ─── */}
        <div ref={previewRef} className="card p-5 min-h-[500px] lg:sticky lg:top-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Preview</h2>
            {result && (
              <span className="badge badge-blue">Generated</span>
            )}
          </div>

          <GenerationPreview
            result={result}
            productPreviewUrl={productPreviewUrl}
            isLoading={isGenerating}
            loadingStatus={loadingStatus}
            error={generationError}
            onRegenerate={handleRegenerate}
            onGenerateVariation={handleVariation}
          />
        </div>
      </div>
    </div>
  );
}
