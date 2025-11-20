/**
 * Comparison Service
 * Handles content comparison
 */

export interface ComparisonItem {
  classId: string;
  tab: string;
  specId?: string;
  title: string;
  content: string;
}

export interface ComparisonResult {
  items: ComparisonItem[];
  similarities: string[];
  differences: string[];
}

class ComparisonService {
  /**
   * Compare two items
   */
  compare(item1: ComparisonItem, item2: ComparisonItem): ComparisonResult {
    const similarities = this.findSimilarities(item1.content, item2.content);
    const differences = this.findDifferences(item1.content, item2.content);

    return {
      items: [item1, item2],
      similarities,
      differences,
    };
  }

  /**
   * Find similarities between two texts
   */
  private findSimilarities(text1: string, text2: string): string[] {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const common: string[] = [];
    words1.forEach(word => {
      if (words2.has(word) && word.length > 3) {
        common.push(word);
      }
    });

    return common.slice(0, 10);
  }

  /**
   * Find differences between two texts
   */
  private findDifferences(text1: string, text2: string): string[] {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const unique1: string[] = [];
    const unique2: string[] = [];

    words1.forEach(word => {
      if (!words2.has(word) && word.length > 3) {
        unique1.push(word);
      }
    });

    words2.forEach(word => {
      if (!words1.has(word) && word.length > 3) {
        unique2.push(word);
      }
    });

    return [...unique1.slice(0, 5), ...unique2.slice(0, 5)];
  }

  /**
   * Extract key points from text
   */
  extractKeyPoints(text: string): string[] {
    const lines = text.split('\n');
    const keyPoints: string[] = [];

    lines.forEach(line => {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        keyPoints.push(line.substring(2).trim());
      } else if (line.startsWith('## ') || line.startsWith('### ')) {
        keyPoints.push(line.replace(/^#+\s/, '').trim());
      }
    });

    return keyPoints.slice(0, 10);
  }

  /**
   * Calculate similarity percentage
   */
  calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    let matches = 0;
    set1.forEach(word => {
      if (set2.has(word)) {
        matches++;
      }
    });

    const total = Math.max(set1.size, set2.size);
    return total > 0 ? Math.round((matches / total) * 100) : 0;
  }
}

export const comparisonService = new ComparisonService();
