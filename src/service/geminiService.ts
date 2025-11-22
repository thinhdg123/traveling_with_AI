
import { GoogleGenAI, Type, Schema, Chat, FunctionDeclaration } from "@google/genai";
import { UserPreferences, TripPlan, TravelStyle } from "../types/types";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_AGENT_API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

// --- Schema Definitions (kept for tool calling) ---
const eventSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "Unique UUID for the event" },
    time: { type: Type.STRING, description: "Time of day (e.g., 09:00 AM)" },
    activity: { type: Type.STRING, description: "Short title of activity" },
    locationName: { type: Type.STRING, description: "Name of the place/venue" },
    address: { type: Type.STRING, description: "Real, specific physical address for Google Maps navigation" },
    phoneNumber: { type: Type.STRING, description: "Contact phone number (if applicable/available)" },
    website: { type: Type.STRING, description: "Official website URL (if applicable)" },
    description: { type: Type.STRING, description: "2 sentence description explaining why this place is chosen." },
    costEstimate: { type: Type.NUMBER, description: "Estimated cost per person (numeric only)" },
    currency: { type: Type.STRING, description: "Currency code (e.g., USD, VND)" },
    transportMethod: { type: Type.STRING, description: "How to get here from previous location" },
    transportDuration: { type: Type.STRING, description: "Estimated travel time" },
    type: { type: Type.STRING, description: "One of: activity, food, lodging, transport" },
    status: { type: Type.STRING, description: "Always set to 'accepted' initially" }
  },
  required: ["id", "time", "activity", "locationName", "address", "costEstimate", "type"]
};

const daySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    day: { type: Type.INTEGER },
    date: { type: Type.STRING },
    theme: { type: Type.STRING, description: "Theme of the day" },
    events: {
      type: Type.ARRAY,
      items: eventSchema
    }
  },
  required: ["day", "events"]
};

const tripPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A short engaging summary of the trip" },
    tips: { type: Type.STRING, description: "3 essential tips for this specific trip. Sentences separated by periods." },
    stats: {
      type: Type.OBJECT,
      properties: {
        totalCost: { type: Type.NUMBER },
        currency: { type: Type.STRING },
        totalEvents: { type: Type.INTEGER },
        weatherSummary: { type: Type.STRING, description: "Expected weather forecast" },
        durationDays: { type: Type.INTEGER }
      },
      required: ["totalCost", "weatherSummary"]
    },
    itinerary: {
      type: Type.ARRAY,
      items: daySchema
    }
  },
  required: ["summary", "itinerary", "stats"]
};

// --- Tool Definition for Updating Itinerary ---
const updateItineraryTool: FunctionDeclaration = {
  name: "update_itinerary",
  description: "Call this function ONLY when you need to modify, add, or remove events in the travel plan based on user request. Return the FULL updated trip plan.",
  parameters: tripPlanSchema
};

let chatSession: Chat | null = null;

/**
 * Helper to extract JSON from text that might contain markdown or grounding text.
 */
const extractJsonFromText = (text: string): unknown => {
  try {
    // Try standard parsing first
    return JSON.parse(text);
  } catch (e) {
    // Try finding markdown json blocks
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {
        console.error("Failed to parse Markdown JSON", e2);
      }
    }
    // Try finding just the first brace structure
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch (e3) {
        console.error("Failed to parse brace JSON", e3);
      }
    }
    throw new Error("Could not parse JSON from model response");
  }
};

/**
 * Generates the initial trip using Google Search Grounding.
 */
