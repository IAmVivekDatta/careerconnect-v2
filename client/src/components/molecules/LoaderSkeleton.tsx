type LoaderSkeletonProps = {
  lines?: number;
};

const LoaderSkeleton = ({ lines = 3 }: LoaderSkeletonProps) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 w-full animate-pulse rounded bg-white/5"
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

export default LoaderSkeleton;
