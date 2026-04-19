/**
 * Preset values for laptop/product specs (admin form + shop filters).
 * Stored as plain strings on the product — no DB table required.
 */

export const SPEC_SELECT_EMPTY = "__spec_empty__";
export const SPEC_SELECT_OTHER = "__spec_other__";

/** @param {string[]} options */
export function isPresetValue(value, options) {
  if (value == null || value === "") return true;
  return options.includes(value);
}

export const BRAND_OPTIONS = [
  "Acer",
  "Apple",
  "Asus",
  "Dell",
  "HP",
  "Lenovo",
  "LG",
  "Microsoft",
  "MSI",
  "Samsung",
  "Fujitsu",
  "Toshiba",
  "Chuwi",
  "Realme",
];

export const RAM_OPTIONS = [
  "4 GB",
  "8 GB",
  "16 GB",
  "32 GB",
  "64 GB",
];

export const STORAGE_OPTIONS = [
  "128 GB SSD",
  "256 GB SSD",
  "512 GB SSD",
  "1 TB SSD",
  "2 TB SSD",
  "128 GB SSD + 500 GB HDD",
  "256 GB SSD + 1 TB HDD",
  "512 GB SSD + 1 TB HDD",
  "1 TB HDD",
  "512 GB HDD",
];

export const OS_OPTIONS = [
  "Windows 11 Pro",
  "Windows 11 Home",
  "Windows 10 Pro",
  "Windows 10 Home",
  "Windows 10 (activated)",
  "macOS",
  "Linux",
  "Chrome OS",
  "No OS / DOS",
];

export const CONDITION_GRADE_OPTIONS = [
  "A+",
  "A",
  "B+",
  "B",
  "C",
  "Refurbished – OEM",
];

export const DISPLAY_OPTIONS = [
  '11.6"',
  '12.5"',
  '13.3"',
  '14"',
  '15.6"',
  '16"',
  '17.3"',
];

export const GPU_OPTIONS = [
  "Intel UHD Graphics",
  "Intel Iris Xe",
  "Intel HD Graphics 620",
  "AMD Radeon Graphics",
  "AMD Radeon Vega",
  "NVIDIA GeForce MX150",
  "NVIDIA GeForce MX250",
  "NVIDIA GeForce MX350",
  "NVIDIA GeForce MX450",
  "NVIDIA GeForce GTX 1650",
  "NVIDIA GeForce RTX 3050",
  "NVIDIA GeForce RTX 3060",
  "NVIDIA Quadro",
  "Apple M1 GPU",
  "Apple M2 GPU",
  "Apple M3 GPU",
];

/** Common laptop CPUs — pick or use “Other (custom)”. */
export const PROCESSOR_OPTIONS = [
  "Intel Core i3 (6th Gen)",
  "Intel Core i3 (7th Gen)",
  "Intel Core i3 (8th Gen)",
  "Intel Core i3 (10th Gen)",
  "Intel Core i3 (11th Gen)",
  "Intel Core i3 (12th Gen)",
  "Intel Core i3 (13th Gen)",
  "Intel Core i5 (6th Gen)",
  "Intel Core i5 (7th Gen)",
  "Intel Core i5 (8th Gen)",
  "Intel Core i5 (10th Gen)",
  "Intel Core i5 (11th Gen)",
  "Intel Core i5 (12th Gen)",
  "Intel Core i5 (13th Gen)",
  "Intel Core i7 (6th Gen)",
  "Intel Core i7 (7th Gen)",
  "Intel Core i7 (8th Gen)",
  "Intel Core i7 (10th Gen)",
  "Intel Core i7 (11th Gen)",
  "Intel Core i7 (12th Gen)",
  "Intel Core i7 (13th Gen)",
  "Intel Core i9 (10th Gen)",
  "Intel Core i9 (11th Gen)",
  "Intel Core i9 (12th Gen)",
  "Intel Core i9 (13th Gen)",
  "AMD Ryzen 3",
  "AMD Ryzen 5 (4000 series)",
  "AMD Ryzen 5 (5000 series)",
  "AMD Ryzen 5 (6000 series)",
  "AMD Ryzen 7 (4000 series)",
  "AMD Ryzen 7 (5000 series)",
  "AMD Ryzen 7 (6000 series)",
  "AMD Ryzen 9",
  "Apple M1",
  "Apple M2",
  "Apple M3",
  "Intel Celeron",
  "Intel Pentium",
];
