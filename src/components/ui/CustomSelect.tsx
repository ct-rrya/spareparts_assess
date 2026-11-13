'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  ariaLabel?: string;
  buttonClassName?: string;
  wrapperClassName?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  ariaLabel,
  buttonClassName = 'h-10 w-full rounded-[6px] border border-[#E2E4EC] bg-white px-3 text-sm text-[#121212] hover:border-[#1F06AC] focus:border-[#1F06AC]',
  wrapperClassName = 'relative w-full',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={containerRef} className={wrapperClassName}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex cursor-pointer items-center justify-between gap-2 transition-colors focus:outline-none ${buttonClassName}`}
      >
        <span className="truncate">{selected?.label ?? ''}</span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-[#5C6072] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-1 max-h-60 overflow-y-auto rounded-[6px] border border-[#D5DCF3] bg-white py-1 shadow-lg"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-xs sm:text-sm transition-colors ${
                  active
                    ? 'bg-[#EAEFFC] font-semibold text-[#1F06AC]'
                    : 'text-[#121212] hover:bg-[#F7F8FC]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {active && (
                  <Check size={14} className="shrink-0 text-[#1F06AC]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

