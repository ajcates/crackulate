/**
 * Calculation Service - Handles mathematical expression evaluation
 * High cohesion: Only responsible for calculation logic
 */
export class CalculationService {
  #evaluator;
  #parser;
  
  constructor(evaluator, parser) {
    this.#evaluator = evaluator;
    this.#parser = parser;
  }
  
  /**
   * Process multiple lines of expressions
   * @param {string[]} lines - Array of expression lines
   * @param {Object} variables - Current variable scope
   * @returns {Promise<{results: Array, updatedVariables: Object}>}
   */
  async processLines(lines, variables = {}) {
    const results = [];
    const tempScope = {}; // Start with empty scope to ensure deleted variables are removed
    
    for (const [index, line] of lines.entries()) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        results.push({ value: '-', type: 'empty' });
        continue;
      }
      
      try {
        const result = await this.#processLine(line, tempScope, results, index);
        results.push(result);
      } catch (error) {
        console.error('Line processing error:', error);
        results.push({ 
          value: 'e', 
          type: 'error', 
          error: error.message,
          line: index + 1
        });
      }
    }
    
    return { 
      results, 
      updatedVariables: tempScope 
    };
  }
  
  /**
   * Process a single line expression
   * @param {string} line - Expression line
   * @param {Object} scope - Variable scope
   * @param {Array} results - Previous results for line references
   * @param {number} index - Current line index
   * @returns {Promise<Object>} Result object
   */
  async #processLine(line, scope, results, index) {
    const trimmed = line.trim();
    
    if (!trimmed) {
      return { value: null, type: 'empty' };
    }
    
    try {
      // Import current modules for backward compatibility
      const { lexer, Parser } = await import('../lexerParser.js');
      const { evaluate } = await import('../evaluator.js');
      
      const tokens = lexer(trimmed);
      if (tokens.length === 0) {
        return { value: '0', type: 'empty' };
      }
      
      const parser = new Parser(tokens);
      const ast = parser.parse();
      
      // Check if parser consumed all tokens
      if (parser.hasNext()) {
        throw new Error('Extra tokens after expression');
      }
      
      // Convert results array to simple values for evaluator compatibility
      const simpleResults = results.map(r => r.value);
      const value = evaluate(ast, scope, simpleResults, index);
      
      // Handle null or NaN results like original code
      if (value === null) {
        return { value: '0', type: 'null' };
      } else if (value.isNaN && value.isNaN()) {
        return { value: '0', type: 'nan' };
      }
      
      return { 
        value: value.toString(), 
        type: 'number',
        raw: value
      };
    } catch (error) {
      console.error('Calculation error:', error);
      return { value: 'e', type: 'error', error: error.message };
    }
  }
  
  /**
   * Format calculation result for display
   * @param {*} value - Raw calculation result
   * @returns {string} Formatted result
   */
  #formatResult(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') {
      if (!isFinite(value)) return '0';
      
      // Use Decimal.js for precise formatting if available
      if (window.Decimal) {
        try {
          return new window.Decimal(value).toString();
        } catch {
          return value.toString();
        }
      }
      
      return value.toString();
    }
    return String(value);
  }
  
  /**
   * Validate expression syntax without evaluation
   * @param {string} expression - Expression to validate
   * @returns {Promise<{valid: boolean, error?: string}>}
   */
  async validateExpression(expression) {
    try {
      const { tokenize, parse } = await import('../lexerParser.js');
      const tokens = tokenize(expression);
      parse(tokens);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}