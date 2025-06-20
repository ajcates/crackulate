import { lexer, Parser } from '../lexerParser.js';
import { evaluate } from '../evaluator.js';

function runTest(input, expectedOutput, description) {
  console.log(`Running test: ${description}`);
  try {
    const tokens = lexer(input);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    let scope = {};
    // If the input is a series of assignments/expressions, we might need to evaluate them sequentially
    // For simplicity, this test runner assumes single lines or that prior lines set up scope appropriately.
    // A more robust runner would handle multi-line inputs and evolving scope.

    // If the main operation is an assignment, the result of evaluate is the assigned value.
    // If it's an expression, it's the expression's value.
    // For these tests, we are interested in the final state of the scope or the result of the final expression.

    let lastValue = null;
    if (Array.isArray(ast)) { // Handle potential multi-statement parsing if parser returns an array
        for (const statement of ast) {
            lastValue = evaluate(statement, scope, [], 0);
        }
    } else if (ast) {
        lastValue = evaluate(ast, scope, [], 0);
    }


    // Check against expectedOutput
    // This is a simplified check. Depending on the test, we might check scope or lastValue.
    let actualOutput = lastValue;
    if (typeof expectedOutput === 'object' && expectedOutput !== null && expectedOutput.check === 'scope') {
        actualOutput = scope[expectedOutput.variable.toLowerCase()];
         if (actualOutput === expectedOutput.value) {
            console.log(`  PASS: ${description}`);
        } else {
            console.error(`  FAIL: ${description}. Expected scope[${expectedOutput.variable.toLowerCase()}] = ${expectedOutput.value}, got ${actualOutput}. Scope:`, scope);
        }
    } else {
        if (actualOutput === expectedOutput) {
            console.log(`  PASS: ${description}`);
        } else {
            console.error(`  FAIL: ${description}. Expected ${expectedOutput}, got ${actualOutput}. Scope:`, scope);
        }
    }

  } catch (e) {
    console.error(`  FAIL: ${description}. Error: ${e.message}`);
    // If the expected output was an error, this might be a pass condition
    if (typeof expectedOutput === 'object' && expectedOutput !== null && expectedOutput.check === 'error') {
        if (e.message.includes(expectedOutput.messageContains)) {
            console.log(`  PASS (expected error): ${description}`);
        } else {
            console.error(`  FAIL (unexpected error message): ${description}. Expected error containing '${expectedOutput.messageContains}', got '${e.message}'`);
        }
    }
  }
}

// Test Suite for Case Insensitivity

// Test 1: Define with one case, access with another
runTest('myVar = 10', { check: 'scope', variable: 'myVar', value: 10 }, 'Define myVar = 10');
runTest('myvar', 10, 'Access myvar (lowercase)');
runTest('MyVar', 10, 'Access MyVar (mixed case)');
runTest('MYVAR', 10, 'Access MYVAR (uppercase)');

// Test 2: Define with mixed case, access with various cases
runTest('MixedCaseVar = 20', { check: 'scope', variable: 'MixedCaseVar', value: 20 }, 'Define MixedCaseVar = 20');
runTest('mixedcasevar', 20, 'Access mixedcasevar (lowercase)');
runTest('MIXEDCASEVAR', 20, 'Access MIXEDCASEVAR (uppercase)');

// Test 3: Reassign with different case
runTest('testVar = 30', { check: 'scope', variable: 'testVar', value: 30 }, 'Define testVar = 30');
runTest('TESTVAR = 35', { check: 'scope', variable: 'testVar', value: 35 }, 'Reassign TESTVAR = 35 (uppercase)');
runTest('testvar', 35, 'Access testvar (lowercase) after reassignment');

// Test 4: Scope check after multiple assignments with different casings
let currentScope = {};
let lastResult;
const operations = [
    { input: 'VarOne = 100', expectedScope: { varone: 100 }},
    { input: 'varone + 5', expectedResult: 105 },
    { input: 'VARONE = 110', expectedScope: { varone: 110 }},
    { input: 'VarOne', expectedResult: 110 },
    { input: 'vArTwO = 200', expectedScope: { varone: 110, vartwo: 200 }},
    { input: 'vartwo - varone', expectedResult: 90 }
];

