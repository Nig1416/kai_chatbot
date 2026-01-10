import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function checkModels() {
    console.log("Fetching models from:", URL.replace(API_KEY, "HIDDEN_KEY"));
    try {
        const response = await fetch(URL);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
        } else if (data.models) {
            console.log("\n✅ Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("Unknown response format:", data);
        }
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

checkModels();
