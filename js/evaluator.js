// **Evaluator Function**
function evaluate(ast, scope, lineResults, currentLine) {
  if (!ast) return { result: null, scope };
  if (ast.type === 'number') return { result: ast.value, scope };
  if (ast.type === 'variable') {
    if (!(ast.name in scope)) throw new Error(`Undefined variable: ${ast.name}`);
    return { result: scope[ast.name], scope };
  }
  if (ast.type === 'lineref') {
    const lineIndex = ast.line - 1; // Convert to 0-based index
    if (lineIndex >= currentLine || lineIndex < 0 || lineResults[lineIndex] === undefined) {
      throw new Error(`Invalid line reference: #${ast.line}`);
    }
    const refValue = lineResults[lineIndex];
    if (refValue === 'e') throw new Error(`Cannot reference an error: #${ast.line}`);
    return { result: parseFloat(refValue), scope };
  }
  if (ast.type === 'binary') {
    const leftEval = evaluate(ast.left, scope, lineResults, currentLine);
    scope = leftEval.scope; // Update scope from left evaluation
    const rightEval = evaluate(ast.right, scope, lineResults, currentLine);
    scope = rightEval.scope; // Update scope from right evaluation

    const left = leftEval.result;
    const right = rightEval.result;

    switch (ast.operator) {
      case '+': return { result: left + right, scope };
      case '-': return { result: left - right, scope };
      case '*': return { result: left * right, scope };
      case '/': return { result: right === 0 ? NaN : left / right, scope };
      default: throw new Error(`Unknown operator: ${ast.operator}`);
    }
  }
  if (ast.type === 'assignment') {
    const evalExpression = evaluate(ast.expression, scope, lineResults, currentLine);
    const value = evalExpression.result;
    const newScope = { ...evalExpression.scope }; // Use the scope returned from expression evaluation
    newScope[ast.variable] = value;
    return { result: value, scope: newScope };
  }
  throw new Error('Unknown AST node type');
}

export { evaluate };
