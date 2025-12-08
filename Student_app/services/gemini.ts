import { GoogleGenAI } from "@google/genai";
import { API_CONFIG } from "@/config/api.config";

export interface ChatAction {
  label: string;
  action: string;
  icon?: string;
}

export interface GeminiResponse {
  message: string;
  actions: ChatAction[];
}

// System prompt
const SYSTEM_PROMPT = `
You are an empathetic, non-clinical student wellness assistant. Your goal is to provide supportive, safe, and helpful responses to students.

CONTEXT & TOOLS:
- **breathing** ("leaf"): Use when user is anxious, panicked, overwhelmed, or needs to calm down.
- **screening** ("clipboard"): Use when user mentions sustained sadness, depression keywords, or unsure about their mental state.
- **resources** ("library"): Use for general info, reading, or low-level stress.
- **sleep_resources** ("moon"): Use SPECIFICALLY for sleep issues, insomnia, or being tired. (Action code: "resources")
- **escalate** ("person"): INDISPENSABLE for mentions of self-harm, suicide, severe crisis, or "want to talk to a human".
- **activities** ("time"): Use when user asks about their history, mood logs, or past attendance.

INSTRUCTIONS:
1. **Analyze Emotion**: Detect the underlying emotion (Anxiety, Depression, Crisis, Curiosity).
2. **Select Action**: Choose the MOST appropriate action from the list above. You can provide up to 2 actions.
3. **Response Style**: Be warm but professional. Avoid generic platitudes. Validate the specific feeling mentioned.
4. **Safety First**: If risk is detected, ignore other rules and prioritize "escalate".

JSON FORMAT:
{
  "message": "Short, empathetic response (max 2 sentences).",
  "actions": [
    { "label": "Action Label", "action": "action_code", "icon": "icon_name" }
  ]
}
`;

// Define types locally if not exported by SDK
interface Part {
  text?: string;
}

interface Content {
  role: "user" | "model";
  parts: Part[];
}

class GeminiService {
  private client: GoogleGenAI;
  private history: Content[] = [];

  constructor() {
    this.client = new GoogleGenAI({ apiKey: API_CONFIG.GEMINI_API_KEY });
  }

  /**
   * Reset conversation history
   */
  startChat() {
    this.history = [];
    console.log("Gemini Chat History Reset");
  }

  /**
   * Generate a response from Gemini based on user input, maintaining history
   */
  async generateResponse(userMessage: string): Promise<GeminiResponse> {
    try {
      // 1. Construct current turn
      const userContent: Content = {
        role: "user",
        parts: [{ text: userMessage }],
      };

      // 2. Prepare full history for the request
      // We must ensure that the history sequence is valid (alternating user/model).
      // Since we control push events, it should be valid, but we handle the current turn here.
      const conversationHistory = [...this.history, userContent];

      console.log("Sending to Gemini:", JSON.stringify(conversationHistory, null, 2));

      const response = await this.client.models.generateContent({
        model: API_CONFIG.GEMINI_MODEL,
        contents: conversationHistory,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
          systemInstruction: SYSTEM_PROMPT, // Use native system instruction
        }
      });

      const responseText = response.text;

      if (!responseText) {
        throw new Error("Empty response from Gemini");
      }

      // 3. Parse Response
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
      let parsedResponse: GeminiResponse;

      try {
        parsedResponse = JSON.parse(cleanJson);
      } catch (e) {
        console.error("Failed to parse JSON response:", cleanJson);
        parsedResponse = {
            message: "I'm listening. Could you tell me more?",
            actions: []
        };
      }

      // 4. Update History (Commit valid turn)
      this.history.push(userContent);
      this.history.push({
        role: "model",
        parts: [{ text: responseText }] // Store raw response to maintain context for next turn
      });

      return parsedResponse;

    } catch (error) {
      console.error("Gemini generation error:", error);
      
      // If error occurs, we DO NOT commit the user message to history, 
      // so the user can try again without creating a double-user-message state.
      // OR we could commit a fallback model response. 
      // Current decision: Do not commit. Next try will send the message again.
      
      return {
        message: "I'm having trouble connecting right now. Please check your internet connection.",
        actions: [],
      };
    }
  }
}

export default new GeminiService();
