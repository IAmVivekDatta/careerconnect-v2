import type React from 'react';

type AvatarProps = {
  src?: string | null;
  alt: string;
  className?: string;
  onClick?: () => void;
};

const Avatar = ({ src, alt, className, onClick }: AvatarProps) => {
  const sizeClasses = className ?? 'h-10 w-10';
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-white/10 text-base font-semibold text-neonCyan ${sizeClasses}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={handleKeyDown}
      >
        {alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses} rounded-full object-cover`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    />
  );
};

export default Avatar;
