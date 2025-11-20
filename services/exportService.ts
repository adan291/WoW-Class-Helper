/**
 * Export Service
 * Handles exporting content in various formats
 */

export interface ExportOptions {
  format: 'pdf' | 'markdown' | 'html' | 'json';
  includeMetadata: boolean;
  includeTimestamp: boolean;
}

class ExportService {
  /**
   * Export content as markdown
   */
  exportAsMarkdown(
    title: string,
    content: string,
    options?: Partial<ExportOptions>
  ): string {
    const opts = { includeMetadata: true, includeTimestamp: true, ...options };

    let markdown = '';

    if (opts.includeMetadata) {
      markdown += `# ${title}\n\n`;
      if (opts.includeTimestamp) {
        markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;
      }
    }

    markdown += content;

    return markdown;
  }

  /**
   * Export content as HTML
   */
  exportAsHTML(
    title: string,
    content: string,
    options?: Partial<ExportOptions>
  ): string {
    const opts = { includeMetadata: true, includeTimestamp: true, ...options };

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .metadata { color: #7f8c8d; font-size: 0.9em; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>`;

    if (opts.includeMetadata) {
      if (opts.includeTimestamp) {
        html += `<div class="metadata">Exported on ${new Date().toLocaleString()}</div>`;
      }
    }

    html += `<div class="content">${this.markdownToHTML(content)}</div>
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * Export content as JSON
   */
  exportAsJSON(
    title: string,
    content: string,
    metadata?: Record<string, any>
  ): string {
    const data = {
      title,
      content,
      exportedAt: new Date().toISOString(),
      metadata: metadata || {},
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Download file
   */
  downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy to clipboard
   */
  async copyToClipboard(content: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Generate shareable URL
   */
  generateShareURL(classId: string, tab: string, specId?: string): string {
    const params = new URLSearchParams();
    params.set('class', classId);
    params.set('tab', tab);
    if (specId) params.set('spec', specId);

    const baseURL = window.location.origin + window.location.pathname;
    return `${baseURL}?${params.toString()}`;
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
      .replace(/\n\n/g, '</p><p>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n/g, '<br>');

    return `<p>${html}</p>`;
  }
}

export const exportService = new ExportService();
