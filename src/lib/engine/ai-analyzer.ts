import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIBugResult } from "@/types";

/**
 * AI-powered cosmetic bug detection.
 * Supports both OpenAI GPT-4o Vision and Google Gemini 1.5 Flash.
 * Users provide their own API key.
 */

const SYSTEM_PROMPT = `You are a senior QA engineer specializing in UI/UX visual testing. 
Analyze the provided screenshots and identify cosmetic bugs. 
Return your analysis as a JSON array with objects having these fields:
- category: one of "spacing", "alignment", "color", "overflow", "missing-element", "font", "layout", "border", "shadow", "opacity"
- description: clear description of the bug. ALWAYS start the description by mentioning the section it is located in (e.g. "In the Header section: ...", "In the Footer: ...", "In the Hero section: ...")
- severity: "critical", "major", or "minor"
- regionX, regionY, regionW, regionH: approximate pixel coordinates of the bug region (optional)

Only return the JSON array, no other text.`;

const USER_PROMPT = "Compare these UI screenshots. Image 1 is the design reference, Image 2 is the development build, Image 3 is the pixel diff highlighting mismatches. Identify all cosmetic bugs.";

export async function analyzeWithAI(
  refImageBase64: string,
  devImageBase64: string,
  diffImageBase64: string,
  apiKey: string,
  provider: "openai" | "gemini" = "openai"
): Promise<AIBugResult[]> {
  if (!apiKey) return [];

  try {
    if (provider === "gemini") {
      return await analyzeWithGemini(refImageBase64, devImageBase64, diffImageBase64, apiKey);
    } else {
      return await analyzeWithOpenAI(refImageBase64, devImageBase64, diffImageBase64, apiKey);
    }
  } catch (error) {
    console.error(`AI analysis failed (${provider}):`, error);
    return [];
  }
}

async function analyzeWithOpenAI(
  refImageBase64: string,
  devImageBase64: string,
  diffImageBase64: string,
  apiKey: string
): Promise<AIBugResult[]> {
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: USER_PROMPT },
          { type: "image_url", image_url: { url: `data:image/png;base64,${refImageBase64}`, detail: "high" } },
          { type: "image_url", image_url: { url: `data:image/png;base64,${devImageBase64}`, detail: "high" } },
          { type: "image_url", image_url: { url: `data:image/png;base64,${diffImageBase64}`, detail: "high" } },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content || "[]";
  return parseBugResponse(content);
}

async function analyzeWithGemini(
  refImageBase64: string,
  devImageBase64: string,
  diffImageBase64: string,
  apiKey: string
): Promise<AIBugResult[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    SYSTEM_PROMPT + "\n\n" + USER_PROMPT,
    {
      inlineData: {
        mimeType: "image/png",
        data: refImageBase64,
      },
    },
    {
      inlineData: {
        mimeType: "image/png",
        data: devImageBase64,
      },
    },
    {
      inlineData: {
        mimeType: "image/png",
        data: diffImageBase64,
      },
    },
  ]);

  const content = result.response.text() || "[]";
  return parseBugResponse(content);
}

function parseBugResponse(content: string): AIBugResult[] {
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  const bugs: AIBugResult[] = JSON.parse(jsonMatch[0]);
  return bugs.map((bug) => ({
    category: bug.category || "layout",
    description: bug.description || "Unspecified issue",
    severity: bug.severity || "minor",
    regionX: bug.regionX,
    regionY: bug.regionY,
    regionW: bug.regionW,
    regionH: bug.regionH,
  }));
}
