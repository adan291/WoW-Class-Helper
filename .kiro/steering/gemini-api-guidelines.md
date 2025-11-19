---
inclusion: fileMatch
fileMatchPattern: 'services/geminiService.ts'
---

# Gemini API Integration Guidelines

## API Configuration

### Model Selection
- **Primary Model**: `gemini-2.5-flash`
- **Rationale**: Fast inference, cost-efficient, suitable for guide generation
- **Alternative**: `gemini-2.0-pro` for higher quality (if needed)

### Request Structure
```typescript
const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
});
```

## Prompt Engineering Best Practices

### Guide Generation Prompts
1. **Context**: Always include class name, specialization, and expansion context
2. **Format**: Explicitly request markdown output
3. **Structure**: Specify section headers and organization
4. **Examples**: Provide examples for complex formatting (e.g., ability tooltips)
5. **Constraints**: Mention target audience (expert players, not beginners)

### Ability Tooltip Format
When referencing abilities, use this exact format:
```
[Ability Name]{Cooldown: X sec. ID: SpellID. Description: Brief description}
```

Example:
```
[Mortal Strike]{Cooldown: 6 sec. ID: 12294. Description: A vicious strike dealing high physical damage.}
```

### Source URL Injection
When custom URLs are provided:
1. Prepend source URLs to the prompt
2. Instruct the model to prioritize provided sources over base knowledge
3. Request citation of sources at the end
4. Format: One URL per line with bullet point

## Error Handling

### Common Errors
- **API Key Missing**: Check `process.env.API_KEY` is set
- **Rate Limiting**: Implement exponential backoff for retries
- **Invalid Prompt**: Validate prompt structure before sending
- **Network Errors**: Catch and display user-friendly messages

### User-Facing Messages
- Generic: "Failed to generate content from AI. Please try again."
- Admin: Include suggestion to check custom URLs
- Detailed: Log full error to console for debugging

## Performance Optimization

### Caching Strategy
- Currently: No caching (regenerate on each tab change)
- Future: Cache by content key (tab + spec + dungeon)
- TTL: 1 hour per cached entry

### Request Optimization
- Avoid redundant API calls
- Use memoization for content keys
- Batch requests if possible (future enhancement)

## Security Considerations

### API Key Protection
- Never log or expose API key
- Inject at build time via Vite
- Use environment variables only
- Rotate keys regularly

### Prompt Injection Prevention
- Validate custom URLs before injection
- Escape user input in prompts
- Limit prompt length to prevent abuse
- Sanitize output before rendering

## Testing

### Mock Responses
For testing, mock the Gemini API with realistic markdown responses:
```typescript
const mockResponse = `
# Class Overview
This is a test guide...

## Stat Priority
- Haste > Mastery > Crit
`;
```

### Test Cases
1. Successful guide generation
2. API error handling
3. Custom URL injection
4. Markdown rendering
5. Ability tooltip parsing

## Future Enhancements

### Phase 2
- Implement response caching
- Add streaming responses for faster perceived performance
- Support multiple models with fallback logic

### Phase 3
- Batch API calls for multiple specs
- Implement cost tracking and optimization
- Add analytics for popular guides

### Phase 4
- Fine-tuned models for WoW-specific content
- Real-time knowledge updates
- Integration with WoW API for current patch data
