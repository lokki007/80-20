import { GoogleGenAI, Type } from "@google/genai";
import { ParetoAnalysis } from "../types";

export const analyzeTopic = async (topic: string): Promise<ParetoAnalysis> => {
  // Initialize AI client inside the function to ensure it uses the latest process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = "gemini-3-pro-preview";
  
  const prompt = `
    Perform a recursive "Fractal 80/20" analysis on the topic: "${topic}".
    
    You must identify:
    1. The Top 20% (The Vital Few): Drives 80% of results.
    2. The Top 4% (The Critical Few - 20% of the 20%): Drives ~64% of results.
    3. The Top 1% (The Absolute Best - 20% of the 4%): The single most high-leverage element.
    4. The Bottom 80% (The Trivial Many): Sources of problems/waste.
    5. Monetization Strategy: How to allocate resources vs revenue potential.
    6. Chart Data: Identify 5 distinct inputs (categories/actions) and their estimated contribution to the total result (impact).
    
    Return the data in the specified JSON format.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 2048 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          focus: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ["title", "content"]
          },
          problems: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ["title", "content"]
          },
          fractalAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.INTEGER, description: "1 for 20%, 2 for 4%, 3 for 1%" },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                keyEntities: { type: Type.ARRAY, items: { type: Type.STRING } },
                justification: { type: Type.STRING }
              },
              required: ["level", "title", "description", "keyEntities", "justification"]
            }
          },
          monetization: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              streams: {
                type: Type.ARRAY,
                items: {
                   type: Type.OBJECT,
                   properties: {
                     name: { type: Type.STRING },
                     focusAllocation: { type: Type.NUMBER, description: "0-100" },
                     revenuePotential: { type: Type.NUMBER, description: "0-100" }
                   },
                   required: ["name", "focusAllocation", "revenuePotential"]
                }
              }
            },
            required: ["title", "content", "streams"]
          },
          chartData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                impactValue: { type: Type.NUMBER, description: "Relative impact score out of 100" },
                effortValue: { type: Type.NUMBER, description: "Relative effort score out of 100" }
              },
              required: ["label", "impactValue", "effortValue"]
            }
          },
          actionPlan: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["topic", "focus", "problems", "fractalAnalysis", "monetization", "chartData", "actionPlan"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No analysis generated");
  }

  return JSON.parse(response.text) as ParetoAnalysis;
};

export const generateParetoIllustration = async (topic: string, focusContext: string): Promise<string> => {
  // Initialize AI client inside the function to ensure it uses the latest process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = "gemini-3-pro-image-preview";
  
  const prompt = `
    Create a highly abstract, minimalistic black and white data visualization art piece representing the 80/20 rule for: ${topic}.
    
    The concept: "The Vital Few vs The Trivial Many".
    
    Visual Elements:
    - Use geometric primitives (circles, squares, lines).
    - Extreme contrast: Large areas of black vs small distinct areas of white (or vice versa).
    - Asymmetry: Focus on the inequality of distribution.
    - Style: Swiss International Style, Bauhaus, Brutalist Data Art.
    - No text, no greyscale, only #000000 and #FFFFFF.
    
    Make it look like a high-end architectural diagram or a mathematical proof visualization.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
};