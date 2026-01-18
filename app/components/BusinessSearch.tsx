"use client";

import { useState, useEffect } from "react";
import usePlacesAutocomplete, { getDetails } from "use-places-autocomplete";
import { Search, MapPin } from "lucide-react";

interface BusinessSearchProps {
  onSelect: (restaurant: { name: string; location: string }) => void;
  apiKey: string;
}

export default function BusinessSearch({ onSelect, apiKey }: BusinessSearchProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{
    name: string;
    location: string;
  } | null>(null);

  // Load Google Maps script
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.google) {
        setIsScriptLoaded(true);
        return;
      }
      
      const existingScript = document.querySelector(
        `script[src*="maps.googleapis.com"]`
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => setIsScriptLoaded(true));
        if ((existingScript as HTMLScriptElement).complete) {
          setIsScriptLoaded(true);
        }
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsScriptLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Google Maps script");
      };
      document.head.appendChild(script);
    }
  }, [apiKey]);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ["restaurant", "food", "establishment"],
    },
    debounce: 300,
    initOnMount: false,
  });

  // Initialize the hook when script is loaded
  useEffect(() => {
    if (isScriptLoaded && !ready && typeof window !== "undefined" && window.google) {
      // Force re-initialization by calling setValue with empty string
      setValue("", false);
    }
  }, [isScriptLoaded, ready, setValue]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSelect = async (placeId: string) => {
    try {
      const details = await getDetails({
        placeId,
        fields: ["name", "formatted_address", "geometry"],
      });

      if (details) {
        const placeData = {
          name: details.name || "",
          location: details.formatted_address || "",
        };
        setSelectedPlace(placeData);
        onSelect(placeData);
        clearSuggestions();
        setValue(details.name || "", false);
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  if (!isScriptLoaded) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading Google Maps...
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder="Search for a restaurant..."
          className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {status === "OK" && data.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {data.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelect(suggestion.place_id)}
              className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {suggestion.structured_formatting.main_text}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                    {suggestion.structured_formatting.secondary_text}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedPlace && (
        <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-zinc-600 dark:text-zinc-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                {selectedPlace.name}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {selectedPlace.location}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
