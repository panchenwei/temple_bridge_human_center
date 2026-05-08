import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { publicAsset } from '../lib/assets';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  className,
  fallbackTitle = 'Image placeholder',
  fallbackSubtitle = 'Replace this with a local asset',
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#f7f1e8_0%,#dfe9e4_48%,#b85c38_130%)]',
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <div className="absolute inset-0 opacity-30 xuan-paper" />
        <div className="relative z-10 flex max-w-[80%] flex-col items-center gap-2 text-center text-heritage-ink/70">
          <ImageOff className="h-7 w-7 text-heritage-red" />
          <span className="font-serif text-sm font-bold">{fallbackTitle}</span>
          <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-heritage-ink/45">
            {fallbackSubtitle}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={publicAsset(src)}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
