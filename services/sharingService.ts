/**
 * Sharing Service
 * Handles social media sharing
 */

export interface ShareOptions {
  title: string;
  description: string;
  url: string;
  hashtags?: string[];
}

class SharingService {
  /**
   * Generate share URL
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
   * Share to Twitter
   */
  shareToTwitter(options: ShareOptions): void {
    const text = `${options.title}\n\n${options.description}\n\n${options.url}`;
    const hashtags = options.hashtags?.join(',') || 'WoW,ClassHelper';
    const twitterURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=${hashtags}`;
    window.open(twitterURL, '_blank', 'width=550,height=420');
  }

  /**
   * Share to Discord
   */
  shareToDiscord(options: ShareOptions): void {
    const message = `**${options.title}**\n\n${options.description}\n\n${options.url}`;
    const discordURL = `https://discord.com/channels/@me`;
    // Discord doesn't have a direct share URL, so we copy to clipboard instead
    navigator.clipboard.writeText(message);
  }

  /**
   * Share to Reddit
   */
  shareToReddit(options: ShareOptions): void {
    const redditURL = `https://reddit.com/submit?title=${encodeURIComponent(options.title)}&url=${encodeURIComponent(options.url)}`;
    window.open(redditURL, '_blank', 'width=550,height=420');
  }

  /**
   * Copy to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Generate share card text
   */
  generateShareCard(classId: string, tab: string, title: string): string {
    return `Check out this ${classId} ${tab} guide on WoW AI Class Helper!\n\n${title}\n\nGet expert strategies and tips for your class.`;
  }
}

export const sharingService = new SharingService();
