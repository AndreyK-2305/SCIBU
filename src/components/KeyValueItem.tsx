import { Icon } from "@iconify/react/dist/iconify.js";

import { cn } from "@/lib/utils";

interface KeyValueItemProps {
  className?: string;
  icon?: string;
  label: string;
  values: (string | number) | (string | number)[];
}

export function KeyValueItem({
  icon,
  label,
  values,
  className,
}: KeyValueItemProps) {
  return (
    <div className={cn("flex gap-4", className)}>
      {icon && <Icon icon={icon} className="size-12 text-indigo-600" />}
      <dl>
        <dt className="font-bold">{label}</dt>
        <dd>
          {Array.isArray(values) ? (
            <ul>
              {values.map((value) => (
                <li>{value}</li>
              ))}
            </ul>
          ) : (
            values
          )}
        </dd>
      </dl>
    </div>
  );
}
