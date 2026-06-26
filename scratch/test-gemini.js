import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Manually parse .env to get the key since this script runs outside Next.js process
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const keyMatch = envContent.match(/GEMINI_API_KEY\s*=\s*([^\s]+)/);
const apiKey = keyMatch ? keyMatch[1] : null;

if (!apiKey) {
  console.error("GEMINI_API_KEY not found in .env");
  process.exit(1);
}

console.log("Using API Key:", apiKey.substring(0, 10) + "...");

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    console.log("\n--- Testing gemini-2.5-flash ---");
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const response = await model.generateContent("Hello! Respond in 3 words.");
      console.log("Success:", response.response.text());
    } catch (err) {
      console.error("Error for gemini-2.5-flash:", err.message);
    }
  } catch (e) {
    console.error("General error:", e);
  }
}

run();
