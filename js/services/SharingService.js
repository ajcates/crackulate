import { CompressionService } from '../utils/compression.js';

/**
 * Service for sharing calculations via URLs
 */
export class SharingService {
  constructor() {
    this.baseUrl = window.location.origin + window.location.pathname;
  }
  
  /**
   * Create a shareable URL from calculation content
   * @param {string} content - Calculator content to share
   * @param {string} filename - Optional filename for the shared calculation
   * @returns {string} - Shareable URL
   */
  createShareUrl(content, filename = null) {
    try {
      // Compress the content
      const compressed = CompressionService.compress(content);
      
      if (!compressed) {
        throw new Error('Failed to compress content');
      }
      
      // Create share data object
      const shareData = {
        v: 1, // Version for future compatibility
        d: compressed, // Compressed data
        t: Date.now() // Timestamp
      };
      
      // Add filename if provided
      if (filename) {
        shareData.n = filename;
      }
      
      // Encode share data
      const encodedData = btoa(JSON.stringify(shareData));
      
      // Create URL with hash
      const shareUrl = `${this.baseUrl}#${encodedData}`;
      
      return shareUrl;
    } catch (error) {
      console.error('Error creating share URL:', error);
      throw new Error('Failed to create share URL');
    }
  }
  
  /**
   * Extract calculation content from URL hash
   * @param {string} url - URL to parse (optional, uses current URL if not provided)
   * @returns {object|null} - {content: string, filename?: string, timestamp?: number} or null
   */
  parseShareUrl(url = null) {
    try {
      const targetUrl = url || window.location.href;
      const hashIndex = targetUrl.indexOf('#');
      
      if (hashIndex === -1) {
        return null; // No hash in URL
      }
      
      const hash = targetUrl.substring(hashIndex + 1);
      
      if (!hash) {
        return null; // Empty hash
      }
      
      // Decode share data
      const shareDataJson = atob(hash);
      const shareData = JSON.parse(shareDataJson);
      
      // Validate version
      if (!shareData.v || shareData.v !== 1) {
        console.warn('Unsupported share URL version:', shareData.v);
        return null;
      }
      
      // Decompress content
      const content = CompressionService.decompress(shareData.d);
      
      if (!content) {
        throw new Error('Failed to decompress shared content');
      }
      
      const result = { content };
      
      // Add optional fields
      if (shareData.n) {
        result.filename = shareData.n;
      }
      
      if (shareData.t) {
        result.timestamp = shareData.t;
        result.date = new Date(shareData.t);
      }
      
      return result;
    } catch (error) {
      console.error('Error parsing share URL:', error);
      return null;
    }
  }
  
  /**
   * Check if current URL contains shared content
   * @returns {boolean}
   */
  hasSharedContent() {
    return this.parseShareUrl() !== null;
  }
  
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} - Success status
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return success;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
  
  /**
   * Share calculation and copy URL to clipboard
   * @param {string} content - Content to share
   * @param {string} filename - Optional filename
   * @returns {Promise<{url: string, copied: boolean}>}
   */
  async shareCalculation(content, filename = null) {
    try {
      const url = this.createShareUrl(content, filename);
      const copied = await this.copyToClipboard(url);
      
      return { url, copied };
    } catch (error) {
      console.error('Error sharing calculation:', error);
      throw error;
    }
  }
  
  /**
   * Get sharing statistics
   * @param {string} content - Original content
   * @returns {object} - Compression and URL statistics
   */
  getSharingStats(content) {
    try {
      const compressed = CompressionService.compress(content);
      const shareUrl = this.createShareUrl(content);
      
      const stats = {
        originalSize: content.length,
        compressedSize: compressed.length,
        urlLength: shareUrl.length,
        compressionRatio: compressed.length / content.length,
        urlFriendly: shareUrl.length < 2000, // Most browsers support up to 2000+ chars
        estimatedSavings: ((1 - (compressed.length / content.length)) * 100).toFixed(1) + '%'
      };
      
      return stats;
    } catch (error) {
      console.error('Error calculating sharing stats:', error);
      return null;
    }
  }
  
  /**
   * Clear URL hash (remove shared content from URL)
   */
  clearUrlHash() {
    if (window.location.hash) {
      // Use pushState to update URL without page reload
      const newUrl = window.location.href.split('#')[0];
      window.history.pushState({}, document.title, newUrl);
    }
  }
  
  /**
   * Validate if content can be shared (size limitations)
   * @param {string} content - Content to validate
   * @returns {object} - {valid: boolean, reason?: string, maxSize?: number}
   */
  validateSharingContent(content) {
    const maxUrlLength = 2000; // Conservative limit for URL length
    const maxContentLength = 10000; // Arbitrary limit for content
    
    if (!content || content.length === 0) {
      return { valid: false, reason: 'Content is empty' };
    }
    
    if (content.length > maxContentLength) {
      return { 
        valid: false, 
        reason: `Content too large (${content.length} chars, max ${maxContentLength})`,
        maxSize: maxContentLength
      };
    }
    
    try {
      const testUrl = this.createShareUrl(content);
      
      if (testUrl.length > maxUrlLength) {
        return {
          valid: false,
          reason: `Generated URL too long (${testUrl.length} chars, max ${maxUrlLength})`,
          maxSize: maxUrlLength
        };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Failed to generate share URL' };
    }
  }
}