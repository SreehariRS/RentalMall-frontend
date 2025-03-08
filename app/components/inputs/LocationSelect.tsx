"use client";

import { useState } from 'react';
import useLocations from "@/app/hooks/useLocations";
import AsyncSelect from 'react-select/async';
import { GroupBase } from 'react-select';
import debounce from 'lodash/debounce';

export type LocationSelectValue = {
  value: string;
  label: string;
  coordinates: [number, number];
  address: string;
  city?: string;
  country?: string;
};

interface LocationSelectProps {
  value?: LocationSelectValue;
  onChange: (value: LocationSelectValue | null) => void;
}

function LocationSelect({ value, onChange }: LocationSelectProps) {
  const { searchLocations } = useLocations();
  const [isLoading, setIsLoading] = useState(false);

  const loadOptions = (
    inputValue: string,
    callback: (options: readonly LocationSelectValue[]) => void
  ) => {
    if (inputValue.length < 2) {
      callback([]);
      return;
    }

    setIsLoading(true);
    searchLocations(inputValue)
      .then((results) => {
        callback(results);
      })
      .catch((error) => {
        console.error('Error loading options:', error);
        callback([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const debouncedLoadOptions = debounce(loadOptions, 300);

  return (
    <div>
      <AsyncSelect<LocationSelectValue, false, GroupBase<LocationSelectValue>>
        placeholder="Search for a location..."
        isClearable
        cacheOptions
        defaultOptions
        value={value}
        isLoading={isLoading}
        loadOptions={debouncedLoadOptions}
        onChange={(value) => onChange(value as LocationSelectValue)}
        formatOptionLabel={(option: LocationSelectValue) => (
          <div className="flex flex-col gap-1">
            <div className="font-medium">{option.label}</div>
            <div className="text-sm text-neutral-500">{option.address}</div>
          </div>
        )}
        classNames={{
          control: () => 'p-3 border-2',
          input: () => "text-lg",
          option: () => "text-lg"
        }}
        theme={(theme) => ({
          ...theme,
          borderRadius: 6,
          colors: {
            ...theme.colors,
            primary: "black",
            primary25: "#ffe4e6"
          }
        })}
      />
    </div>
  );
}

export default LocationSelect;