import { useCallback, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { formatFileSize } from '../utils/promptBuilder';

interface ImageUploaderProps {
  file: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File, previewUrl: string) => void;
  onFileRemove: () => void;
  disabled?: boolean;
}

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function ImageUploader({
  file,
  previewUrl,
  onFileSelect,
  onFileRemove,
  disabled,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ w: number; h: number } | null>(null);

  const validateAndSelect = useCallback(
    (selectedFile: File) => {
      setValidationError(null);

      if (!ALLOWED_TYPES.includes(selectedFile.type)) {
        setValidationError('Unsupported file type. Please upload a PNG, JPEG, or WebP image.');
        return;
      }
      if (selectedFile.size > MAX_SIZE_BYTES) {
        setValidationError(`File too large. Maximum size is ${MAX_SIZE_MB} MB.`);
        return;
      }

      const url = URL.createObjectURL(selectedFile);
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ w: img.naturalWidth, h: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.src = url;

      const previewObjectUrl = URL.createObjectURL(selectedFile);
      onFileSelect(selectedFile, previewObjectUrl);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const dropped = e.dataTransfer.files[0];
      if (dropped) validateAndSelect(dropped);
    },
    [disabled, validateAndSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) validateAndSelect(selected);
    // Reset input value so same file can be re-selected
    e.target.value = '';
  };

  const handleRemove = () => {
    onFileRemove();
    setValidationError(null);
    setImageDimensions(null);
  };

  if (previewUrl && file) {
    return (
      <div className="space-y-2">
        <div className="relative rounded-xl overflow-hidden border-default border bg-card group">
          <img
            src={previewUrl}
            alt="Product preview"
            className="w-full max-h-56 object-contain bg-checkerboard"
            style={{ background: 'repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px' }}
          />
          <button
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200
                       text-charcoal-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50
                       transition-all duration-150 shadow-sm opacity-0 group-hover:opacity-100"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-start justify-between text-xs text-muted gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <ImageIcon className="w-3 h-3 flex-shrink-0" />
            <span className="truncate font-medium text-secondary">{file.name}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 text-muted">
            {imageDimensions && (
              <span>{imageDimensions.w} × {imageDimensions.h}px</span>
            )}
            <span>{formatFileSize(file.size)}</span>
          </div>
        </div>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="btn-ghost w-full text-xs py-1.5 mt-1"
        >
          Replace Image
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            inputRef.current?.click();
          }
        }}
        aria-label="Upload product image"
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors duration-200 ${
          isDragOver ? 'bg-accent-100 text-accent-600' : 'bg-gray-100 text-charcoal-400'
        }`} style={{ backgroundColor: isDragOver ? undefined : 'var(--color-bg)' }}>
          <Upload className="w-5 h-5" />
        </div>

        <p className="text-sm font-medium text-primary mb-1">
          {isDragOver ? 'Drop your product image here' : 'Drag & drop your product image'}
        </p>
        <p className="text-xs text-muted">
          or <span className="text-accent-600 underline underline-offset-2">browse files</span>
        </p>
        <p className="text-xs text-muted mt-2">PNG, JPEG, WebP · Max {MAX_SIZE_MB} MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />

      {validationError && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
