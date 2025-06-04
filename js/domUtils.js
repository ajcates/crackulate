import { lexer, Parser } from './lexerParser.js';
import { evaluate } from './evaluator.js';

// **DOM Elements and State**
const editor = document.querySelector('.editor'); // Textarea for input
const resultsDiv = document.querySelector('.results'); // Div to display results
const variableToolbar = document.getElementById('variable-toolbar');
let globalScope = {}; // Global scope to persist variable values, renamed from scope
let undoStack = []; // Stack to store editor states for undo
let currentFileName = null; // Variable to store the current file name for "Save" vs "Save As"

// **Update Results Function**
// Processes each line of the editor and updates the results display
function updateResults() {
  const lines = editor.value.split('\n');
  const results = [];
  // Create a temporary scope for this evaluation run, starting with globalScope
  // This tempScope will be modified by assignments within the lines
  let tempScope = { ...globalScope };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      results.push('-');
      return;
    }
    try {
      const tokens = lexer(trimmedLine);
      if (tokens.length === 0) {
        results.push('0');
        return;
      }
      const parser = new Parser(tokens);
      const ast = parser.parse();
      if (parser.hasNext()) {
        throw new Error('Extra tokens after expression');
      }
      const result = evaluate(ast, tempScope, results, index); // Pass tempScope
      results.push(result === null || isNaN(result) ? '0' : result.toString());
    } catch (e) {
      console.error(e); // Log error to console for debugging
      results.push('e');
    }
  });

  globalScope = { ...tempScope }; // Update globalScope with the final state of tempScope
  resultsDiv.innerHTML = results.map(result => `<div>${result}</div>`).join('');
  updateVariableToolbar();
}

// **Debounce Function**
// Limits the frequency of updateResults calls during typing
function debounce(fn, delay) {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
}

const debouncedUpdate = debounce(() => {
  updateResults();
  localStorage.setItem('calcedit_content', editor.value); // Save content to localStorage
}, 300); // 300ms delay


function clearPage() {
  editor.value = '';
  resultsDiv.innerHTML = ''; // Clear results
  undoStack = ['']; // Reset undo stack with an empty state
  globalScope = {}; // Reset global scope
  updateResults(); // Update display (should show '-' for results)
  localStorage.removeItem('calcedit_content'); // Clear autosaved content
  currentFileName = null; // Reset current file name
  updateVariableToolbar();
}

// Encapsulates editor initialization and non-file-operation event listeners
function initializeEditorUI() {
  // **Initialize Editor**
  // Load saved content or use default example
  const savedContent = localStorage.getItem('calcedit_content');
  editor.value = savedContent || 'foo = 1+1\nfoo l\nbar = 1\nfoobar = bar + #2';
  undoStack = [editor.value]; // Initialize undo stack with initial content
  updateResults(); // Initial render
  updateVariableToolbar();

  // **Editor Input Event**
  // Updates undo stack and triggers debounced update on input
  editor.addEventListener('input', () => {
    undoStack.push(editor.value); // Save current state
    debouncedUpdate();
  });

  // **Undo Button Event**
  // Reverts to the previous state if available
  const undoButton = document.getElementById('undo');
  undoButton.addEventListener('click', () => {
    if (undoStack.length > 1) {
      undoStack.pop(); // Remove current state
      editor.value = undoStack[undoStack.length - 1]; // Set previous state
      updateResults();
    }
  });
}

// **Update Variable Toolbar Function**
// Clears and repopulates the variable toolbar with buttons for each variable in globalScope
function updateVariableToolbar() {
  variableToolbar.innerHTML = ''; // Clear existing buttons
  Object.keys(globalScope).sort().forEach(varName => {
    const button = document.createElement('button');
    button.textContent = varName;
    button.addEventListener('click', () => {
      const cursorPos = editor.selectionStart;
      const textBefore = editor.value.substring(0, cursorPos);
      const textAfter = editor.value.substring(editor.selectionEnd);
      editor.value = textBefore + varName + textAfter;
      editor.selectionStart = editor.selectionEnd = cursorPos + varName.length;
      editor.focus();
      // Trigger an input event to update results and potentially the toolbar again
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      editor.dispatchEvent(inputEvent);
    });
    variableToolbar.appendChild(button);
  });
}

// Export necessary functions and variables
// currentFileName and globalScope will be managed via functions if needed by other modules later
export { editor, resultsDiv, clearPage, updateResults, debouncedUpdate, initializeEditorUI, globalScope, currentFileName, undoStack, updateVariableToolbar };
