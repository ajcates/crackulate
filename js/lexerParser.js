// **Token Types Definition**
const TokenTypes = {
  NUMBER: 'NUMBER',
  VARIABLE: 'VARIABLE',
  OPERATOR: 'OPERATOR',
  ASSIGN: 'ASSIGN',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LINEREF: 'LINEREF'
};

// **Lexer Function**
function lexer(input) {
  const tokens = [];
  let i = 0;
  while (i < input.length) {
    let char = input[i];
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    if (char === '#') {
      i++;
      let num = '';
      while (i < input.length && /[0-9]/.test(input[i])) {
        num += input[i];
        i++;
      }
      tokens.push({ type: TokenTypes.LINEREF, value: parseInt(num) });
      continue;
    }
    if (/[0-9]/.test(char) || char === '.') {
      let num = '';
      while (i < input.length && /[0-9.]/.test(input[i])) {
        num += input[i];
        i++;
      }
      tokens.push({ type: TokenTypes.NUMBER, value: parseFloat(num) });
      continue;
    }
    if (/[a-zA-Z]/.test(char)) {
      let varName = '';
      while (i < input.length && /[a-zA-Z0-9]/.test(input[i])) {
        varName += input[i];
        i++;
      }
      tokens.push({ type: TokenTypes.VARIABLE, value: varName });
      continue;
    }
    if (['+', '-', '*', '/'].includes(char)) {
      tokens.push({ type: TokenTypes.OPERATOR, value: char });
      i++;
      continue;
    }
    if (char === '=') {
      tokens.push({ type: TokenTypes.ASSIGN, value: char });
      i++;
      continue;
    }
    if (char === '(') {
      tokens.push({ type: TokenTypes.LPAREN, value: char });
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: TokenTypes.RPAREN, value: char });
      i++;
      continue;
    }
    i++;
  }
  return tokens;
}

// **Parser Class**
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.index = 0;
  }

  peek() { return this.tokens[this.index]; }
  consume() { return this.tokens[this.index++]; }
  hasNext() { return this.index < this.tokens.length; }

  parse() {
    if (!this.peek()) return null;
    if (this.peek().type === TokenTypes.VARIABLE && this.hasNext() && this.tokens[this.index + 1].type === TokenTypes.ASSIGN) {
      return this.parseAssignment();
    }
    return this.parseExpression();
  }

  parseAssignment() {
    const variable = this.consume().value;
    this.consume(); // '='
    const expression = this.parseExpression();
    return { type: 'assignment', variable, expression };
  }

  parseExpression() {
    let left = this.parseTerm();
    while (this.peek() && ['+', '-'].includes(this.peek().value)) {
      const op = this.consume().value;
      const right = this.parseTerm();
      left = { type: 'binary', operator: op, left, right };
    }
    return left;
  }

  parseTerm() {
    let left = this.parseFactor();
    while (this.peek() && ['*', '/'].includes(this.peek().value)) {
      const op = this.consume().value;
      const right = this.parseFactor();
      left = { type: 'binary', operator: op, left, right };
    }
    return left;
  }

  parseFactor() {
    const token = this.consume();
    if (!token) throw new Error('Unexpected end of input');
    if (token.type === TokenTypes.NUMBER) {
      return { type: 'number', value: token.value };
    }
    if (token.type === TokenTypes.VARIABLE) {
      return { type: 'variable', name: token.value };
    }
    if (token.type === TokenTypes.LINEREF) {
      return { type: 'lineref', line: token.value };
    }
    if (token.type === TokenTypes.LPAREN) {
      const expr = this.parseExpression();
      if (!this.peek() || this.consume().type !== TokenTypes.RPAREN) {
        throw new Error('Expected closing parenthesis');
      }
      return expr;
    }
    throw new Error(`Unexpected token: ${token.value}`);
  }
}

export { TokenTypes, lexer, Parser };
