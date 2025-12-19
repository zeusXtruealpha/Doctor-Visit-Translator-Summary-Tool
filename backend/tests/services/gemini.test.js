const fc = require('fast-check');

// Set up environment for testing
process.env.GEMINI_API_KEY = 'test-key-for-testing';

// Mock the Google Generative AI to avoid real API calls in tests
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn()
    })
  }))
}));

const geminiService = require('../../services/gemini');

describe('Gemini Service Property Tests', () => {
  let mockGenerateContent;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mocked generateContent function
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const mockGenAI = new GoogleGenerativeAI();
    const mockModel = mockGenAI.getGenerativeModel();
    mockGenerateContent = mockModel.generateContent;
  });

  describe('Property 7: Error recovery preservation', () => {
    /**
     * **Feature: doctor-visit-translator, Property 7: Error recovery preservation**
     * **Validates: Requirements 8.2, 8.3**
     * 
     * This property tests that when the AI service fails, the system preserves
     * the user's input and provides appropriate error recovery options.
     */
    it('should preserve input and provide error recovery when AI service fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid medical text inputs (avoid input validation failures)
          fc.string({ minLength: 20, maxLength: 200 })
            .filter(s => s.trim().length >= 10)
            .map(s => 'Patient has ' + s.trim() + ' symptoms'),
          fc.constantFrom('english', 'tamil', 'hindi'),
          async (medicalText, targetLanguage) => {
            // Simulate various API failures
            const apiErrors = [
              new Error('API key invalid'),
              new Error('quota exceeded'),
              new Error('rate limit exceeded'),
              new Error('service temporarily unavailable'),
              new Error('network timeout')
            ];
            
            const randomError = apiErrors[Math.floor(Math.random() * apiErrors.length)];
            
            // Mock the API to throw an error
            mockGenerateContent.mockRejectedValue(randomError);
            
            // Call the service
            const result = await geminiService.translateMedicalText(medicalText, targetLanguage);
            
            // Property assertions:
            // 1. The service should not crash and should return a structured response
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
            expect(result).toHaveProperty('success');
            
            // 2. When service fails, success should be false
            expect(result.success).toBe(false);
            
            // 3. Error recovery: Should provide appropriate error message (Requirement 8.2)
            expect(result).toHaveProperty('error');
            expect(typeof result.error).toBe('string');
            expect(result.error.length).toBeGreaterThan(0);
            
            // 4. Input preservation: The original input should be preserved in the call
            expect(mockGenerateContent).toHaveBeenCalledWith(
              expect.stringContaining(medicalText)
            );
            
            // 5. Error messages should be user-friendly, not technical
            const userFriendlyMessages = [
              'API configuration error',
              'Service temporarily unavailable',
              'Translation service error'
            ];
            
            const hasUserFriendlyMessage = userFriendlyMessages.some(msg => 
              result.error.includes(msg)
            );
            expect(hasUserFriendlyMessage).toBe(true);
          }
        ),
        { numRuns: 50 } // Reduced for faster testing
      );
    });

    it('should handle parsing errors gracefully and preserve input', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 20, maxLength: 200 })
            .filter(s => s.trim().length >= 10)
            .map(s => 'Patient has ' + s.trim() + ' condition'),
          fc.constantFrom('english', 'tamil', 'hindi'),
          async (medicalText, targetLanguage) => {
            // Mock successful API call but with malformed response
            const malformedResponses = [
              '', // Empty response
              'Invalid response format',
              'Partial **Condition:** only',
              '**Medicines:** without other sections',
              'Random text without structure'
            ];
            
            const randomResponse = malformedResponses[Math.floor(Math.random() * malformedResponses.length)];
            
            mockGenerateContent.mockResolvedValue({
              response: {
                text: () => randomResponse
              }
            });
            
            const result = await geminiService.translateMedicalText(medicalText, targetLanguage);
            
            // Property assertions:
            // 1. Service should handle parsing errors gracefully
            expect(result).toBeDefined();
            expect(result.success).toBe(true); // Parsing errors are handled, not failures
            
            // 2. Should provide fallback content when parsing fails
            expect(result.data).toBeDefined();
            expect(result.data).toHaveProperty('condition');
            expect(result.data).toHaveProperty('medicines');
            expect(result.data).toHaveProperty('dailyRoutine');
            expect(result.data).toHaveProperty('dos');
            expect(result.data).toHaveProperty('donts');
            
            // 3. Input preservation: Original text should be preserved
            expect(result.data.originalText).toBe(medicalText);
            expect(result.data.targetLanguage).toBe(targetLanguage);
            
            // 4. Fallback messages should be helpful
            const fallbackMessage = 'Please ask your doctor';
            const hasFallbackContent = Object.values(result.data).some(value => 
              typeof value === 'string' && value.includes(fallbackMessage)
            );
            expect(hasFallbackContent).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Input validation properties', () => {
    it('should handle edge cases in medical text input', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(''), // Empty string
            fc.constant('   '), // Whitespace only
            fc.string({ maxLength: 9 }) // Too short
          ),
          async (invalidInput) => {
            const result = await geminiService.translateMedicalText(invalidInput, 'english');
            
            // Property: Invalid inputs should be handled gracefully
            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            // The error message should indicate a problem
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});