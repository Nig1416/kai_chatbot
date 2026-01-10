import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTest = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro-latest"
];

async function testAll() {
    console.log("🔍 Testing Model Generation Capabilities...\n");

    for (const modelName of modelsToTest) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello");
            const response = await result.response;
            const text = response.text();
            console.log(`✅ SUCCESS! Output: "${text.trim()}"`);
            console.log(`🚀 RESULT: Use '${modelName}' in your code.\n`);
            return; // Stop at the first working one
        } catch (error) {
            if (error.status === 429) {
                console.log(`❌ Quota Exceeded (429)`);
            } else if (error.status === 404) {
                console.log(`❌ Not Found (404)`);
            } else {
                console.log(`❌ Error: ${error.message.split('\n')[0]}`);
            }
        }
    }
    console.log("\n😭 All models failed. Check billing/API key region.");
}

testAll();
