import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

interface MultiSelectorProps<T> {
  itemValue: (item: T) => string | number;
  itemLabel: (item: T) => string;
  items: T[];
  label: string;
  value: T[];
  onChange: (value: T[]) => void;
  searchPlaceholder?: string;
  comboboxPlaceholder?: string;
  notFoundText?: string;
  className?: string;
}

export default function MultiSelector<T>({
  itemValue,
  itemLabel,
  items,
  label,
  value,
  onChange,
  searchPlaceholder,
  comboboxPlaceholder,
  notFoundText,
  className,
}: MultiSelectorProps<T>) {
  const [avalableOptions, setAvailableOptions] = useState<T[]>([]);
  const [selectedValue, setSelectedValue] = useState<T>();

  function handleAdd() {
    if (!selectedValue) return;

    setAvailableOptions(
      avalableOptions.filter((item) => {
        return itemValue(selectedValue) !== itemValue(item);
      }),
    );

    onChange([...value, selectedValue]);
    setSelectedValue(undefined);
  }

  function handleRemove(itemToRemove: T) {
    setAvailableOptions([...avalableOptions, itemToRemove]);

    onChange(
      value.filter((item) => itemValue(item) !== itemValue(itemToRemove)),
    );
  }

  function updateAvailableOptions() {
    setAvailableOptions(
      items.filter((item) => {
        const foundItem = value.find(
          (val) => itemValue(item) === itemValue(val),
        );

        return foundItem === undefined;
      }),
    );
  }

  useEffect(() => {
    updateAvailableOptions();
  }, [value, items]);

  return (
    <div className={className}>
      <div>
        <Label className="mb-2" htmlFor="item-combobox">
          {label}
        </Label>
        <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
          <Combobox
            value={selectedValue}
            items={avalableOptions}
            itemLabel={itemLabel}
            itemValue={itemValue}
            onChange={setSelectedValue}
            searchPlaceholder={searchPlaceholder}
            comboboxPlaceholder={comboboxPlaceholder}
            notFoundText={notFoundText}
            width="w-full"
          />
          <Button onClick={handleAdd} className="font-bold">
            Agregar
          </Button>
        </div>
      </div>

      <ul className="mt-1 flex flex-col gap-1">
        {value.map((item) => (
          <li
            key={itemValue(item)}
            className="flex items-center justify-between gap-2.5 rounded-md border pl-4 shadow-xs"
          >
            <span>{itemLabel(item)}</span>
            <Button
              onClick={() => handleRemove(item)}
              variant="ghost"
              size="icon"
            >
              <Icon icon="mdi:close" className="size-6 text-purple-500" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
