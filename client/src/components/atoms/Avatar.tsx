type AvatarProps = {
  src?: string | null;
  alt: string;
};

const Avatar = ({ src, alt }: AvatarProps) => {
  if (!src) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-neonCyan">
        {alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return <img src={src} alt={alt} className="h-10 w-10 rounded-full object-cover" />;
};

export default Avatar;
