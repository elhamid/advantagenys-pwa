/// <reference types="google.maps" />
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════
   Google Maps Script Loader
   ═══════════════════════════════════════════════ */

let loadPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.google?.maps?.places) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */

interface Prediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  onZipCode?: (zip: string) => void;
  id?: string;
  placeholder?: string;
}

/* ═══════════════════════════════════════════════
   AddressAutocomplete Component
   ═══════════════════════════════════════════════ */

export default function AddressAutocomplete({
  value,
  onChange,
  onZipCode,
  id,
  placeholder = "123 Main St, City, State",
}: Props) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [apiReady, setApiReady] = useState(false);

  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load Google Maps on mount
  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        serviceRef.current = new google.maps.places.AutocompleteService();
        setApiReady(true);
      })
      .catch(() => {
        // Silently degrade — input works as plain text
      });
  }, []);

  // Fetch predictions
  const fetchPredictions = useCallback(
    (input: string) => {
      if (!serviceRef.current || input.length < 3) {
        setPredictions([]);
        setShowDropdown(false);
        return;
      }

      serviceRef.current.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: "us" },
          types: ["address"],
        },
        (results, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            results &&
            results.length > 0
          ) {
            const mapped: Prediction[] = results.slice(0, 5).map((r) => ({
              placeId: r.place_id,
              mainText: r.structured_formatting.main_text,
              secondaryText: r.structured_formatting.secondary_text,
              description: r.description,
            }));
            setPredictions(mapped);
            setShowDropdown(true);
            setActiveIndex(-1);
          } else {
            setPredictions([]);
            setShowDropdown(false);
          }
        }
      );
    },
    []
  );

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      onChange(v);
      if (apiReady) {
        fetchPredictions(v);
      }
    },
    [onChange, apiReady, fetchPredictions]
  );

  // Select a prediction — also extract ZIP via Places Details
  const handleSelect = useCallback(
    (prediction: Prediction) => {
      onChange(prediction.description);
      setPredictions([]);
      setShowDropdown(false);
      setActiveIndex(-1);

      // Extract ZIP code from place details if callback provided
      if (onZipCode && window.google?.maps?.places) {
        const div = document.createElement("div");
        const service = new google.maps.places.PlacesService(div);
        service.getDetails(
          { placeId: prediction.placeId, fields: ["address_component"] },
          (place) => {
            if (place?.address_components) {
              const zip = place.address_components.find((c) =>
                c.types.includes("postal_code")
              );
              if (zip?.long_name) {
                onZipCode(zip.long_name);
              }
            }
          }
        );
      }
    },
    [onChange, onZipCode]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown || predictions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < predictions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : predictions.length - 1
        );
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(predictions[activeIndex]);
      } else if (e.key === "Escape") {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    },
    [showDropdown, predictions, activeIndex, handleSelect]
  );

  // Dismiss on blur with delay for touch/click
  const handleBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
      setActiveIndex(-1);
    }, 200);
  }, []);

  const handleFocus = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (predictions.length > 0) {
      setShowDropdown(true);
    }
  }, [predictions]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        inputMode="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-controls={id ? `${id}-listbox` : undefined}
        aria-activedescendant={
          activeIndex >= 0 && id
            ? `${id}-option-${activeIndex}`
            : undefined
        }
        className={`
          w-full px-4 py-3.5 rounded-xl text-lg
          bg-white/[0.07] border border-white/10
          text-white placeholder-white/25
          focus:outline-none focus:border-[#4F56E8] focus:ring-1 focus:ring-[#4F56E8]/30
          transition-all duration-200
        `}
      />

      {showDropdown && predictions.length > 0 && (
        <ul
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="
            absolute left-0 right-0 z-50 mt-1
            bg-[#1A2D45] border border-white/10 rounded-xl
            shadow-2xl overflow-hidden
          "
        >
          {predictions.map((prediction, index) => (
            <li
              key={prediction.placeId}
              id={id ? `${id}-option-${index}` : undefined}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => {
                // Prevent blur from firing before selection
                e.preventDefault();
                handleSelect(prediction);
              }}
              className={`
                px-4 py-3 cursor-pointer text-base
                transition-colors duration-100
                min-h-[48px] flex flex-col justify-center
                ${
                  index === activeIndex
                    ? "bg-[#4F56E8]/20 text-white"
                    : "text-white/80 hover:bg-white/10"
                }
                ${index < predictions.length - 1 ? "border-b border-white/5" : ""}
              `}
            >
              <span className="font-medium text-white/90">
                {prediction.mainText}
              </span>
              <span className="text-sm text-white/40">
                {prediction.secondaryText}
              </span>
            </li>
          ))}

          {/* Google attribution — required by TOS */}
          <li className="px-4 py-2 flex justify-end pointer-events-none">
            <img
              src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-non-white4.png"
              alt="Powered by Google"
              className="h-[14px] opacity-60"
            />
          </li>
        </ul>
      )}
    </div>
  );
}
