/**
 * Compression utilities for sharing calculations via URL
 * Implements BWT (Burrows-Wheeler Transform) and RLE (Run-Length Encoding)
 */

/**
 * Burrows-Wheeler Transform implementation
 */
class BWT {
  /**
   * Apply Burrows-Wheeler Transform to input string
   * @param {string} input - Input string to transform
   * @returns {object} - {transformed: string, index: number}
   */
  static encode(input) {
    if (!input || input.length === 0) {
      return { transformed: '', index: 0 };
    }
    
    // Add end-of-string marker
    const text = input + '\0';
    const rotations = [];
    
    // Generate all rotations
    for (let i = 0; i < text.length; i++) {
      rotations.push({
        rotation: text.substring(i) + text.substring(0, i),
        index: i
      });
    }
    
    // Sort rotations lexicographically
    rotations.sort((a, b) => a.rotation.localeCompare(b.rotation));
    
    // Extract last column and find original index
    let transformed = '';
    let originalIndex = 0;
    
    for (let i = 0; i < rotations.length; i++) {
      const rotation = rotations[i].rotation;
      transformed += rotation[rotation.length - 1];
      
      if (rotations[i].index === 0) {
        originalIndex = i;
      }
    }
    
    return { transformed, index: originalIndex };
  }
  
  /**
   * Reverse Burrows-Wheeler Transform
   * @param {string} transformed - BWT transformed string
   * @param {number} index - Original string index
   * @returns {string} - Original string
   */
  static decode(transformed, index) {
    if (!transformed || transformed.length === 0) {
      return '';
    }
    
    const length = transformed.length;
    
    // Create sorted characters with their original positions
    const sorted = Array.from(transformed)
      .map((char, i) => ({ char, originalIndex: i }))
      .sort((a, b) => a.char.localeCompare(b.char));
    
    // Build transformation array
    const transform = new Array(length);
    let counts = {};
    
    // Count occurrences and build transform array
    for (let i = 0; i < length; i++) {
      const char = transformed[i];
      counts[char] = (counts[char] || 0);
      
      // Find the position in sorted array
      let sortedIndex = 0;
      for (let j = 0; j < sorted.length; j++) {
        if (sorted[j].char === char && counts[char] === 0) {
          sortedIndex = j;
          counts[char]++;
          break;
        } else if (sorted[j].char === char) {
          counts[char]--;
        }
      }
      
      transform[sortedIndex] = i;
    }
    
    // Reconstruct original string
    let result = '';
    let currentIndex = index;
    
    for (let i = 0; i < length; i++) {
      result += sorted[currentIndex].char;
      currentIndex = transform[currentIndex];
    }
    
    // Remove end-of-string marker
    return result.replace(/\0$/, '');
  }
}

/**
 * Run-Length Encoding implementation
 */
class RLE {
  /**
   * Apply Run-Length Encoding to input string
   * @param {string} input - Input string to encode
   * @returns {string} - RLE encoded string
   */
  static encode(input) {
    if (!input || input.length === 0) {
      return '';
    }
    
    let encoded = '';
    let count = 1;
    let currentChar = input[0];
    
    for (let i = 1; i < input.length; i++) {
      if (input[i] === currentChar && count < 9) { // Limit to single digit for simplicity
        count++;
      } else {
        // Encode the run
        if (count === 1) {
          // Special handling for digits to avoid confusion
          if (/\d/.test(currentChar)) {
            encoded += `1${currentChar}`;
          } else {
            encoded += currentChar;
          }
        } else {
          encoded += count.toString() + currentChar;
        }
        currentChar = input[i];
        count = 1;
      }
    }
    
    // Handle the last run
    if (count === 1) {
      // Special handling for digits to avoid confusion
      if (/\d/.test(currentChar)) {
        encoded += `1${currentChar}`;
      } else {
        encoded += currentChar;
      }
    } else {
      encoded += count.toString() + currentChar;
    }
    
    return encoded;
  }
  
  /**
   * Decode Run-Length Encoded string
   * @param {string} encoded - RLE encoded string
   * @returns {string} - Decoded string
   */
  static decode(encoded) {
    if (!encoded || encoded.length === 0) {
      return '';
    }
    
    let decoded = '';
    let i = 0;
    
    while (i < encoded.length) {
      // Check if current character is a digit (count)
      if (/\d/.test(encoded[i])) {
        const count = parseInt(encoded[i], 10);
        i++;
        
        if (i < encoded.length) {
          const char = encoded[i];
          decoded += char.repeat(count);
          i++;
        }
      } else {
        // Single character (no repetition)
        decoded += encoded[i];
        i++;
      }
    }
    
    return decoded;
  }
}

