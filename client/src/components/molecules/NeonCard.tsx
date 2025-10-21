import { ReactNode } from "react";

type NeonCardProps = {
  title: string;
  children: ReactNode;
};

const NeonCard = ({ title, children }: NeonCardProps) => {
  return (
    <section className="neon-border rounded-lg bg-surface/80 p-4">
      <h3 className="text-sm font-semibold text-neonCyan">{title}</h3>
      <div className="mt-2 text-sm text-white/80">{children}</div>
    </section>
  );
};

export default NeonCard;
