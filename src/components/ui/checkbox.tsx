import { Icon } from "@iconify/react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative size-6 shrink-0 cursor-pointer text-indigo-600 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <Icon
        icon="material-symbols:check-box-outline-blank"
        className="size-6"
      />
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="absolute top-0 flex items-center justify-center text-current transition-none"
      >
        <Icon icon="material-symbols:check-box" className="size-6" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