/**
 * Simple and reliable compression using just Base64 encoding
 */
export class CompressionService {
  /**
   * Compress text using Base64 encoding (no compression, just encoding)
   * @param {string} text - Text to encode
   * @returns {string} - Base64 encoded string
   */
  static compress(text) {
    try {
      if (!text || text.length === 0) {
        return '';
      }
      
      // Create data object
      const data = {
        content: text,
        originalLength: text.length
      };
      
      // Convert to JSON and then Base64
      const jsonString = JSON.stringify(data);
      const base64 = btoa(unescape(encodeURIComponent(jsonString)));
      
      console.log('CompressionService.compress() - original:', text);
      console.log('CompressionService.compress() - base64:', base64);
      
      return base64;
    } catch (error) {
      console.error('Compression error:', error);
      return '';
    }
  }
  
  /**
   * Decompress Base64 encoded text
   * @param {string} compressed - Base64 encoded string
   * @returns {string} - Original text
   */
  static decompress(compressed) {
    try {
      if (!compressed || compressed.length === 0) {
        return '';
      }
      
      console.log('CompressionService.decompress() - input:', compressed);
      
      // Step 1: Decode Base64
      const jsonString = decodeURIComponent(escape(atob(compressed)));
      console.log('CompressionService.decompress() - jsonString:', jsonString);
      
      const data = JSON.parse(jsonString);
      console.log('CompressionService.decompress() - data:', data);
      
      const original = data.content;
      console.log('CompressionService.decompress() - original:', original);
      
      return original;
    } catch (error) {
      console.error('Decompression error:', error);
      return '';
    }
  }
  
  /**
   * Simple dictionary-based compression
   * @param {string} text - Input text
   * @returns {string} - Compressed text
   */
  static dictionaryCompress(text) {
    // Build frequency map
    const words = text.match(/\w+|[^\w\s]|\s+/g) || [];
    const frequency = {};
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    // Create dictionary for common words (frequency > 1)
    const dictionary = {};
    let dictIndex = 0;
    
    Object.entries(frequency)
      .filter(([word, freq]) => freq > 1 && word.length > 1)
      .sort(([, a], [, b]) => b - a) // Sort by frequency desc
      .slice(0, 62) // Limit dictionary size
      .forEach(([word]) => {
        dictionary[word] = String.fromCharCode(33 + dictIndex); // Start from '!'
        dictIndex++;
      });
    
    // Replace words with dictionary symbols
    let compressed = text;
    Object.entries(dictionary).forEach(([word, symbol]) => {
      compressed = compressed.replace(new RegExp(this.escapeRegex(word), 'g'), symbol);
    });
    
    // Prepend dictionary
    const dictString = Object.entries(dictionary)
      .map(([word, symbol]) => `${symbol}:${word}`)
      .join('|');
    
    return `${dictString}||${compressed}`;
  }
  
  /**
   * Simple dictionary-based decompression
   * @param {string} compressed - Compressed text
   * @returns {string} - Original text
   */
  static dictionaryDecompress(compressed) {
    const parts = compressed.split('||');
    if (parts.length !== 2) {
      return compressed; // No dictionary, return as-is
    }
    
    const [dictString, compressedText] = parts;
    
    // Parse dictionary
    const dictionary = {};
    if (dictString) {
      dictString.split('|').forEach(entry => {
        const [symbol, word] = entry.split(':');
        if (symbol && word) {
          dictionary[symbol] = word;
        }
      });
    }
    
    // Replace symbols with original words
    let decompressed = compressedText;
    Object.entries(dictionary).forEach(([symbol, word]) => {
      decompressed = decompressed.replace(new RegExp(this.escapeRegex(symbol), 'g'), word);
    });
    
    return decompressed;
  }
  
  /**
   * Escape string for use in regex
   * @param {string} string - String to escape
   * @returns {string} - Escaped string
   */
  static escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  /**
   * Get compression ratio
   * @param {string} original - Original text
   * @param {string} compressed - Compressed text
   * @returns {number} - Compression ratio (0-1)
   */
  static getCompressionRatio(original, compressed) {
    if (!original || !compressed) return 0;
    return compressed.length / original.length;
  }
  
  /**
   * Test compression/decompression with sample data
   * @param {string} testText - Text to test
   * @returns {object} - Test results
   */
  static test(testText) {
    const compressed = this.compress(testText);
    const decompressed = this.decompress(compressed);
    const ratio = this.getCompressionRatio(testText, compressed);
    
    return {
      original: testText,
      compressed,
      decompressed,
      ratio,
      success: testText === decompressed,
      originalSize: testText.length,
      compressedSize: compressed.length,
      savedBytes: testText.length - compressed.length
    };
  }
}