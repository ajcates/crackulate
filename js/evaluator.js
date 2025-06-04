// **Evaluator Function**
function evaluate(ast, scope, lineResults, currentLine) {
  if (!ast) return null;
  if (ast.type === 'number') return ast.value;
  if (ast.type === 'variable') {
    if (!(ast.name in scope)) throw new Error(`Undefined variable: ${ast.name}`);
    return scope[ast.name];
  }
  if (ast.type === 'lineref') {
    const lineIndex = ast.line - 1; // Convert to 0-based index
    if (lineIndex >= currentLine || lineIndex < 0 || lineResults[lineIndex] === undefined) {
      throw new Error(`Invalid line reference: #${ast.line}`);
    }
    const refValue = lineResults[lineIndex];
    if (refValue === 'e') throw new Error(`Cannot reference an error: #${ast.line}`);
    return parseFloat(refValue);
  }
  if (ast.type === 'binary') {
    const left = evaluate(ast.left, scope, lineResults, currentLine);
    const right = evaluate(ast.right, scope, lineResults, currentLine);
    switch (ast.operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return right === 0 ? NaN : left / right;
      default: throw new Error(`Unknown operator: ${ast.operator}`);
    }
  }
  if (ast.type === 'assignment') {
    const value = evaluate(ast.expression, scope, lineResults, currentLine);
    //shouldnt the scope also be retuened so the next line we eval can use
    scope[ast.variable] = value;
    return value;
  }
  throw new Error('Unknown AST node type');
}

export { evaluate };
