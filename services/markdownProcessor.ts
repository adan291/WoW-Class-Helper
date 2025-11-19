/**
 * Markdown processor for rendering guide content
 * Supports: headers, lists, code blocks, blockquotes, tables, bold, italic, ability tooltips
 */

interface ProcessedMarkdown {
  __html: string;
}

/**
 * Process inline markdown formatting (bold, italic, tooltips)
 * @param text - Raw text with markdown formatting
 * @returns HTML string with processed formatting
 */
export const processInlineMarkdown = (text: string): string => {
  let processed = text
    // Escape basic HTML chars to prevent injection
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold: **text**
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
  
  // Italic: *text*
  processed = processed.replace(/\*(.*?)\*/g, '<em class="text-gray-300">$1</em>');

  // Tooltips: [Ability]{Cooldown: X. ID: Y. Description: Z}
  const tooltipRegex = /\[([^\]]+)\]\{([^\}]+)\}/g;
  processed = processed.replace(tooltipRegex, (match, ability, content) => {
    const cooldownMatch = content.match(/Cooldown:\s*([^.]+)/i);
    const idMatch = content.match(/ID:\s*(\d+)/i);
    const descMatch = content.match(/Description:\s*(.+)$/i);

    const cooldown = cooldownMatch ? cooldownMatch[1].trim() : 'N/A';
    const spellId = idMatch ? idMatch[1].trim() : '???';
    const description = descMatch ? descMatch[1].trim() : (content.includes('Cooldown') ? '' : content);

    const firstLetter = ability.charAt(0).toUpperCase();

    return `<span class="group relative inline-block font-medium cursor-help">
        <span class="text-yellow-300 border-b border-dashed border-yellow-500/60 hover:text-yellow-200 hover:border-yellow-300 transition-colors">
            ${ability}
            ${spellId !== '???' ? `<span class="text-gray-500 text-xs font-mono ml-1 group-hover:text-gray-400">[ID:${spellId}]</span>` : ''}
        </span>
        
        <span class="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 pointer-events-none transform group-hover:translate-y-0 translate-y-1 overflow-hidden">
            
            <!-- Tooltip Header -->
            <div class="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center">
                 <div class="h-10 w-10 rounded bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 flex items-center justify-center text-lg font-bold text-yellow-500 shadow-inner mr-3">
                    ${firstLetter}
                 </div>
                 <div>
                    <strong class="block text-yellow-400 text-base leading-tight">${ability}</strong>
                    <span class="text-xs text-gray-400 font-mono">ID: ${spellId}</span>
                 </div>
            </div>

            <!-- Tooltip Body -->
            <div class="p-4">
                ${cooldown !== 'N/A' ? `
                <div class="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
                    Cooldown: <span class="text-white ml-1">${cooldown}</span>
                </div>` : ''}
                
                <p class="text-sm text-gray-300 leading-relaxed">
                    ${description}
                </p>
            </div>
            
            <!-- Arrow -->
            <div class="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-gray-900 border-b border-r border-gray-700 transform rotate-45"></div>
        </span>
    </span>`;
  });

  return processed;
};

/**
 * Format markdown content into HTML
 * Supports: headers, lists, code blocks, blockquotes, tables
 * @param text - Raw markdown text
 * @returns Object with __html property for dangerouslySetInnerHTML
 */
/**
 * Parse table alignment from separator row
 * Supports: :--- (left), :---: (center), ---: (right), --- (default left)
 * @param separatorLine - The separator line from markdown table
 * @returns Array of alignment values ('left', 'center', 'right')
 */
const parseTableAlignments = (separatorLine: string): string[] => {
  const cells = separatorLine.split('|').slice(1, -1).map(cell => cell.trim());
  return cells.map(cell => {
    const hasLeft = cell.startsWith(':');
    const hasRight = cell.endsWith(':');
    if (hasLeft && hasRight) return 'center';
    if (hasRight) return 'right';
    return 'left';
  });
};

/**
 * Get Tailwind text alignment class
 * @param alignment - Alignment value ('left', 'center', 'right')
 * @returns Tailwind class string
 */
const getAlignmentClass = (alignment: string): string => {
  switch (alignment) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    default:
      return 'text-left';
  }
};

