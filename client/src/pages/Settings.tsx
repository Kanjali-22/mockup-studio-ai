import { useState, useEffect } from 'react';
import {
  Server,
  Key,
  Database,
  Sliders,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getHealth, extractErrorMessage } from '../services/api';
import { useCreations } from '../hooks/useCreations';
import type { HealthStatus, AspectRatio, ModelId, OutputFormat } from '../types';
import { ASPECT_RATIO_OPTIONS, MODEL_OPTIONS } from '../utils/constants';

const PREFS_STORAGE_KEY = 'mockup-studio-preferences';

interface UserPreferences {
  defaultModel: ModelId;
  defaultAspectRatio: AspectRatio;
  defaultOutputFormat: OutputFormat;
  autoSaveToCreations: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultModel: 'stable-image-core',
  defaultAspectRatio: '1:1',
  defaultOutputFormat: 'png',
  autoSaveToCreations: true,
};

export default function Settings() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  const { creations, refresh, remove } = useCreations();

  // Preferences
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem(PREFS_STORAGE_KEY);
      if (stored) return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    } catch {
      // ignore
    }
    return DEFAULT_PREFERENCES;
  });

  const checkHealthStatus = async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const data = await getHealth();
      setHealth(data);
      toast.success('Backend connection verified!');
    } catch (err) {
      const msg = extractErrorMessage(err);
      setHealthError(msg);
      toast.error('Could not connect to backend server');
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkHealthStatus();
  }, []);

  const handleSavePref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
      toast.success('Preference updated');
    } catch {
      toast.error('Failed to save to local storage');
    }
  };

  const handleClearAllCreations = async () => {
    if (creations.length === 0) {
      toast('No creations to delete');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete all ${creations.length} saved creations? This cannot be undone.`)) {
      return;
    }
    for (const c of creations) {
      await remove(c.id);
    }
    await refresh();
    toast.success('All creations cleared from local storage');
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Studio Settings</h1>
        <p className="text-sm text-secondary mt-1">
          Monitor your Stability AI connection, configure studio defaults, and manage local storage.
        </p>
      </div>

      <div className="space-y-6">
        {/* Backend & API Key Status */}
        <div className="card p-6">
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-divider">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-950 flex items-center justify-center text-accent-600">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-primary">API & Server Connection</h2>
                <p className="text-xs text-secondary">
                  Stability AI Gateway and Node.js proxy status
                </p>
              </div>
            </div>
            <button
              onClick={checkHealthStatus}
              disabled={loadingHealth}
              className="btn-secondary py-1.5 px-3 text-xs gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
              Test Connection
            </button>
          </div>

          {loadingHealth && !health ? (
            <div className="py-6 text-center text-xs text-muted flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-accent-600" />
              Checking server health...
            </div>
          ) : healthError ? (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-start gap-3">
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Backend Connection Failed</p>
                <p>{healthError}</p>
                <p className="mt-2 text-[11px] text-red-600 dark:text-red-400">
                  Make sure your Express server is running on port 3005 (`npm run dev:server`).
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl border border-divider bg-neutral-50 dark:bg-neutral-900/50">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">
                  Server Status
                </span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-primary capitalize">
                    {health?.status || 'Online'}
                  </span>
                </div>
                <span className="text-[11px] text-secondary mt-1 block">
                  Env: {health?.environment || 'development'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-divider bg-neutral-50 dark:bg-neutral-900/50">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">
                  Stability AI Key
                </span>
                <div className="flex items-center gap-2">
                  {health?.api.stabilityConfigured ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">Configured</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-semibold text-amber-600">Not Found</span>
                    </>
                  )}
                </div>
                <span className="text-[11px] text-secondary mt-1 block font-mono">
                  {health?.api.stabilityKeyHint || 'Set in server/.env'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-divider bg-neutral-50 dark:bg-neutral-900/50">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">
                  Upload & Rate Limits
                </span>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent-600" />
                  <span className="text-sm font-semibold text-primary">
                    Max {health?.limits.maxFileSizeMB || 10} MB
                  </span>
                </div>
                <span className="text-[11px] text-secondary mt-1 block">
                  {health?.limits.rateLimitMax || 20} requests / 15m
                </span>
              </div>
            </div>
          )}

          {/* Quick guide on API Key */}
          <div className="mt-4 p-3.5 rounded-xl bg-accent-50/50 dark:bg-accent-950/30 border border-accent-200 dark:border-accent-900/50 text-xs text-secondary flex items-start gap-2.5">
            <Key className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-primary">Configuring your Stability AI API Key:</p>
              <p>
                Add your key to <code className="font-mono text-accent-600">server/.env</code> as{' '}
                <code className="font-mono text-accent-600">STABILITY_API_KEY=sk-...</code> and restart the server.
              </p>
              <a
                href="https://platform.stability.ai/account/keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-accent-600 hover:text-accent-700 mt-1"
              >
                Get API Key at platform.stability.ai <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Default Studio Preferences */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-divider">
            <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-950 flex items-center justify-center text-accent-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-primary">Studio Default Preferences</h2>
              <p className="text-xs text-secondary">
                Configure your preferred starting values when launching the Studio
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-primary mb-2">
                Default AI Model
              </label>
              <select
                value={prefs.defaultModel}
                onChange={(e) => handleSavePref('defaultModel', e.target.value as ModelId)}
                className="input-select text-xs w-full"
              >
                {MODEL_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary mb-2">
                Default Aspect Ratio
              </label>
              <select
                value={prefs.defaultAspectRatio}
                onChange={(e) => handleSavePref('defaultAspectRatio', e.target.value as AspectRatio)}
                className="input-select text-xs w-full"
              >
                {ASPECT_RATIO_OPTIONS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label} ({a.value} - {a.description})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary mb-2">
                Default Output Format
              </label>
              <select
                value={prefs.defaultOutputFormat}
                onChange={(e) => handleSavePref('defaultOutputFormat', e.target.value as OutputFormat)}
                className="input-select text-xs w-full"
              >
                <option value="png">PNG (Lossless Quality)</option>
                <option value="jpeg">JPEG (Compressed)</option>
                <option value="webp">WEBP (Modern Web)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Local Storage & Cache Management */}
        <div className="card p-6">
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-divider">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-950 flex items-center justify-center text-accent-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-primary">Creations & Local Storage</h2>
                <p className="text-xs text-secondary">
                  Manage IndexedDB saved mockups stored in your browser
                </p>
              </div>
            </div>
            <button
              onClick={handleClearAllCreations}
              className="btn-danger py-1.5 px-3 text-xs gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Saved Creations
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-divider bg-neutral-50 dark:bg-neutral-900/50">
            <div>
              <p className="text-sm font-semibold text-primary">
                {creations.length} saved mockup{creations.length === 1 ? '' : 's'} in IndexedDB
              </p>
              <p className="text-xs text-secondary mt-0.5">
                Creations are stored locally in your browser and are never uploaded to any third-party cloud.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Private & Secure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
