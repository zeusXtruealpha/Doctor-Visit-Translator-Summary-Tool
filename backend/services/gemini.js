const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Try different model names that might be available
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent output
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192, // Significantly increased for complete responses
      }
    });
  }

  // Create structured prompt for medical text translation
  createPrompt(medicalText, targetLanguage) {
    const languageMap = {
      'english': 'English',
      'tamil': 'Tamil',
      'hindi': 'Hindi'
    };

    const language = languageMap[targetLanguage] || 'English';

    return `You are a medical translator that helps patients understand their doctor's prescriptions and medical notes. Your job is to translate complex medical terminology into simple, patient-friendly language.

CRITICAL INSTRUCTIONS:
- Use very simple, everyday language that elderly patients can understand
- Avoid medical jargon completely
- Be culturally appropriate for ${language} speakers
- Do NOT provide medical advice or diagnosis
- Only explain what the doctor has already prescribed or noted
- MUST provide complete information for ALL medicines listed
- MUST complete ALL sections fully - do not truncate any section
- Do NOT use any emojis, symbols, or special characters in your response
- Use only plain text with bullet points (•) for lists

INPUT MEDICAL TEXT:
${medicalText}

OUTPUT LANGUAGE: ${language}

Please provide your response in EXACTLY this format. Complete ALL sections fully:

**Condition:**
[Explain the medical condition in very simple terms that a non-medical person can understand]

**Medicines:**
[List ALL medicines with complete information for each one:]
1. [Medicine Name]: [What it treats in simple terms] - Take [exact amount] [when to take it] [with/without food if specified]
2. [Medicine Name]: [What it treats in simple terms] - Take [exact amount] [when to take it] [with/without food if specified]
[Continue for ALL medicines listed - do not skip any]

**Daily Routine:**
[Create a complete daily schedule in a clear, easy-to-read format. Use this structure:]

Morning (8:00 AM):
• [Action to take]

After Breakfast:
• [Action to take]

Afternoon (2:00 PM):
• [Action to take]

Evening (8:00 PM):
• [Action to take]

Bedtime (10:00 PM):
• [Action to take]

Weekly:
• [Weekly tasks like checking blood sugar]

Duration: [If mentioned, state "Continue this routine for X days/weeks/months" or "Review with doctor after X time"]

[Organize all medicines and activities by time of day. Be specific about timing and duration.]

**Do's:**
[List ALL helpful things the patient should do, in simple language - include exercise, diet, monitoring as mentioned]

**Don'ts:**
[List ALL things the patient should avoid, in simple language - include food restrictions, activities to avoid]

IMPORTANT: You must complete ALL sections fully. Do not truncate or cut off any section. Provide complete information for every medicine and instruction mentioned in the input.`;
  }

  // Translate medical text from image using Gemini Vision
  async translateMedicalImage(imageBuffer, mimeType, targetLanguage = 'english') {
    try {
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Image data is required');
      }

      const prompt = `You are a medical translator that helps patients understand their doctor's prescriptions and medical notes from images. Your job is to extract text from this medical image and translate complex medical terminology into simple, patient-friendly language.

IMPORTANT INSTRUCTIONS:
- First, extract all text from the image (prescriptions, doctor notes, medical instructions)
- Use very simple, everyday language that elderly patients can understand
- Avoid medical jargon completely
- Be culturally appropriate for ${targetLanguage === 'tamil' ? 'Tamil' : targetLanguage === 'hindi' ? 'Hindi' : 'English'} speakers
- Do NOT provide medical advice or diagnosis
- Only explain what the doctor has already prescribed or noted
- If you cannot read something clearly, say "Please ask your doctor to clarify this"
- Do NOT use any emojis, symbols, or special characters in your response
- Use only plain text with bullet points (•) for lists

Please provide your response in EXACTLY this format:

**Condition:**
[Based on the medicines prescribed, explain what condition is likely being treated in simple terms]

**Medicines:**
For each medicine from the prescription, provide complete information:
1. [Medicine Name]: [What it treats in simple terms] - Take [exact amount] [when to take it]
2. [Medicine Name]: [What it treats in simple terms] - Take [exact amount] [when to take it]
(Continue for all medicines listed in the prescription)

**Daily Routine:**
[Create a simple daily schedule in this format:]

Morning (8:00 AM):
• [Action to take]

After Breakfast:
• [Action to take]

Afternoon (2:00 PM):
• [Action to take]

Evening (8:00 PM):
• [Action to take]

Bedtime (10:00 PM):
• [Action to take]

Weekly:
• [Weekly tasks]

[Organize all medicines and activities by time of day with specific times]

**Do's:**
[List helpful things the patient should do, in simple language]

**Don'ts:**
[List things the patient should avoid, in simple language]`;

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = result.response;
      const text = response.text();

      // Parse the structured response
      const parsedResponse = this.parseStructuredResponse(text);
      
      return {
        success: true,
        data: {
          originalText: "Medical image processed",
          targetLanguage: targetLanguage,
          ...parsedResponse
        }
      };
    } catch (error) {
      console.error('Gemini Vision API error:', error);
      
      if (error.message.includes('quota') || error.message.includes('limit') || error.status === 429) {
        return {
          success: false,
          error: 'Daily API quota exceeded. Please upgrade your Gemini API plan or try again tomorrow. For hackathon use, consider upgrading to a paid plan for reliable access.'
        };
      }
      
      return {
        success: false,
        error: 'Image processing failed. Please try again or use text input.'
      };
    }
  }

  // Translate medical text using Gemini
  async translateMedicalText(medicalText, targetLanguage = 'english') {
    try {
      if (!medicalText || medicalText.trim().length === 0) {
        throw new Error('Medical text is required');
      }

      const prompt = this.createPrompt(medicalText, targetLanguage);
      
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse the structured response
      const parsedResponse = this.parseStructuredResponse(text);
      
      return {
        success: true,
        data: {
          originalText: medicalText,
          targetLanguage: targetLanguage,
          ...parsedResponse
        },
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Handle specific API errors
      if (error.message.includes('API key')) {
        return {
          success: false,
          error: 'API configuration error. Please check your settings.'
        };
      }
      
      if (error.message.includes('quota') || error.message.includes('limit') || error.status === 429) {
        return {
          success: false,
          error: 'Daily API quota exceeded. Please upgrade your Gemini API plan or try again tomorrow. For hackathon use, consider upgrading to a paid plan for reliable access.'
        };
      }
      
      return {
        success: false,
        error: 'Translation service error. Please try again.'
      };
    }
  }

  // Parse the structured response from Gemini
  parseStructuredResponse(text) {
    const sections = {
      condition: '',
      medicines: '',
      dailyRoutine: '',
      dos: '',
      donts: ''
    };

    try {
      console.log('Raw Gemini response length:', text.length); // Debug log
      console.log('Raw Gemini response:', text); // Debug log
      
      // Split by section headers and extract content - more flexible matching
      const conditionMatch = text.match(/\*\*Condition:\*\*(.*?)(?=\*\*[A-Za-z]|$)/s);
      const medicinesMatch = text.match(/\*\*Medicines:\*\*(.*?)(?=\*\*[A-Za-z]|$)/s);
      const routineMatch = text.match(/\*\*Daily Routine:\*\*(.*?)(?=\*\*[A-Za-z]|$)/s);
      const dosMatch = text.match(/\*\*Do's:\*\*(.*?)(?=\*\*[A-Za-z]|$)/s);
      const dontsMatch = text.match(/\*\*Don'ts:\*\*(.*?)(?=\*\*[A-Za-z]|$)/s);

      sections.condition = conditionMatch ? conditionMatch[1].trim() : 'Please ask your doctor to explain your condition.';
      sections.medicines = medicinesMatch ? medicinesMatch[1].trim() : 'Please ask your doctor about your medications.';
      sections.dailyRoutine = routineMatch ? routineMatch[1].trim() : 'Please ask your doctor for a daily routine.';
      sections.dos = dosMatch ? dosMatch[1].trim() : 'Please ask your doctor for guidance.';
      sections.donts = dontsMatch ? dontsMatch[1].trim() : 'Please ask your doctor about restrictions.';

      // Check for truncation issues - only if truly incomplete
      if (sections.medicines && sections.medicines.length < 20) {
        console.log('Detected truncated medicines section:', sections.medicines);
        sections.medicines = 'The medicine information appears incomplete. Please try again or ask your doctor for detailed instructions about each medication, including dosage and timing.';
      }

      if (sections.dailyRoutine && sections.dailyRoutine.length < 15) {
        console.log('Detected incomplete daily routine section:', sections.dailyRoutine);
        sections.dailyRoutine = 'Please ask your doctor to provide a detailed daily schedule for taking your medicines.';
      }

      // Ensure no section is empty or too short
      Object.keys(sections).forEach(key => {
        if (!sections[key] || sections[key].length < 5) {
          sections[key] = 'Please ask your doctor for more information about this.';
        }
      });

      // Log final sections for debugging
      console.log('Parsed sections:', {
        conditionLength: sections.condition.length,
        medicinesLength: sections.medicines.length,
        dailyRoutineLength: sections.dailyRoutine.length,
        dosLength: sections.dos.length,
        dontsLength: sections.donts.length
      });

    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      
      // Fallback: return the raw text in condition section
      sections.condition = text || 'Unable to process the medical text. Please try again.';
      sections.medicines = 'Please ask your doctor about your medications.';
      sections.dailyRoutine = 'Please ask your doctor for a daily routine.';
      sections.dos = 'Please ask your doctor for guidance.';
      sections.donts = 'Please ask your doctor about restrictions.';
    }

    return sections;
  }

  // List available models
  async listAvailableModels() {
    try {
      // Return the known working models since listModels isn't available in this SDK version
      return {
        success: true,
        models: [
          {
            name: 'gemini-2.5-flash',
            displayName: 'Gemini 2.5 Flash',
            description: 'Fast and efficient model for text generation (currently in use)'
          },
          {
            name: 'gemini-2.0-flash',
            displayName: 'Gemini 2.0 Flash',
            description: 'Alternative fast model for text generation'
          },
          {
            name: 'gemini-flash-latest',
            displayName: 'Gemini Flash Latest',
            description: 'Latest version of the Flash model'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to list models:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test the Gemini API connection
  async testConnection() {
    try {
      const testPrompt = "Say 'Hello, the medical translator API is working correctly.'";
      const result = await this.model.generateContent(testPrompt);
      const response = result.response;
      const text = response.text();
      
      return {
        success: true,
        message: 'Gemini API connection successful',
        response: text
      };
    } catch (error) {
      console.error('Gemini API test failed:', error);
      
      return {
        success: false,
        error: error.message,
        availableModels: null
      };
    }
  }
}

module.exports = new GeminiService();