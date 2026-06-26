import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
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

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash-lite',
  apiKey: apiKey,
  temperature: 0.3,
  maxOutputTokens: 8192,
});

console.log("Model properties:");
console.log("model.model:", model.model);
console.log("model.apiKey:", model.apiKey ? "present (masked)" : "missing");
console.log("model.temperature:", model.temperature);
console.log("model.maxOutputTokens:", model.maxOutputTokens);

// Try creating a new one from the properties
const fallback = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  apiKey: model.apiKey,
  temperature: model.temperature,
  maxOutputTokens: model.maxOutputTokens,
});

console.log("\nFallback model properties:");
console.log("fallback.model:", fallback.model);
