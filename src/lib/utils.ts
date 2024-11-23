import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a given number of bytes into a human-readable string.
 *
 * @param {number} bytes - The number of bytes to format.
 * @param {Object} [opts] - Optional settings.
 * @param {number} [opts.decimals=0] - The number of decimal places to include in the formatted string.
 * @param {"accurate" | "normal"} [opts.sizeType="normal"] - The size type to use for formatting ("accurate" for binary prefixes, "normal" for decimal prefixes).
 * @returns {string} The formatted string representing the size in bytes.
 */
export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number
    sizeType?: "accurate" | "normal"
  } = {}
) {
  const { decimals = 0, sizeType = "normal" } = opts

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"]
  if (bytes === 0) return "0 Byte"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate"
      ? (accurateSizes[i] ?? "Bytes")
      : (sizes[i] ?? "Bytes")
  }`
}