"use client";

import { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { normalizeTag } from "@/lib/tags";

export function TagInput({
  value,
  onChange,
  suggestions,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    return suggestions
      .filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()))
      .filter((s) => !query || s.toLowerCase().includes(query))
      .slice(0, 6);
  }, [suggestions, value, inputValue]);

  function addTag(raw: string) {
    const normalized = normalizeTag(raw);
    if (!normalized) return;
    if (value.some((v) => v.toLowerCase() === normalized.toLowerCase())) {
      setInputValue("");
      return;
    }
    onChange([...value, normalized]);
    setInputValue("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((v) => v !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  const showCreateOption =
    inputValue.trim().length > 0 &&
    !suggestions.some((s) => s.toLowerCase() === normalizeTag(inputValue).toLowerCase()) &&
    !value.some((v) => v.toLowerCase() === normalizeTag(inputValue).toLowerCase());

  return (
    <div className="relative">
      <div
        className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5 focus-within:ring-2 focus-within:ring-accent"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium">
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="text-muted hover:text-foreground"
              aria-label={`Quitar ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={value.length === 0 ? "viaje, trabajo…" : ""}
          className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      {open && (filteredSuggestions.length > 0 || showCreateOption) && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-md">
          {filteredSuggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(s)}
                className={clsx("flex w-full items-center px-3 py-1.5 text-left text-sm hover:bg-surface-muted")}
              >
                {s}
              </button>
            </li>
          ))}
          {showCreateOption && (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(inputValue)}
                className="flex w-full items-center px-3 py-1.5 text-left text-sm text-accent hover:bg-surface-muted"
              >
                Crear &quot;{normalizeTag(inputValue)}&quot;
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
