"use client";

import { useEffect, useState } from "react";

const CURRENT_YEAR = new Date().getFullYear();
const DATE_YEARS = Array.from({ length: 141 }, (_, index) => CURRENT_YEAR + 20 - index);
const MONTH_OPTIONS = [
  ["01", "January"],
  ["02", "February"],
  ["03", "March"],
  ["04", "April"],
  ["05", "May"],
  ["06", "June"],
  ["07", "July"],
  ["08", "August"],
  ["09", "September"],
  ["10", "October"],
  ["11", "November"],
  ["12", "December"],
] as const;
const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0"));

interface DatePartsInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputClasses: string;
}

function splitDateValue(value: string): { year: string; month: string; day: string } {
  const [year = "", month = "", day = ""] = value.split("-");
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day)) {
    return { year: "", month: "", day: "" };
  }
  return { year, month, day };
}

function buildDateValue(month: string, day: string, year: string): string {
  if (!month || !day || !year) return "";
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return "";
  }
  return `${year}-${month}-${day}`;
}

export function DatePartsInput({ id, label, value, onChange, required = false, inputClasses }: DatePartsInputProps) {
  const [parts, setParts] = useState(() => splitDateValue(value));
  const { year, month, day } = parts;

  useEffect(() => {
    if (!value) return;
    setParts(splitDateValue(value));
  }, [value]);

  function update(next: Partial<{ year: string; month: string; day: string }>) {
    const nextParts = {
      year: next.year ?? year,
      month: next.month ?? month,
      day: next.day ?? day,
    };
    setParts(nextParts);
    onChange(buildDateValue(nextParts.month, nextParts.day, nextParts.year));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Month
          </span>
          <select
            id={`${id}Month`}
            value={month}
            required={required}
            aria-label={`${label} month`}
            onChange={(event) => update({ month: event.target.value })}
            className={inputClasses}
          >
            <option value="">Month</option>
            {MONTH_OPTIONS.map(([optionValue, optionLabel]) => (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Day
          </span>
          <select
            id={`${id}Day`}
            value={day}
            required={required}
            aria-label={`${label} day`}
            onChange={(event) => update({ day: event.target.value })}
            className={inputClasses}
          >
            <option value="">Day</option>
            {DAY_OPTIONS.map((optionDay) => (
              <option key={optionDay} value={optionDay}>
                {optionDay}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Year
          </span>
          <select
            id={`${id}Year`}
            value={year}
            required={required}
            aria-label={`${label} year`}
            onChange={(event) => update({ year: event.target.value })}
            className={inputClasses}
          >
            <option value="">Year</option>
            {DATE_YEARS.map((optionYear) => (
              <option key={optionYear} value={optionYear}>
                {optionYear}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Use Month / Day / Year, not DD/MM/YYYY. Example: June 23, 2026.
      </p>
    </div>
  );
}
