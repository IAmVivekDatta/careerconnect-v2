type AvatarProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

const Avatar = ({ src, alt, className }: AvatarProps) => {
  const sizeClasses = className ?? "h-10 w-10";

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-white/10 text-base font-semibold text-neonCyan ${sizeClasses}`}
      >
        {alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return <img src={src} alt={alt} className={`${sizeClasses} rounded-full object-cover`} />;
};

export default Avatar;
