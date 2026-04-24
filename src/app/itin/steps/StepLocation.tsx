"use client";

import AddressAutocomplete from "../AddressAutocomplete";
import { Label, Input, CountrySelect, SectionDivider } from "./primitives";
import { CITIES } from "./types";
import type { StepProps } from "./types";

interface StepLocationProps extends StepProps {
  onShowI94?: () => void;
}

export function StepLocation({ data, errors, update, onShowI94, priorityCountry }: StepLocationProps) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Location &amp; Employment</h2>
        <p className="text-white/40 text-sm">Where you&apos;ll attend and your work details.</p>
      </div>

      {/* City selector */}
      <div>
        <Label required>Appointment City</Label>
        <div className="grid grid-cols-2 gap-3 mt-1">
          {CITIES.map((city) => (
            <button
              key={city.value}
              type="button"
              onClick={() => update("city", city.value)}
              className={`
                py-5 px-4 rounded-xl text-base font-semibold text-center
                transition-all duration-200 active:scale-[0.97]
                min-h-[48px]
                ${
                  data.city === city.value
                    ? "bg-[#4F56E8] text-white border-2 border-[#818CF8] shadow-[0_0_20px_rgba(79,86,232,0.3)]"
                    : "bg-white/[0.07] text-white/60 border-2 border-transparent hover:bg-white/10 hover:text-white/80"
                }
              `}
            >
              <span className="text-2xl block mb-1">{city.icon}</span>
              {city.label}
            </button>
          ))}
        </div>
        {errors.city && <p className="mt-1 text-xs text-red-400">{errors.city}</p>}
      </div>

      <div>
        <Label required htmlFor="itin-addressUsa">U.S. Address (Street, City, State)</Label>
        <AddressAutocomplete
          id="itin-addressUsa"
          value={data.addressUsa}
          onChange={(v) => update("addressUsa", v)}
          onZipCode={(zip) => update("zipCode", zip)}
          placeholder="123 Main St, City, State"
        />
      </div>

      <div className="w-40">
        <Label htmlFor="itin-aptNumber">Apt / Unit #</Label>
        <Input
          id="itin-aptNumber"
          value={data.aptNumber}
          onChange={(v) => update("aptNumber", v)}
          placeholder="Apt 4B"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required htmlFor="itin-zipCode">ZIP</Label>
          <Input
            id="itin-zipCode"
            value={data.zipCode}
            onChange={(v) => update("zipCode", v)}
            error={errors.zipCode}
            placeholder="11004"
            inputMode="numeric"
            autoComplete="postal-code"
          />
        </div>
        <div>
          <Label required htmlFor="itin-usEntryDate">Entry Date</Label>
          <Input
            id="itin-usEntryDate"
            value={data.usEntryDate}
            onChange={(v) => update("usEntryDate", v)}
            error={errors.usEntryDate}
            type="date"
          />
          {onShowI94 && (
            <button
              type="button"
              onClick={onShowI94}
              className="mt-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-[#4F56E8]/10 border border-[#4F56E8]/25 text-[#818CF8] hover:bg-[#4F56E8]/20 hover:text-white active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Look Up Entry Date (I-94)
            </button>
          )}
        </div>
      </div>

      <SectionDivider label="Home Country Information" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required htmlFor="itin-homeCountry">Home Country</Label>
          <CountrySelect
            id="itin-homeCountry"
            value={data.homeCountry}
            onChange={(v) => update("homeCountry", v)}
            required
            error={errors.homeCountry}
            priorityCountry={priorityCountry}
          />
        </div>
        <div>
          <Label required htmlFor="itin-homeCity">Home City</Label>
          <Input
            id="itin-homeCity"
            value={data.homeCity}
            onChange={(v) => update("homeCity", v)}
            error={errors.homeCity}
            placeholder="e.g. Kingston"
          />
        </div>
      </div>

      <div>
        <Label required htmlFor="itin-homeAddress">Home Address (non-US)</Label>
        <Input
          id="itin-homeAddress"
          value={data.homeAddress}
          onChange={(v) => {
            update("homeAddress", v);
            update("addressHomeCountry", v);
          }}
          placeholder="Street address in your home country"
        />
      </div>

      <div>
        <Label htmlFor="itin-amount">Annual Earnings ($)</Label>
        <Input
          id="itin-amount"
          value={data.amount}
          onChange={(v) => update("amount", v)}
          placeholder="0.00"
          inputMode="decimal"
          large
        />
      </div>
    </div>
  );
}
