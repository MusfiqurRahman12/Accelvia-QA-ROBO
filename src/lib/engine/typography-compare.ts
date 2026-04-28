import { TypographyStyle, TypographyMismatch } from "@/types";

/**
 * Compares typography styles between reference and dev sites.
 * Matches elements by text content similarity then compares CSS properties.
 */

// Properties to compare and their severity when mismatched
const PROPERTY_SEVERITY: Record<string, "critical" | "major" | "minor"> = {
  fontFamily: "critical",
  fontSize: "critical",
  fontWeight: "major",
  lineHeight: "major",
  letterSpacing: "minor",
  color: "major",
  textTransform: "minor",
};

export function compareTypography(
  refStyles: TypographyStyle[],
  devStyles: TypographyStyle[]
): TypographyMismatch[] {
  const mismatches: TypographyMismatch[] = [];
  const matchedDevIndices = new Set<number>();

  for (const refItem of refStyles) {
    // Find the best matching dev element by text content
    const devMatch = findBestMatch(refItem, devStyles, matchedDevIndices);
    if (!devMatch) continue;

    matchedDevIndices.add(devMatch.index);

    // Compare each typography property
    for (const [property, severity] of Object.entries(PROPERTY_SEVERITY)) {
      const refValue = normalizeValue(
        property,
        refItem[property as keyof TypographyStyle]
      );
      const devValue = normalizeValue(
        property,
        devMatch.style[property as keyof TypographyStyle]
      );

      if (refValue !== devValue) {
        mismatches.push({
          elementSelector: refItem.selector,
          textContent: refItem.textContent,
          property: formatPropertyName(property),
          expected: refItem[property as keyof TypographyStyle] as string,
          actual: devMatch.style[property as keyof TypographyStyle] as string,
          severity,
          boundingBox: refItem.boundingBox,
        });
      }
    }
  }

  return mismatches;
}

function findBestMatch(
  refItem: TypographyStyle,
  devStyles: TypographyStyle[],
  excludeIndices: Set<number>
): { style: TypographyStyle; index: number } | null {
  let bestScore = 0;
  let bestIndex = -1;

  devStyles.forEach((devItem, index) => {
    if (excludeIndices.has(index)) return;

    const score = calculateSimilarity(refItem.textContent, devItem.textContent);
    if (score > bestScore && score > 0.6) {
      bestScore = score;
      bestIndex = index;
    }
  });

  if (bestIndex === -1) return null;
  return { style: devStyles[bestIndex], index: bestIndex };
}

function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const aLower = a.toLowerCase().trim();
  const bLower = b.toLowerCase().trim();
  if (aLower === bLower) return 0.95;

  // Simple Jaccard-like word similarity
  const aWords = new Set(aLower.split(/\s+/));
  const bWords = new Set(bLower.split(/\s+/));
  const intersection = new Set([...aWords].filter((w) => bWords.has(w)));
  const union = new Set([...aWords, ...bWords]);

  return intersection.size / union.size;
}

function normalizeValue(property: string, value: string): string {
  if (!value) return "";

  if (property === "fontFamily") {
    // Normalize font family by removing quotes and extra spaces
    return value
      .replace(/["']/g, "")
      .split(",")
      .map((f) => f.trim().toLowerCase())
      .join(", ");
  }

  if (property === "fontSize" || property === "letterSpacing") {
    // Round to nearest pixel
    const num = parseFloat(value);
    return isNaN(num) ? value : `${Math.round(num)}px`;
  }

  if (property === "lineHeight") {
    const num = parseFloat(value);
    return isNaN(num) ? value : `${Math.round(num * 10) / 10}`;
  }

  if (property === "color") {
    return value.toLowerCase().replace(/\s/g, "");
  }

  return value.toLowerCase().trim();
}

function formatPropertyName(property: string): string {
  const map: Record<string, string> = {
    fontFamily: "font-family",
    fontSize: "font-size",
    fontWeight: "font-weight",
    lineHeight: "line-height",
    letterSpacing: "letter-spacing",
    color: "color",
    textTransform: "text-transform",
  };
  return map[property] || property;
}
