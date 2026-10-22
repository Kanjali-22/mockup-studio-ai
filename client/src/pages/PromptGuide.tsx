import { useState } from 'react';
import { Copy, Check, Sparkles, Lightbulb, Camera, ShieldAlert, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface PromptExample {
  title: string;
  category: string;
  prompt: string;
  negativePrompt: string;
  recommendedAspect: string;
  lightingTip: string;
  bestFor: string;
}

const PROMPT_EXAMPLES: PromptExample[] = [
  {
    title: 'Luxury Perfume & Fragrance',
    category: 'perfume',
    prompt:
      'Place this luxury perfume bottle on a sleek black obsidian pedestal with warm amber rim lighting, floating botanical petals, delicate water droplets, dramatic dark atmosphere, 8k commercial editorial photography, hyper-detailed glass reflections.',
    negativePrompt:
      'blurry, distorted label, low quality, warped bottle, oversaturated, text artifacts, cartoon, duplicate bottles',
    recommendedAspect: '1:1 or 9:16',
    lightingTip: 'Rim lighting + soft fill from left to capture translucent glass facets',
    bestFor: 'Instagram ads, hero banner, luxury campaign launch',
  },
  {
    title: 'Organic Skincare Serum',
    category: 'cosmetics-skincare',
    prompt:
      'Professional product photography of this dropper serum bottle sitting on warm travertine stone, soft morning sunlight through monstera palm shadows, gentle water ripple reflections, minimalist zen spa aesthetic, crisp labels, clean Scandinavian design.',
    negativePrompt:
      'harsh shadows, cluttered background, noisy, poor lighting, blown-out highlights, deformed bottle',
    recommendedAspect: '3:4 or 1:1',
    lightingTip: 'Dappled morning sunlight with soft golden bounce board',
    bestFor: 'Clean beauty brand ads, Sephora/Ulta product pages',
  },
  {
    title: 'Artisan Beverage / Soda Can',
    category: 'food-beverage',
    prompt:
      'Commercial advertising shoot of this beverage can coated in cold condensation droplets, energetic splash of citrus and fresh mint in background, icy acrylic base, vibrant studio backlighting, high-speed photography capture, crisp metallic finish.',
    negativePrompt:
      'muddy colors, distorted brand logo, flat lighting, dull textures, low resolution',
    recommendedAspect: '4:3 or 1:1',
    lightingTip: 'High-speed flash with dual strip boxes for specular can highlights',
    bestFor: 'Summer marketing campaigns, social media promotions',
  },
  {
    title: 'High-End Smartwatch / Wearable',
    category: 'electronics',
    prompt:
      'Cinematic product showcase of this premium smartwatch resting on a matte dark titanium surface, neon accent rim lighting in deep cyan and violet, subtle carbon fiber weave background, macro shot, crystal-clear sapphire glass, futuristic tech aesthetic.',
    negativePrompt:
      'dust, fingerprints, distorted screen, blurry edges, cheap plastic look, grainy',
    recommendedAspect: '1:1 or 16:9',
    lightingTip: 'Precise edge highlights to emphasize the brushed metal chassis',
    bestFor: 'Tech review thumbnails, Kickstarter campaigns, e-commerce stores',
  },
  {
    title: 'Fine Jewelry & Diamond Ring',
    category: 'jewelry',
    prompt:
      'Macro luxury jewelry photography of this piece on ivory silk satin folds, radiant diamond sparkle flares, soft champagne ambient lighting, velvet textures, Vogue luxury editorial quality, ultra-sharp facet reflections.',
    negativePrompt:
      'scratches, dull metals, blurred facets, cheap prop look, unnatural glare, distorted geometry',
    recommendedAspect: '1:1 or 3:4',
    lightingTip: 'Micro-spotlights for diamond scintillation + broad softbox for silk luster',
    bestFor: 'Bridal collections, holiday gifting campaigns',
  },
  {
    title: 'Designer Leather Sneaker',
    category: 'fashion-accessories',
    prompt:
      'Dynamic streetwear advertising photograph of this sneaker suspended mid-air above polished urban concrete, subtle dust particles catching golden hour sunlight, architectural shadows, crisp leather grain texture, high-fashion street editorial.',
    negativePrompt:
      'warped sole, deformed laces, dirty stains, out of focus, poor depth of field, artificial rendering',
    recommendedAspect: '4:3 or 16:9',
    lightingTip: 'Warm lateral sunset sunlight to bring out the leather grain depth',
    bestFor: 'Sneaker drop lookbooks, DTC apparel websites',
  },
  {
    title: 'Artisanal Scented Candle',
    category: 'home-furniture',
    prompt:
      'Cozy autumn lifestyle shoot of this glass jar candle burning gently, warm amber flame glow, rustic oak table, wool knit throw blanket in soft focus background, hygge ambiance, cinematic depth of field, tender warm color palette.',
    negativePrompt:
      'overexposed flame, cold tones, artificial smoke, messy composition, low contrast',
    recommendedAspect: '3:4 or 1:1',
    lightingTip: 'Practical candlelight combined with warm tungsten background lamp',
    bestFor: 'Home decor e-commerce, seasonal holiday marketing',
  },
];

const FORMULA_STEPS = [
  {
    step: '1. Subject Placement',
    example: '"Place this perfume bottle on a cylindrical white marble riser..."',
    detail: 'Explicitly state the surface, pedestal, or environment where the item stands.',
  },
  {
    step: '2. Scene & Environment',
    example: '"...in an airy minimalist penthouse with floor-to-ceiling windows..."',
    detail: 'Add context, surrounding props (botanicals, fabrics, architectural elements) without overwhelming the product.',
  },
  {
    step: '3. Lighting & Shadowing',
    example: '"...bathed in golden hour sunlight with soft diffused shadows and subtle rim light..."',
    detail: 'Lighting is 80% of perceived quality. Specify light direction, softness, and mood.',
  },
  {
    step: '4. Material & Texture Details',
    example: '"...showing crisp glass refraction, fine brushed metal texture, realistic reflections..."',
    detail: 'Guide the diffusion model to emphasize key tactile properties of the product.',
  },
  {
    step: '5. Photographic Style',
    example: '"...shot on 85mm lens, f/2.8 shallow depth of field, award-winning commercial campaign."',
    detail: 'Specify lens, camera angles, or editorial references for professional polish.',
  },
];

export default function PromptGuide() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Prompt copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const filteredExamples =
    filterCategory === 'all'
      ? PROMPT_EXAMPLES
      : PROMPT_EXAMPLES.filter((ex) => ex.category === filterCategory);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      {/* Hero Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Mastering Product Generation
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-3">
          Product Photography Prompt Guide
        </h1>
        <p className="text-secondary text-base">
          Craft prompts that keep your product in pristine focus while generating studio-grade
          lighting, realistic shadows, and campaign-ready backgrounds.
        </p>
      </div>

      {/* The 5-Part Formula */}
      <section className="card p-6 sm:p-8 mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="w-5 h-5 text-accent-600" />
          <h2 className="text-xl font-bold text-primary">The 5-Part Mockup Formula</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {FORMULA_STEPS.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-divider bg-neutral-50 dark:bg-neutral-900/50 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-accent-600 uppercase tracking-wider block mb-1">
                  {item.step}
                </span>
                <p className="text-xs text-secondary leading-relaxed mb-3">{item.detail}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-divider text-[11px] font-mono text-primary italic">
                {item.example}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Filter & Examples */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <Camera className="w-5 h-5 text-accent-600" />
            Curated Category Templates
          </h2>
          <p className="text-xs text-secondary mt-0.5">Click any prompt to copy it directly into the Studio.</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['all', 'perfume', 'cosmetics-skincare', 'food-beverage', 'electronics', 'jewelry', 'fashion-accessories', 'home-furniture'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterCategory === cat
                    ? 'bg-accent-600 text-white shadow-sm'
                    : 'bg-card border border-divider text-secondary hover:text-primary hover:border-accent-400'
                }`}
              >
                {cat === 'all' ? 'All' : cat.replace('-', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {filteredExamples.map((item, index) => (
          <div
            key={index}
            className="card p-6 flex flex-col justify-between group hover:border-accent-400 transition-all shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent-50 dark:bg-accent-950 text-accent-700 dark:text-accent-300 border border-accent-200 dark:border-accent-800">
                  {item.category.toUpperCase()}
                </span>
                <span className="text-[11px] text-muted font-medium">
                  Aspect: {item.recommendedAspect}
                </span>
              </div>
              <h3 className="text-base font-bold text-primary mb-2">{item.title}</h3>

              {/* Prompt box */}
              <div className="relative p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-divider text-xs text-primary leading-relaxed font-normal mb-3">
                {item.prompt}
                <button
                  onClick={() => handleCopy(item.prompt, index)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-surface border border-divider text-secondary hover:text-primary shadow-xs transition-colors"
                  title="Copy Prompt"
                  aria-label="Copy prompt"
                >
                  {copiedIndex === index ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-xs text-secondary mb-4">
                <p>
                  <strong className="text-primary font-medium">Lighting:</strong> {item.lightingTip}
                </p>
                <p>
                  <strong className="text-primary font-medium">Best for:</strong> {item.bestFor}
                </p>
                <p className="text-[11px] text-muted">
                  <strong className="text-secondary font-medium">Negative:</strong> {item.negativePrompt}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-divider flex items-center justify-between">
              <button
                onClick={() => handleCopy(item.prompt, index)}
                className="btn-secondary py-1.5 px-3 text-xs gap-1.5"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Prompt
                  </>
                )}
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent-600 hover:text-accent-700"
              >
                Open in Studio <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pro Tips Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 border-l-4 border-l-emerald-500">
          <h3 className="text-base font-bold text-primary flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Top Golden Rules for High Conversion
          </h3>
          <ul className="space-y-2 text-xs text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>
                <strong>Keep the original aspect ratio clean:</strong> If your product is tall (bottles, vases), use 3:4 or 9:16. For wide items, choose 4:3 or 16:9.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>
                <strong>Specify lighting keywords:</strong> "Rim lighting", "softbox fill", "golden hour caustics", and "specular reflections" drastically upgrade quality.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>
                <strong>Adjust Image Strength carefully:</strong> Lower strength (0.35 - 0.55) preserves exact product geometry; higher strength (0.65 - 0.80) integrates it more dramatically with scene elements.
              </span>
            </li>
          </ul>
        </div>

        <div className="card p-6 border-l-4 border-l-rose-500">
          <h3 className="text-base font-bold text-primary flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Common Pitfalls & Negative Prompts
          </h3>
          <ul className="space-y-2 text-xs text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span>
                <strong>Avoid vague prompts:</strong> "A nice background" generates bland, generic results. Describe surfaces, depth, and temperature instead.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span>
                <strong>Don't describe competing subjects:</strong> Avoid asking for humans or other prominent items that could overshadow your main product.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span>
                <strong>Use negative prompts wisely:</strong> Include words like "distorted label, cartoon, blurry, low resolution, warped logo, duplicate product".
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
