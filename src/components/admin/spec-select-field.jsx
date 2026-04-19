"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SPEC_SELECT_EMPTY,
  SPEC_SELECT_OTHER,
} from "@/lib/product-spec-options";

/**
 * Dropdown of preset strings plus "Other" with a text field.
 * Value stored on the product is always the final string (preset or custom).
 */
export function SpecSelectField({
  label,
  hint,
  options,
  value,
  onChange,
  emptyLabel = "Not specified",
  customPlaceholder = "Enter custom value",
  required,
  span,
  /** When this changes (e.g. product id), internal “Other with empty value” state resets. */
  resetKey,
}) {
  const v = value ?? "";
  /** True when value is "" but the user chose “Other” and should still see the text field. */
  const [emptyCustom, setEmptyCustom] = useState(false);

  useEffect(() => {
    setEmptyCustom(false);
  }, [resetKey]);

  const selectValue = options.includes(v)
    ? v
    : v !== "" || emptyCustom
      ? SPEC_SELECT_OTHER
      : SPEC_SELECT_EMPTY;

  const spanClass =
    span === 2 ? "sm:col-span-2" : span === 3 ? "sm:col-span-3" : "";

  return (
    <div className={`space-y-1.5 ${spanClass}`}>
      <Label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Select
        value={selectValue}
        onValueChange={(next) => {
          if (next === SPEC_SELECT_EMPTY) {
            setEmptyCustom(false);
            onChange("");
          } else if (next === SPEC_SELECT_OTHER) {
            setEmptyCustom(true);
            onChange("");
          } else {
            setEmptyCustom(false);
            onChange(next);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={emptyLabel}>
            {(val) => {
              if (val === SPEC_SELECT_EMPTY) return emptyLabel;
              if (val === SPEC_SELECT_OTHER) return "Other (custom)";
              return val != null ? String(val) : "";
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SPEC_SELECT_EMPTY}>{emptyLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
          <SelectItem value={SPEC_SELECT_OTHER}>Other (custom)</SelectItem>
        </SelectContent>
      </Select>
      {selectValue === SPEC_SELECT_OTHER && (
        <Input
          value={v}
          onChange={(e) => {
            const next = e.target.value;
            onChange(next);
            if (next === "") setEmptyCustom(true);
          }}
          placeholder={customPlaceholder}
          className="mt-1"
        />
      )}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
