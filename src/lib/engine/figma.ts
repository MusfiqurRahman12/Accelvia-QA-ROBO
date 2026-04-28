import axios from "axios";
import { TypographyStyle } from "@/types";

/**
 * Figma API client for exporting frames as PNG and extracting text styles.
 */

interface FigmaUrlParts {
  fileKey: string;
  nodeId?: string;
}

export function parseFigmaUrl(url: string): FigmaUrlParts {
  // Handles: https://www.figma.com/file/KEY/name?node-id=X-Y
  // and:     https://www.figma.com/design/KEY/name?node-id=X-Y
  const fileMatch = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
  if (!fileMatch) throw new Error("Invalid Figma URL");

  const nodeMatch = url.match(/node-id=([^&]+)/);
  const nodeId = nodeMatch ? decodeURIComponent(nodeMatch[1]) : undefined;

  return { fileKey: fileMatch[1], nodeId };
}

export async function exportFrameAsPng(
  fileKey: string,
  nodeId: string,
  token: string,
  scale: number = 2
): Promise<Buffer> {
  // Request image export from Figma API
  const exportRes = await axios.get(
    `https://api.figma.com/v1/images/${fileKey}`,
    {
      headers: { "X-Figma-Token": token },
      params: { ids: nodeId, format: "png", scale },
    }
  );

  const imageUrl = exportRes.data.images?.[nodeId];
  if (!imageUrl) throw new Error("Failed to export frame from Figma");

  // Download the image
  const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
  return Buffer.from(imageRes.data);
}

export async function getTextStyles(
  fileKey: string,
  nodeId: string | undefined,
  token: string
): Promise<TypographyStyle[]> {
  const url = nodeId
    ? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`
    : `https://api.figma.com/v1/files/${fileKey}`;

  const res = await axios.get(url, {
    headers: { "X-Figma-Token": token },
  });

  const styles: TypographyStyle[] = [];

  function traverse(node: Record<string, unknown>) {
    if (node.type === "TEXT" && node.style) {
      const style = node.style as Record<string, unknown>;
      styles.push({
        selector: `figma:${node.name || "text"}`,
        textContent: String(node.characters || "").substring(0, 100),
        fontFamily: String(style.fontFamily || ""),
        fontSize: `${style.fontSize || 16}px`,
        fontWeight: String(style.fontWeight || "400"),
        lineHeight:
          style.lineHeightPx ? `${style.lineHeightPx}px` : "normal",
        letterSpacing: `${style.letterSpacing || 0}px`,
        color: extractColor(node.fills as Array<Record<string, unknown>>),
        textTransform: String(style.textCase || "none").toLowerCase(),
      });
    }

    const children = node.children as Array<Record<string, unknown>>;
    if (children && Array.isArray(children)) {
      children.forEach(traverse);
    }
  }

  // Navigate to the right node in the response
  if (nodeId && res.data.nodes) {
    const nodeData = res.data.nodes[nodeId];
    if (nodeData?.document) traverse(nodeData.document);
  } else if (res.data.document) {
    traverse(res.data.document);
  }

  return styles;
}

function extractColor(fills: Array<Record<string, unknown>> | undefined): string {
  if (!fills || fills.length === 0) return "rgb(0, 0, 0)";
  const fill = fills[0];
  if (fill.type !== "SOLID" || !fill.color) return "rgb(0, 0, 0)";
  const c = fill.color as { r: number; g: number; b: number; a?: number };
  return `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`;
}
