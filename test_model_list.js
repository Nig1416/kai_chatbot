import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log("Checking available models...");
        // 
        // Note: The specific listModels method isn't always exposed cleanly in the JS SDK generic wrapper,
        // but let's try a standard model first and see if we can get a specific error or success.

        const tryModel = async (name) => {
            try {
                const model = genAI.getGenerativeModel({ model: name });
                const result = await model.generateContent("Test");
                console.log(`✅ Model '${name}' is WORKING.`);
                return true;
            } catch (e) {
                console.log(`❌ Model '${name}' failed: ${e.message}`);
                return false;
            }
        };

        const candidates = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];

        for (const m of candidates) {
            await tryModel(m);
        }

    } catch (error) {
        console.error("Fatal Error:", error);
    }
}

listModels();
