"use client";

import useCountries from "@/app/hooks/useCountries";
import Select from "react-select";

export type CountrySelectValue = {
  flag: string;
  label: string;
  latlng: number[];
  region: string;
  value: string;
};

interface CountrySelectProps {
  value?: CountrySelectValue;
  onChange: (value: CountrySelectValue) => void;
}

function CountrySelect({ value, onChange }: CountrySelectProps) {
  const { getAll } = useCountries();

  return (
    <div>
      <Select
        placeholder="Anywhere"
        isClearable
        options={getAll()}
        value={value}
        onChange={(value) => onChange(value as CountrySelectValue)}
        formatOptionLabel={(option: CountrySelectValue) => (
          <div className="flex items-center gap-2">
            <span>{option.flag}</span>
            <div>
              <span>{option.label}</span>
              <span className="text-neutral-500 ml-1">{option.region}</span>
            </div>
          </div>
        )}
        classNames={{
            control:()=>'p-3 border-2',
            input:()=>"text-lg",
            option:()=>"text-lg"
        }}
        theme={(theme)=>({
            ...theme,
            borderRadius:6,
            colors:{
                ...theme.colors,
                primary:"black",
                primary25:"#ffe4e6"

            }
  })}
      />
    </div>
  );
}

export default CountrySelect;