export const generateTrip = async (prefs: UserPreferences): Promise<TripPlan> => {
  // Determine budget string logic
  const budgetInstruction = prefs.exactBudget && prefs.exactBudget > 0
    ? `STRICT TOTAL BUDGET: ${prefs.exactBudget} ${prefs.currency || 'USD'} for the ENTIRE party. You MUST try to keep the Total Cost below this number.`
    : `Budget Preference: ${prefs.budget || "Moderate"}.`;

  const prompt = `
    Act as an expert travel agent. Plan a detailed trip to ${prefs.destination}.
    Dates: ${prefs.startDate} to ${prefs.endDate}.
    Travel Party: ${prefs.partySize.adults} Adults, ${prefs.partySize.children} Children.
    Styles: ${prefs.style.join(", ")}.
    User Note: ${prefs.prompt}.
    ${budgetInstruction}
    
    TASK:
    1. Use Google Search to find REAL-TIME weather, up-to-date ticket prices, and opening hours for ${prefs.destination}.
    2. Select activities appropriate for ${prefs.partySize.children > 0 ? 'families with children' : 'adults'}.
    3. Calculate estimated Total Cost for the WHOLE party (${prefs.partySize.adults + prefs.partySize.children} people) in ${prefs.currency || 'USD'}.
    
    OUTPUT FORMAT:
    After gathering information, output the itinerary strictly as a JSON object.
    The JSON must match this TypeScript interface:
    
    {
      summary: string;
      tips: string;
      stats: {
        totalCost: number; // Total for everyone in ${prefs.currency || 'USD'}
        currency: string; // Must be ${prefs.currency || 'USD'}
        totalEvents: number;
        weatherSummary: string;
        durationDays: number;
      },
      itinerary: [
        {
          day: number,
          date: string, // YYYY-MM-DD
          theme: string,
          events: [
             {
                id: string, // UUID
                time: string,
                activity: string,
                locationName: string,
                address: string, // REAL ADDRESS from Search
                phoneNumber: string,
                website: string,
                description: string,
                costEstimate: number, // Cost per person
                currency: string,
                transportMethod: string,
                transportDuration: string,
                type: "activity" | "food" | "lodging" | "transport",
                status: "accepted"
             }
          ]
        }
      ]
    }
    
    Ensure the JSON is valid and contains no comments. Wrap it in \`\`\`json code blocks.
  `;

  try {
    // We use tools: [{googleSearch: {}}] to get real data.
    // We DO NOT use responseSchema here because it often conflicts with Search tools in the current API version.
    // Instead we rely on the prompt to force JSON output.
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });

    if (!response.text) throw new Error("No content generated");

    // Extract JSON from the potentially grounded response (which contains citations/text)
    const initialPlan = extractJsonFromText(response.text) as TripPlan;

    // Initialize Chat Session
    chatSession = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: `You are a smart travel assistant. 
            Context: User is viewing a plan for ${prefs.partySize.adults} adults and ${prefs.partySize.children} children to ${prefs.destination}.
            Goal: Refine the plan using 'update_itinerary'.
            
            Token Saving Rules:
            1. Concise text responses.
            2. Call 'update_itinerary' immediately for changes.
            3. Only output text if asked a question.
            
            Data Rules:
            1. Maintain valid JSON.
            2. Use Google Search if the user asks for new real-time info (like "check if it's raining today").`,
        tools: [{ functionDeclarations: [updateItineraryTool] }, { googleSearch: {} }]
      },
      history: [
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'model', parts: [{ text: "Here is your initial plan." }] }
      ]
    });

    return initialPlan;
  } catch (error) {
    console.error("Trip generation failed:", error);
    throw error;
  }
};

/**
 * Sends a message to the chatbot.
 */
export const sendChatMessage = async (message: string, currentPlan: TripPlan): Promise<{ text: string, updatedPlan?: TripPlan }> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized. Generate a trip first.");
  }

  try {
    const response = await chatSession.sendMessage({ message });

    let responseText = response.text || "";
    let updatedPlan: TripPlan | undefined;

    // Check for function calls
    const toolCalls = response.functionCalls;
    if (toolCalls && toolCalls.length > 0) {
      for (const call of toolCalls) {
        if (call.name === 'update_itinerary') {
          updatedPlan = call.args as unknown as TripPlan;

          const toolResponse = await chatSession.sendMessage({
            message: [{
              functionResponse: {
                name: call.name,
                response: { result: "Itinerary updated successfully on client." },
                id: call.id
              }
            }]
          });

          if (toolResponse.text) {
            responseText = toolResponse.text;
          } else if (!responseText) {
            responseText = "I've updated your plan.";
          }
        }
      }
    }

    return { text: responseText, updatedPlan };

  } catch (error) {
    console.error("Chat failed", error);
    return { text: "I'm sorry, I had trouble processing that request." };
  }
}

/**
 * Updates the trip by regenerating rejected events.
 */
export const updateTrip = async (currentPlan: TripPlan, rejectedIds: string[]): Promise<TripPlan> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized. Generate a trip first.");
  }

  const prompt = `
      The user has rejected events with IDs: ${rejectedIds.join(", ")}.
      Replace them with new activities appropriate for the party size.
      Use Google Search to ensure new places are open.
      CRITICAL: Include specific Address, Price, and details.
      Call 'update_itinerary'.
    `;

  try {
    const response = await chatSession.sendMessage({ message: prompt });
    let updatedPlan: TripPlan | undefined;

    // Check for function calls
    const toolCalls = response.functionCalls;
    if (toolCalls && toolCalls.length > 0) {
      for (const call of toolCalls) {
        if (call.name === 'update_itinerary') {
          updatedPlan = call.args as unknown as TripPlan;

          await chatSession.sendMessage({
            message: [{
              functionResponse: {
                name: call.name,
                response: { result: "Itinerary updated successfully." },
                id: call.id
              }
            }]
          });
        }
      }
    }

    if (!updatedPlan) {
      throw new Error("AI did not provide an updated plan.");
    }

    return updatedPlan;

  } catch (error) {
    console.error("Update trip failed", error);
    throw error;
  }
};