export const formatContent = (text: string): ProcessedMarkdown => {
  const lines = text.split('\n');
  let html = '';
  let inList = false;
  let inCodeBlock = false;
  let inTable = false;
  let inBlockquote = false;
  let tableAlignments: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code Blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        html += '</code></pre>';
        inCodeBlock = false;
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        if (inBlockquote) { html += '</blockquote>'; inBlockquote = false; }
        html += '<pre class="bg-black bg-opacity-30 rounded-lg p-4 my-4 overflow-x-auto border-l-4 border-[var(--class-color)]"><code class="text-sm font-mono text-gray-300 whitespace-pre-wrap">';
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      html += line.replace(/</g, "&lt;").replace(/>/g, "&gt;") + '\n';
      continue;
    }

    // Blockquotes (support nested blockquotes with multiple > symbols)
    if (line.startsWith('>')) {
      if (!inBlockquote) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<blockquote class="border-l-4 border-[var(--class-color)] pl-4 my-4 italic text-gray-400 bg-gray-900/30 py-2 rounded-r">';
        inBlockquote = true;
      }
      // Remove leading > symbols and spaces (support nested blockquotes)
      let blockquoteContent = line;
      let nestLevel = 0;
      while (blockquoteContent.startsWith('>')) {
        blockquoteContent = blockquoteContent.substring(1).replace(/^\s/, '');
        nestLevel++;
      }
      const content = processInlineMarkdown(blockquoteContent);
      // Add nested blockquote styling based on nesting level
      const nestingClass = nestLevel > 1 ? 'ml-4 border-l-2 border-gray-600 pl-3' : '';
      html += `<p class="my-2 ${nestingClass}">${content}</p>`;
    } else {
      if (inBlockquote) {
        html += '</blockquote>';
        inBlockquote = false;
      }

      // Tables (markdown table detection)
      if (line.includes('|') && line.trim().startsWith('|')) {
        if (!inTable) {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<div class="overflow-x-auto my-4"><table class="w-full border-collapse border border-gray-600 rounded-lg overflow-hidden">';
          inTable = true;
        }
        
        // Split by pipe and filter empty cells (first and last are usually empty)
        const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
        
        // Check if this is a header row (next line contains dashes and pipes)
        const isHeader = i + 1 < lines.length && lines[i + 1].includes('---') && lines[i + 1].includes('|');
        const cellTag = isHeader ? 'th' : 'td';
        
        // Parse alignments from separator row if this is header
        if (isHeader && tableAlignments.length === 0) {
          tableAlignments = parseTableAlignments(lines[i + 1]);
        }
        
        html += '<tr>';
        cells.forEach((cell, index) => {
          const cellContent = processInlineMarkdown(cell);
          const alignment = tableAlignments[index] || 'left';
          const alignClass = getAlignmentClass(alignment);
          html += `<${cellTag} class="border border-gray-600 px-4 py-2 ${alignClass} ${isHeader ? 'bg-gray-800 font-bold text-[var(--class-color)]' : 'text-gray-300'}">${cellContent}</${cellTag}>`;
        });
        html += '</tr>';
      } else {
        if (inTable) {
          html += '</table></div>';
          inTable = false;
          tableAlignments = [];
        }

        // Skip table separator lines (lines with dashes and pipes)
        if (line.includes('---') && line.includes('|')) {
          continue;
        }
        
        // Lists
        if (line.match(/^(\*|-)\s/)) {
          if (!inList) {
            html += '<ul class="list-none pl-2 my-4 space-y-2 text-gray-300">';
            inList = true;
          }
          const content = processInlineMarkdown(line.substring(2));
          html += `<li class="flex items-start"><span class="mr-3 mt-1.5 text-[var(--class-color)] text-xs">◆</span><span class="leading-relaxed">${content}</span></li>`;
        } else {
          if (inList) {
            html += '</ul>';
            inList = false;
          }

          // Headers
          if (line.startsWith('### ')) {
            const content = processInlineMarkdown(line.substring(4));
            html += `<h3 class="text-xl font-bold mt-8 mb-3 text-[var(--class-color)] tracking-wide flex items-center"><span class="w-1.5 h-6 bg-[var(--class-color)] mr-3 rounded-full"></span>${content}</h3>`;
          } else if (line.startsWith('## ')) {
            const content = processInlineMarkdown(line.substring(3));
            html += `<h2 class="text-2xl font-bold mt-10 mb-4 border-b border-gray-700 pb-2 text-white flex items-center">${content}</h2>`;
          } else if (line.startsWith('# ')) {
            const content = processInlineMarkdown(line.substring(2));
            html += `<h1 class="text-3xl font-bold mt-8 mb-6 border-b-2 border-[var(--class-color)] pb-2 text-white">${content}</h1>`;
          } else if (line.trim() !== '') {
            // Paragraphs
            const content = processInlineMarkdown(line);
            html += `<p class="my-3 leading-7 text-gray-300/90">${content}</p>`;
          }
        }
      }
    }
  }

  if (inList) html += '</ul>';
  if (inCodeBlock) html += '</code></pre>';
  if (inBlockquote) html += '</blockquote>';
  if (inTable) html += '</table></div>';

  return { __html: html };
};
