import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";

type NeonButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={clsx(
          "neon-border inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-semibold text-white shadow-neon transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(0,245,255,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neonCyan",
          className
        )}
        {...props}
      />
    );
  }
);

NeonButton.displayName = "NeonButton";

export default NeonButton;
