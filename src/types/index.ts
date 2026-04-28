export interface Viewport {
  width: number;
  height: number;
  label?: string;
}

export interface TypographyStyle {
  selector: string;
  textContent: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  color: string;
  textTransform: string;
}

export interface TypographyMismatch {
  elementSelector: string;
  textContent: string;
  property: string;
  expected: string;
  actual: string;
  severity: "critical" | "major" | "minor";
}

export interface DiffResult {
  diffBuffer: Buffer;
  mismatchPercent: number;
  mismatchPixels: number;
  totalPixels: number;
}

export interface ComparisonInput {
  projectId: string;
  referenceType: "image" | "url" | "figma";
  referenceSource: string;
  devUrl: string;
  viewports: Viewport[];
  enableAI: boolean;
  enableTypography: boolean;
}

export interface AIBugResult {
  category: string;
  description: string;
  severity: "critical" | "major" | "minor";
  regionX?: number;
  regionY?: number;
  regionW?: number;
  regionH?: number;
}

export interface ComparisonResult {
  id: string;
  status: string;
  viewport: Viewport;
  mismatchPercent?: number;
  diffImageUrl?: string;
  refScreenshotUrl?: string;
  devScreenshotUrl?: string;
  typographyDiffs: TypographyMismatch[];
  aiBugs: AIBugResult[];
}

export interface BugReportContent {
  bugs: BugReportItem[];
  notes: string;
}

export interface BugReportItem {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: "critical" | "major" | "minor";
  screenshotUrl?: string;
  viewport?: Viewport;
  source: "pixel-diff" | "typography" | "ai";
}

export const DEFAULT_VIEWPORTS: Viewport[] = [
  { width: 375, height: 812, label: "Mobile" },
  { width: 768, height: 1024, label: "Tablet" },
  { width: 1024, height: 768, label: "Laptop" },
  { width: 1440, height: 900, label: "Desktop" },
  { width: 1920, height: 1080, label: "Full HD" },
];
