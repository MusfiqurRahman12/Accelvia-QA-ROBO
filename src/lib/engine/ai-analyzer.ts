import OpenAI from "openai";
import { AIBugResult } from "@/types";

/**
 * AI-powered cosmetic bug detection using OpenAI GPT-4o Vision.
 * Users provide their own API key.
 */

export async function analyzeWithAI(
  refImageBase64: string,
  devImageBase64: string,
  diffImageBase64: string,
  apiKey: string
): Promise<AIBugResult[]> {
  if (!apiKey) return [];

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are a senior QA engineer specializing in UI/UX visual testing. 
Analyze the provided screenshots and identify cosmetic bugs. 
Return your analysis as a JSON array with objects having these fields:
- category: one of "spacing", "alignment", "color", "overflow", "missing-element", "font", "layout", "border", "shadow", "opacity"
- description: clear description of the bug. ALWAYS start the description by mentioning the section it is located in (e.g. "In the Header section: ...", "In the Footer: ...", "In the Hero section: ...")
- severity: "critical", "major", or "minor"
- regionX, regionY, regionW, regionH: approximate pixel coordinates of the bug region (optional)

Only return the JSON array, no other text.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Compare these UI screenshots. Image 1 is the design reference, Image 2 is the development build, Image 3 is the pixel diff highlighting mismatches. Identify all cosmetic bugs.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${refImageBase64}`,
                detail: "high",
              },
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${devImageBase64}`,
                detail: "high",
              },
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${diffImageBase64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content || "[]";
    // Extract JSON from the response (handle markdown code blocks)
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
  } catch (error) {
    console.error("AI analysis failed:", error);
    return [];
  }
}
