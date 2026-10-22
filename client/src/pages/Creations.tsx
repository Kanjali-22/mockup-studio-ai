import { useNavigate } from 'react-router-dom';
import { Trash2, Download, RefreshCw, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreations } from '../hooks/useCreations';
import { downloadImage, getImageExtension } from '../utils/promptBuilder';
import type { Creation } from '../types';
import { ASPECT_RATIO_OPTIONS } from '../utils/constants';

function CreationCard({ creation, onDelete }: { creation: Creation; onDelete: (id: string) => void }) {
  const navigate = useNavigate();
  const imgSrc = `data:${creation.mimeType};base64,${creation.imageBase64}`;
  const ext = getImageExtension(creation.mimeType);
  const ratioOpt = ASPECT_RATIO_OPTIONS.find((a) => a.value === creation.aspectRatio);

  const handleDownload = () => {
    downloadImage(creation.imageBase64, creation.mimeType, `mockup-${creation.id.slice(0, 8)}.${ext}`);
    toast.success('Downloaded!');
  };

  const handleDelete = () => {
    if (confirm('Delete this creation? This cannot be undone.')) {
      onDelete(creation.id);
      toast.success('Deleted');
    }
  };

  return (
    <div className="card overflow-hidden group transition-all duration-200 hover:shadow-card-hover">
      {/* Image */}
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{
          aspectRatio: ratioOpt
            ? `${ratioOpt.widthRatio} / ${ratioOpt.heightRatio}`
            : '1 / 1',
          background: '#f5f5f5',
        }}
        onClick={() => navigate('/')}
      >
        <img
          src={imgSrc}
          alt="Generated product visual"
          className="w-full h-full object-contain"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
      </div>

      {/* Meta */}
      <div className="p-3">
        <p className="text-xs text-secondary line-clamp-2 leading-relaxed mb-2">
          {creation.prompt}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted mb-3">
          <span>{creation.aspectRatio}</span>
          <span>·</span>
          <span>{creation.model}</span>
          {creation.productImageName && (
            <>
              <span>·</span>
              <span className="truncate max-w-[80px]">{creation.productImageName}</span>
            </>
          )}
        </div>
        <p className="text-xs text-muted mb-3">
          {new Date(creation.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="btn-secondary flex-1 py-1.5 text-xs gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          <button
            onClick={handleDelete}
            className="btn-ghost py-1.5 px-2.5 text-xs text-red-500 hover:bg-red-50"
            aria-label="Delete creation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Creations() {
  const { creations, loading, refresh, remove } = useCreations();

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary">My Creations</h1>
          <p className="text-sm text-muted mt-1">
            Stored locally in your browser · {creations.length} creation{creations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg">
            <span>🗄️</span>
            <span>Browser-local only</span>
          </div>
          <button
            onClick={refresh}
            className="btn-ghost gap-1.5"
            aria-label="Refresh creations"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton w-full" style={{ aspectRatio: '1/1' }} />
              <div className="p-3 space-y-2">
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : creations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <ImageIcon className="w-7 h-7 text-charcoal-300" />
          </div>
          <h3 className="text-base font-semibold text-primary mb-2">No creations yet</h3>
          <p className="text-sm text-muted max-w-xs">
            Generate your first product visual in the Studio. Your creations will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {creations.map((creation) => (
            <CreationCard key={creation.id} creation={creation} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
}
