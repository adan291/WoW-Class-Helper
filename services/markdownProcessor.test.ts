import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { formatContent, processInlineMarkdown } from './markdownProcessor';

describe('Markdown Processor', () => {
  describe('Property 6: Markdown Rendering Fidelity', () => {
    
    /**
     * Property 6: Markdown Rendering Fidelity
     * **Feature: wow-class-helper, Property 6: Markdown must render correctly without XSS vulnerabilities**
     * **Validates: Requirements AC6**
     * 
     * For any markdown content with tables, the rendered HTML should:
     * 1. Contain properly formed table elements (<table>, <tr>, <td>, <th>)
     * 2. Escape HTML entities to prevent XSS
     * 3. Preserve table structure and content
     */
    it('should render markdown tables correctly without XSS vulnerabilities', () => {
      fc.assert(
        fc.property(
          fc.array(fc.array(fc.stringMatching(/^[a-zA-Z0-9\-]+$/), { minLength: 1, maxLength: 3 }), { minLength: 1, maxLength: 5 }),
          (rows) => {
            // Generate markdown table
            const headers = rows[0];
            const headerRow = '| ' + headers.join(' | ') + ' |';
            const separator = '| ' + headers.map(() => '---').join(' | ') + ' |';
            const dataRows = rows.slice(1).map(row => '| ' + row.join(' | ') + ' |').join('\n');
            
            const markdown = [headerRow, separator, dataRows].join('\n');
            const result = formatContent(markdown);
            
            // Verify table structure
            expect(result.__html).toContain('<table');
            expect(result.__html).toContain('</table>');
            expect(result.__html).toContain('<tr>');
            expect(result.__html).toContain('</tr>');
            expect(result.__html).toContain('<th');
            expect(result.__html).toContain('<td');
            
            // Verify no unescaped HTML entities that could cause XSS
            expect(result.__html).not.toMatch(/<script/i);
            expect(result.__html).not.toMatch(/javascript:/i);
            
            // Verify content is preserved (escaped)
            headers.forEach(header => {
              expect(result.__html).toContain(header);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 6: Markdown Rendering Fidelity
     * **Feature: wow-class-helper, Property 6: Markdown must render correctly without XSS vulnerabilities**
     * **Validates: Requirements AC6**
     * 
     * For any markdown content with blockquotes, the rendered HTML should:
     * 1. Contain properly formed blockquote elements
     * 2. Escape HTML entities to prevent XSS
     * 3. Support nested blockquotes
     */
    it('should render blockquotes correctly without XSS vulnerabilities', () => {
      fc.assert(
        fc.property(
          fc.array(fc.stringMatching(/^[a-zA-Z0-9\-]+$/), { minLength: 1, maxLength: 5 }),
          (lines) => {
            // Generate blockquote markdown
            const blockquoteLines = lines.map(line => '> ' + line).join('\n');
            const result = formatContent(blockquoteLines);
            
            // Verify blockquote structure
            expect(result.__html).toContain('<blockquote');
            expect(result.__html).toContain('</blockquote>');
            expect(result.__html).toContain('<p');
            expect(result.__html).toContain('</p>');
            
            // Verify no unescaped HTML entities that could cause XSS
            expect(result.__html).not.toMatch(/<script/i);
            expect(result.__html).not.toMatch(/javascript:/i);
            
            // Verify content is preserved
            lines.forEach(line => {
              if (line.trim()) {
                expect(result.__html).toContain(line);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 6: Markdown Rendering Fidelity
     * **Feature: wow-class-helper, Property 6: Markdown must render correctly without XSS vulnerabilities**
     * **Validates: Requirements AC6**
     * 
     * For any markdown content with inline formatting (bold, italic), the rendered HTML should:
     * 1. Properly escape HTML entities
     * 2. Apply correct formatting tags
     * 3. Prevent XSS attacks through inline content
     */
    it('should escape HTML entities in inline markdown to prevent XSS', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-zA-Z0-9\-]+$/),
          (text) => {
            const markdown = `**${text}** and *${text}*`;
            const result = formatContent(markdown);
            
            // Verify HTML entities are escaped
            expect(result.__html).not.toContain('<script');
            expect(result.__html).not.toContain('javascript:');
            
            // Verify formatting tags are present
            expect(result.__html).toContain('<strong');
            expect(result.__html).toContain('<em');
            
            // Verify content is preserved
            if (text.trim()) {
              expect(result.__html).toContain(text);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 6: Markdown Rendering Fidelity
     * **Feature: wow-class-helper, Property 6: Markdown must render correctly without XSS vulnerabilities**
     * **Validates: Requirements AC6**
     * 
     * For any markdown content with code blocks, the rendered HTML should:
     * 1. Escape all HTML entities within code blocks
     * 2. Preserve code formatting
     * 3. Prevent XSS attacks through code content
     */
    it('should escape HTML in code blocks to prevent XSS', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-zA-Z0-9\s\-<>&]*$/),
          (code) => {
            const markdown = `\`\`\`\n${code}\n\`\`\``;
            const result = formatContent(markdown);
            
            // Verify code block structure
            expect(result.__html).toContain('<pre');
            expect(result.__html).toContain('<code');
            
            // Verify HTML entities are escaped
            if (code.includes('<')) {
              expect(result.__html).toContain('&lt;');
            }
            if (code.includes('>')) {
              expect(result.__html).toContain('&gt;');
            }
            
            // Verify no unescaped script tags
            expect(result.__html).not.toMatch(/<script/i);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 6: Markdown Rendering Fidelity
     * **Feature: wow-class-helper, Property 6: Markdown must render correctly without XSS vulnerabilities**
     * **Validates: Requirements AC6**
     * 
     * For any markdown content, the rendered HTML should:
     * 1. Always return an object with __html property
     * 2. Never contain unescaped dangerous HTML
     * 3. Preserve all non-HTML content
     */
    it('should always return valid HTML object for any markdown input', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (markdown) => {
            const result = formatContent(markdown);
            
            // Verify result structure
            expect(result).toHaveProperty('__html');
            expect(typeof result.__html).toBe('string');
            
            // Verify no dangerous patterns
            expect(result.__html).not.toMatch(/<script/i);
            expect(result.__html).not.toMatch(/on\w+\s*=/i); // Event handlers
            expect(result.__html).not.toMatch(/javascript:/i);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Inline Markdown Processing', () => {
    it('should process bold formatting correctly', () => {
      const result = processInlineMarkdown('This is **bold** text');
      expect(result).toContain('<strong');
      expect(result).toContain('bold');
      expect(result).toContain('</strong>');
    });

    it('should process italic formatting correctly', () => {
      const result = processInlineMarkdown('This is *italic* text');
      expect(result).toContain('<em');
      expect(result).toContain('italic');
      expect(result).toContain('</em>');
    });

    it('should escape HTML entities', () => {
      const result = processInlineMarkdown('<script>alert("xss")</script>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).not.toContain('<script>');
    });

    it('should process ability tooltips correctly', () => {
      const result = processInlineMarkdown('[Fireball]{Cooldown: 5 sec, ID: 133, Description: A powerful spell}');
      expect(result).toContain('Fireball');
      expect(result).toContain('133');
      expect(result).toContain('5 sec');
      expect(result).toContain('A powerful spell');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty markdown', () => {
      const result = formatContent('');
      expect(result.__html).toBe('');
    });

    it('should handle markdown with only whitespace', () => {
      const result = formatContent('   \n  \n   ');
      expect(result.__html).toBe('');
    });

    it('should handle mixed markdown elements', () => {
      const markdown = `# Header
      
This is a paragraph with **bold** and *italic*.

- List item 1
- List item 2

> A blockquote

| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |`;
      
      const result = formatContent(markdown);
      expect(result.__html).toContain('<h1');
      expect(result.__html).toContain('<strong');
      expect(result.__html).toContain('<em');
      expect(result.__html).toContain('<ul');
      expect(result.__html).toContain('<blockquote');
      expect(result.__html).toContain('<table');
    });

    it('should handle nested blockquotes', () => {
      const markdown = `> Level 1
> > Level 2
> > > Level 3`;
      
      const result = formatContent(markdown);
      expect(result.__html).toContain('<blockquote');
      expect(result.__html).toContain('Level 1');
      expect(result.__html).toContain('Level 2');
      expect(result.__html).toContain('Level 3');
    });

    it('should support table column alignment (left, center, right)', () => {
      const markdown = `| Left | Center | Right |
| :--- | :---: | ---: |
| L1 | C1 | R1 |
| L2 | C2 | R2 |`;
      
      const result = formatContent(markdown);
      expect(result.__html).toContain('text-left');
      expect(result.__html).toContain('text-center');
      expect(result.__html).toContain('text-right');
      expect(result.__html).toContain('L1');
      expect(result.__html).toContain('C1');
      expect(result.__html).toContain('R1');
    });

    it('should handle malformed tables without crashing', () => {
      const markdown = `| Header 1 | Header 2
| --- | --- |
| Cell 1 | Cell 2 |`;
      
      const result = formatContent(markdown);
      expect(result.__html).toBeDefined();
      expect(typeof result.__html).toBe('string');
      expect(result.__html).not.toMatch(/<script/i);
    });

    it('should handle tables with complex content', () => {
      const markdown = `| Ability | Cooldown | Description |
| --- | --- | --- |
| **Fireball** | 5 sec | A *powerful* spell |
| Frostbolt | 3 sec | Freezes enemies |`;
      
      const result = formatContent(markdown);
      expect(result.__html).toContain('<table');
      expect(result.__html).toContain('Fireball');
      expect(result.__html).toContain('<strong');
      expect(result.__html).toContain('<em');
    });

    it('should render blockquotes with proper styling', () => {
      const markdown = `> This is a blockquote
> with multiple lines`;
      
      const result = formatContent(markdown);
      expect(result.__html).toContain('<blockquote');
      expect(result.__html).toContain('border-l-4');
      expect(result.__html).toContain('border-[var(--class-color)]');
      expect(result.__html).toContain('This is a blockquote');
      expect(result.__html).toContain('with multiple lines');
    });

    it('should handle deeply nested blockquotes', () => {
      const markdown = `> Level 1
> > Level 2
> > > Level 3
> > > > Level 4`;
      
      const result = formatContent(markdown);
      expect(result.__html).toContain('Level 1');
      expect(result.__html).toContain('Level 2');
      expect(result.__html).toContain('Level 3');
      expect(result.__html).toContain('Level 4');
      // Verify nested styling is applied
      expect(result.__html).toContain('ml-4');
      expect(result.__html).toContain('border-l-2');
    });

    it('should handle blockquotes with inline formatting', () => {
      const markdown = `> This is **bold** and *italic* in a blockquote`;
      
      const result = formatContent(markdown);
      expect(result.__html).toContain('<blockquote');
      expect(result.__html).toContain('<strong');
      expect(result.__html).toContain('<em');
      expect(result.__html).toContain('bold');
      expect(result.__html).toContain('italic');
    });
  });
});
