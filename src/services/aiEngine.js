import { GoogleGenerativeAI } from '@google/generative-ai';

export async function analyzeSymptomsWithAI(symptomsText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API Key missing! Please add VITE_GEMINI_API_KEY to your .env file and restart the server.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a strict medical diagnostic classification system. 
The patient reports the following symptoms in natural language: "${symptomsText}"

Based on these symptoms, identify the 3 most probable diseases/conditions.
You MUST reply strictly with a raw JSON array containing exactly 1 to 3 objects. 
No markdown blocks, no conversational text, purely JSON.

Schema per object:
{
  "disease": "string (Common name, space-separated, e.g. 'Common Cold')",
  "diseaseKey": "string (Underscore separated, e.g. 'Common_Cold')",
  "probability": number (Integer 0-100 indicating confidence),
  "prognosisScore": number (Float 0.0 to 1.0 indicating overall severity weight),
  "severity": "string ('Low', 'Medium', or 'High')",
  "suggested_medicines": ["string", "string"] (Array of 1 to 3 common generic drug names for treatment)
}

JSON Array Output:`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract strictly the JSON array
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("AI did not return a valid data array.");
    }
    
    const jsonStr = text.substring(startIndex, endIndex + 1);
    const data = JSON.parse(jsonStr);
    
    // Sort logic to match natural prediction
    return data.sort((a, b) => b.probability - a.probability);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw new Error(`AI Interpreting Failed: ${error.message || 'Check browser console.'}`);
  }
}

export async function analyzeMedicineCompatibilityWithAI(med1, med2) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API Key missing! Add VITE_GEMINI_API_KEY to your .env');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a strict pharmacology interaction engine.
Determine the interaction risk between "${med1}" and "${med2}".
You MUST reply strictly with raw JSON. No markdown blocks.

Schema:
{
  "found": true,
  "riskScore": number (0-100, where 0 is perfectly safe, 100 is lethal),
  "riskLevel": "string ('Low', 'Moderate', 'High')",
  "compatible": boolean (true if riskScore < 30),
  "interaction_reason": "string (Detailed explanation of why they interact or why they are safe)",
  "sameIngredient": boolean,
  "sameAllergy": boolean,
  "contraConflict": boolean,
  "m1": {
    "Medicine_Name": "${med1}",
    "Active_Ingredient": "string",
    "Allergy_Group": "string (Or 'Unknown')",
    "Side_Effects": "string (Short description)",
    "Contraindications": "string"
  },
  "m2": {
    "Medicine_Name": "${med2}",
    "Active_Ingredient": "string",
    "Allergy_Group": "string",
    "Side_Effects": "string",
    "Contraindications": "string"
  }
}

JSON Output:`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex === -1 || endIndex === -1) throw new Error("Invalid format");
    return JSON.parse(text.substring(startIndex, endIndex + 1));
  } catch (error) {
    console.error("AI Compatibility failed:", error);
    throw new Error(`AI Interaction Check Failed: ${error.message || 'Unknown error'}`);
  }
}
