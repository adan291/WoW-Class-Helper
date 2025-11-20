/**
 * Print Service
 * Handles print-friendly content generation
 */

export interface PrintOptions {
  includeHeader: boolean;
  includeFooter: boolean;
  includeTimestamp: boolean;
  includeMetadata: boolean;
}

class PrintService {
  /**
   * Generate print-friendly HTML
   */
  generatePrintHTML(
    title: string,
    content: string,
    options: PrintOptions = {
      includeHeader: true,
      includeFooter: true,
      includeTimestamp: true,
      includeMetadata: true,
    }
  ): string {
    const timestamp = new Date().toLocaleString();

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
      padding: 20px;
    }

    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-after: always;
      }
      h1, h2, h3 {
        page-break-after: avoid;
      }
      p {
        page-break-inside: avoid;
      }
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    header {
      border-bottom: 3px solid #333;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      color: #1a1a1a;
    }

    .metadata {
      font-size: 0.9em;
      color: #666;
      margin-top: 10px;
    }

    h2 {
      font-size: 1.8em;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #222;
      border-bottom: 2px solid #ddd;
      padding-bottom: 10px;
    }

    h3 {
      font-size: 1.3em;
      margin-top: 20px;
      margin-bottom: 10px;
      color: #333;
    }

    p {
      margin-bottom: 15px;
      text-align: justify;
    }

    ul, ol {
      margin-left: 30px;
      margin-bottom: 15px;
    }

    li {
      margin-bottom: 8px;
    }

    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    pre {
      background: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin-bottom: 15px;
      border-left: 4px solid #333;
    }

    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 15px;
      margin-left: 0;
      margin-bottom: 15px;
      color: #666;
      font-style: italic;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }

    th {
      background: #f4f4f4;
      font-weight: bold;
    }

    footer {
      border-top: 2px solid #ddd;
      padding-top: 20px;
      margin-top: 40px;
      font-size: 0.9em;
      color: #666;
      text-align: center;
    }

    .print-button {
      background: #333;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1em;
      margin-bottom: 20px;
    }

    .print-button:hover {
      background: #555;
    }

    @media print {
      .print-button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">`;

    if (options.includeHeader) {
      html += `
    <header>
      <h1>${title}</h1>`;

      if (options.includeMetadata) {
        html += `
      <div class="metadata">
        <p>Generated on ${timestamp}</p>
      </div>`;
      }

      html += `
    </header>`;
    }

    html += `
    <button class="print-button no-print" onclick="window.print()">🖨️ Print</button>
    <main>
      ${this.markdownToHTML(content)}
    </main>`;

    if (options.includeFooter) {
      html += `
    <footer>
      <p>WoW AI Class Helper - ${timestamp}</p>
    </footer>`;
    }

    html += `
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * Open print preview
   */
  openPrintPreview(title: string, content: string, options?: PrintOptions): void {
    const html = this.generatePrintHTML(title, content, options);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  }

  /**
   * Convert markdown to HTML (basic)
   */
  private markdownToHTML(markdown: string): string {
    let html = markdown
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n/g, '<br>');

    return `<p>${html}</p>`;
  }
}

export const printService = new PrintService();