console.log('Running test: Sequential operations with evolving scope');
try {
    operations.forEach(op => {
        const tokens = lexer(op.input);
        const parser = new Parser(tokens);
        const ast = parser.parse();
        lastResult = evaluate(ast, currentScope, [], 0);

        if (op.expectedScope) {
            let allMatch = true;
            for (const key in op.expectedScope) {
                if (currentScope[key.toLowerCase()] !== op.expectedScope[key]) {
                    allMatch = false;
                    break;
                }
            }
            if (!allMatch) {
                throw new Error(`Scope mismatch after '${op.input}'. Expected scope (subset): ${JSON.stringify(op.expectedScope)}, Actual scope: ${JSON.stringify(currentScope)}`);
            }
        }
        if (op.expectedResult !== undefined && lastResult !== op.expectedResult) {
            throw new Error(`Result mismatch for '${op.input}'. Expected ${op.expectedResult}, got ${lastResult}`);
        }
    });
    console.log('  PASS: Sequential operations with evolving scope');
} catch (e) {
    console.error(`  FAIL: Sequential operations with evolving scope. Error: ${e.message}. Current scope: ${JSON.stringify(currentScope)}`);
}

// Test Suite for User-Provided Multi-Line Scenario
console.log('Running test: User-provided multi-line scenario');
let userScope = {};
const userOperations = [
  { input: 'foo = 1+1', expectedScopeKeys: ['foo'], expectedLineResult: 2 }, // foo=2
  { input: '5 + Foo', expectedScopeKeys: ['foo'], expectedLineResult: 7 },   // 5+foo = 5+2=7
  { input: 'bar = 1 + Foo', expectedScopeKeys: ['foo', 'bar'], expectedLineResult: 3 }, // bar=1+foo = 1+2=3
  { input: 'bar + 8', expectedScopeKeys: ['foo', 'bar'], expectedLineResult: 11 },  // bar+8 = 3+8=11
  { input: 'foobar = bar + #2', expectedScopeKeys: ['foo', 'bar', 'foobar'], expectedLineResult: 10, lineRefs: [null, 7, null, null, null] } // foobar = bar + line2_res = 3+7=10. Provide results of previous lines for #2 to work.
];
let userLineResults = [];

try {
  userOperations.forEach((op, index) => {
    const tokens = lexer(op.input);
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // For line reference testing, pass the current list of results.
    // The 'evaluate' function expects line numbers to be 1-based in the AST (e.g., #2).
    // The 'results' array passed to evaluate should be 0-indexed containing results of previous lines.
    // So, for 'foobar = bar + #2', when 'index' is 4 (0-indexed), lineResults should contain [2, 7, 3, 11].
    // The ast for '#2' will have line: 2. evaluate will do ast.line - 1 = 1 (0-based index into results).

    const lineResult = evaluate(ast, userScope, op.lineRefs || userLineResults, index);

    if (lineResult !== op.expectedLineResult) {
      throw new Error(`Line ${index + 1} ('${op.input}'): Expected result ${op.expectedLineResult}, got ${lineResult}. Current scope: ${JSON.stringify(userScope)}`);
    }
    userLineResults.push(lineResult);

    // Verify scope keys (simple check, could be more thorough for values)
    if (op.expectedScopeKeys) {
      const currentKeys = Object.keys(userScope).sort();
      const expectedKeys = op.expectedScopeKeys.sort();
      if (JSON.stringify(currentKeys) !== JSON.stringify(expectedKeys)) {
        throw new Error(`Line ${index + 1} ('${op.input}'): Scope keys mismatch. Expected ${JSON.stringify(expectedKeys)}, got ${JSON.stringify(currentKeys)}. Scope: ${JSON.stringify(userScope)}`);
      }
    }
    // Check specific values if provided in a more complex test structure
    // For example, after 'foo = 1+1', userScope.foo should be 2.
    if (op.input.includes('=')) { // Basic check for assignments
        const varName = op.input.split('=')[0].trim().toLowerCase();
        if (userScope[varName] !== lineResult) {
             throw new Error(`Line ${index + 1} ('${op.input}'): Scope value incorrect for ${varName}. Expected ${lineResult}, got ${userScope[varName]}. Scope: ${JSON.stringify(userScope)}`);
        }
    }

  });
  console.log('  PASS: User-provided multi-line scenario');
  // Verify final scope state more precisely if needed
  if (userScope.foo !== 2 || userScope.bar !== 3 || userScope.foobar !== 10) {
    throw new Error(`Final scope values incorrect. Expected foo=2, bar=3, foobar=10. Got: ${JSON.stringify(userScope)}`);
  }
   console.log('  Final scope values PASS: foo=2, bar=3, foobar=10');


} catch (e) {
  console.error(`  FAIL: User-provided multi-line scenario. Error: ${e.message}. Final userLineResults: ${JSON.stringify(userLineResults)}`);
}

console.log("To run these tests, open your browser's developer console and look at the output after this script is loaded, or run it in a Node.js environment if the modules are compatible.");

// Example of how you might run this in an HTML page:
// <script type="module" src="js/tests/evaluator.test.js"></script>
// Then open index.html and check the console.
// For Node.js, you might need to adjust import paths or use a test runner like Jest.
