import { ReactNode } from 'react';

type NeonCardProps = {
  title: string;
  children: ReactNode;
};

const NeonCard = ({ title, children }: NeonCardProps) => {
  return (
    <section className="neon-border rounded-2xl bg-card/95 p-5 transition-transform duration-300 ease-out hover:-translate-y-[5px]">
      <h3 className="text-sm font-bold text-neonCyan">{title}</h3>
      <div className="mt-3 text-sm text-muted-foreground">{children}</div>
    </section>
  );
};

export default NeonCard;
