# Hook: Validate Gemini Service on Update

**Trigger**: When `services/geminiService.ts` is modified

**Description**: Automatically validate that the Gemini service maintains proper error handling, prompt structure, and API integration patterns after any changes.

**Actions**:
1. Check for proper try-catch blocks around API calls
2. Verify all exported functions follow naming convention (get*)
3. Ensure sourceUrls parameter is properly handled
4. Validate prompt structure includes required sections
5. Alert if API key handling changes

**Files Monitored**: `services/geminiService.ts`

**Frequency**: On file save

**Notes**:
- Prevents accidental removal of error handling
- Ensures consistency with steering guidelines
- Validates prompt engineering best practices
