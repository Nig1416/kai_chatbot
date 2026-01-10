import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Core Generation Function
export async function generateResponse(history, systemPrompt, userMessage) {
    try {
        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            },
            systemInstruction: {
                role: "system",
                parts: [{ text: systemPrompt }]
            }
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error.message);

        // FAIL-SAFE FOR DEMO:
        if (error.message.includes("429") || error.message.includes("Quota")) {
            return "⚠️ **Neural Link Unstable (Rate Limit):** My semantic core is cooling down. Please wait 30 seconds. (Data is safe).";
        }

        // Generic Fallback
        return "I am currently operating in **Offline Mode** due to connection interference. I received your message: \"" + userMessage + "\". Functionality will restore shortly.";
    }
}

// Memory Consolidation Function
export async function extractFacts(conversationText) {
    const prompt = `
    Analyze the conversation below. Your goal is to extract **LONG-TERM MEMORIES** about the User.
    
    Look for:
    1. **Preferences**: (Food, music, movies, hobbies).
    2. **Personal Details**: (Name, location, job, relationships).
    3. **Emotional Context**: (e.g., "User is stressed about exams", "User is excited about a trip").
    
    Rules:
    - IGNORE trivial greetings ("hi", "how are you").
    - IGNORE short-term intents ("write an email").
    - Output must be a simple **JSON Array of Strings**.
    - Example: ["User loves sushi", "User lives in Mumbai", "User is learning React"].
    
    Conversation:
    ${conversationText}
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Fact Extraction Error:", error);
        return [];
    }
}
