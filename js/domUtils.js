// File Overview: js/domUtils.js
// This file is responsible for managing the direct interactions with the Document Object Model (DOM)
// of the web page. It handles tasks such as:
// - Selecting and caching DOM elements (editor, results display, variable toolbar).
// - Updating the results display based on the editor's content.
// - Implementing features like debouncing for input, undo functionality, and clearing the page.
// - Initializing the editor UI, including loading saved content and setting up event listeners.
// - Dynamically updating a toolbar with buttons for currently defined variables.
// It imports lexer/parser and evaluator functions to process the input and calculate results.
// It also manages some application state that is closely tied to the UI, like the undo stack,
// the global variable scope (though primarily modified by the evaluator), and the current file name.

import { lexer, Parser } from './lexerParser.js';
import { evaluate } from './evaluator.js';

// **DOM Elements and State**
// These are references to key HTML elements that the script will interact with.
const editor = document.querySelector('.editor'); // The main textarea where users type expressions.
const resultsDiv = document.querySelector('.results'); // The div where calculation results are displayed.
const variableToolbar = document.getElementById('variable-toolbar'); // Toolbar for variable buttons.

// Application state variables
let globalScope = {}; // Stores variables and their values defined by the user. Persists across evaluations.
let undoStack = []; // An array to store previous states of the editor content for undo functionality.
let currentFileName = null; // Stores the name of the currently open file, if any. Used for save operations.

// **Update Results Function**
// This function is core to the application's reactivity. It is called whenever the editor content
// changes (or needs re-evaluation, like after loading a file).
// It splits the editor content into lines, then processes each line:
// 1. Trims whitespace. Empty lines result in a '-' in the results.
// 2. Lexes the line into tokens.
// 3. Parses the tokens into an Abstract Syntax Tree (AST).
// 4. Evaluates the AST to get a numerical result or handle assignments.
//    - A temporary scope (`tempScope`) is used for each run, initialized from `globalScope`.
//      This allows assignments in one line to be available to subsequent lines within the same evaluation run.
// 5. Pushes the result (or 'e' for error, '0' for empty/NaN) to a results array.
// After processing all lines, it updates the `globalScope` with the final state of `tempScope`
// (to persist variable assignments) and then renders the results into the `resultsDiv`.
// It also triggers an update of the variable toolbar.
function updateResults() {
  const lines = editor.value.split('\n'); // Get all lines from the editor.
  const results = []; // Array to hold results for each line.
  // Create a temporary scope for this evaluation run. It starts as a copy of the globalScope
  // and is updated by assignment operations within the current set of lines.
  let tempScope = { ...globalScope }; // Shallow copy is sufficient as values are numbers.

  lines.forEach((line, index) => {
    const trimmedLine = line.trim(); // Remove leading/trailing whitespace.
    if (!trimmedLine) {
      results.push('-'); // Display '-' for empty lines.
      return;
    }
    try {
      const tokens = lexer(trimmedLine); // Convert the line string into a list of tokens.
      if (tokens.length === 0) { // Handle cases where lexer might return empty (e.g. only whitespace)
        results.push('0'); // Or perhaps '-' if preferred for consistency with blank lines
        return;
      }
      const parser = new Parser(tokens); // Create a new parser instance with the tokens.
      const ast = parser.parse(); // Generate an Abstract Syntax Tree from the tokens.

      // Check if the parser consumed all tokens. If not, it's a syntax error.
      if (parser.hasNext()) {
        throw new Error('Extra tokens after expression');
      }
      // Evaluate the AST. Pass the tempScope, results array (for line references), and current line index.
      const result = evaluate(ast, tempScope, results, index);
      // Store the result. If null or NaN (e.g. from division by zero), display '0'.
      results.push(result === null || isNaN(result) ? '0' : result.toString());
    } catch (e) {
      console.error(e); // Log the actual error to the console for debugging purposes.
      results.push('e'); // Display 'e' for lines that cause an error.
    }
  });

  // After processing all lines, update the globalScope with any new or modified variables from this run.
  globalScope = { ...tempScope };
  // Update the results display in the DOM. Each result gets its own div.
  resultsDiv.innerHTML = results.map(result => `<div>${result}</div>`).join('');
  updateVariableToolbar(); // Refresh the variable toolbar to reflect any changes in globalScope.
}

// **Debounce Function**
// A higher-order function that limits the rate at which another function (fn) can be called.
// This is used to prevent `updateResults` from being called excessively while the user is typing,
// which would be computationally expensive and could lead to a sluggish UI.
// `fn` will only be executed after `delay` milliseconds have passed without any new calls to the debounced function.
function debounce(fn, delay) {
  let timeout; // Holds the timeout ID.
  return () => {
    clearTimeout(timeout); // Clear any existing timeout.
    // Set a new timeout to execute fn after the specified delay.
    timeout = setTimeout(fn, delay);
  };
}

// Create a debounced version of updateResults.
// This version will also save the current editor content to localStorage for persistence.
const debouncedUpdate = debounce(() => {
  updateResults(); // Perform the actual update.
  // Autosave the editor content to localStorage so it can be restored if the page is reloaded.
  localStorage.setItem('calcedit_content', editor.value);
}, 300); // 300ms delay is a common choice for debouncing input.

// **Clear Page Function**
// Resets the editor and application state to a clean slate.
// This is typically called when the "New" button is clicked.
function clearPage() {
  editor.value = ''; // Clear the editor textarea.
  resultsDiv.innerHTML = ''; // Clear the results display.
  undoStack = ['']; // Reset the undo stack with a single empty state.
  globalScope = {}; // Clear all user-defined variables.
  updateResults(); // Update the display (should show '-' for results due to empty lines).
  localStorage.removeItem('calcedit_content'); // Remove any autosaved content from localStorage.
  currentFileName = null; // Reset the current file name as there's no file loaded.
  updateVariableToolbar(); // Clear the variable toolbar.
}

// **Initialize Editor UI Function**
// Encapsulates the setup of the editor and related UI elements when the page loads.
// It does not handle file operation event listeners, which are in fileManager.js.
function initializeEditorUI() {
  // **Initialize Editor Content**
  // Attempt to load content that was previously autosaved to localStorage.
  const savedContent = localStorage.getItem('calcedit_content');
  // If saved content exists, use it; otherwise, use a default example string.
  editor.value = savedContent || 'foo = 1+1\nfoo l\nbar = 1\nfoobar = bar + #2'; // Note: 'foo l' might be a typo, 'foo' or 'foo+0' works.
  // Initialize the undo stack with the initial content (either saved or default).
  undoStack = [editor.value];
  updateResults(); // Perform an initial calculation and display of results.
  updateVariableToolbar(); // Populate the variable toolbar based on the initial state.

  // **Editor Input Event Listener**
  // This listener fires every time the user types in the editor.
  editor.addEventListener('input', () => {
    undoStack.push(editor.value); // Save the current editor state to the undo stack.
    debouncedUpdate(); // Trigger the debounced update function to re-calculate and display results.
  });

  // **Undo Button Event Listener**
  // Handles clicks on the "Undo" button.
  const undoButton = document.getElementById('undo');
  undoButton.addEventListener('click', () => {
    // Only proceed if there's more than one state in the undo stack (i.e., something to undo).
    if (undoStack.length > 1) {
      undoStack.pop(); // Remove the current state from the stack.
      editor.value = undoStack[undoStack.length - 1]; // Set the editor to the previous state.
      updateResults(); // Re-calculate and display results for the restored state.
      // Note: Autosave on undo might be desirable, could call debouncedUpdate or save directly.
    }
  });
}

// **Update Variable Toolbar Function**
// This function dynamically creates and updates buttons in the variable toolbar.
// Each button corresponds to a variable currently defined in `globalScope`.
// Clicking a variable button inserts the variable's name into the editor at the current cursor position.
function updateVariableToolbar() {
  variableToolbar.innerHTML = ''; // Clear any existing buttons from the toolbar.
  // Get all variable names from globalScope, sort them alphabetically, and create a button for each.
  Object.keys(globalScope).sort().forEach(varName => {
    const button = document.createElement('button');
    button.textContent = varName; // Set the button text to the variable name.
    // Add a click event listener to each button.
    button.addEventListener('click', () => {
      const cursorPos = editor.selectionStart; // Get current cursor position.
      const textBefore = editor.value.substring(0, cursorPos); // Text before cursor.
      const textAfter = editor.value.substring(editor.selectionEnd); // Text after selection (or cursor if no selection).
      // Insert the variable name at the cursor position.
      editor.value = textBefore + varName + textAfter;
      // Move the cursor to the end of the inserted variable name.
      editor.selectionStart = editor.selectionEnd = cursorPos + varName.length;
      editor.focus(); // Return focus to the editor.
      // Trigger an input event programmatically. This is important to ensure that
      // `updateResults` (via `debouncedUpdate`) is called, and the UI reflects the change.
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      editor.dispatchEvent(inputEvent);
    });
    variableToolbar.appendChild(button); // Add the new button to the toolbar.
  });
}

// Export necessary functions and variables for use in other modules (e.g., main.js, fileManager.js).
// `currentFileName` and `globalScope` are exported directly but their modification logic
// is primarily within this file or via functions like `clearPage` and `updateResults`.
// `undoStack` is also exported for `fileManager.js` to reset when loading a file.
export { editor, resultsDiv, clearPage, updateResults, debouncedUpdate, initializeEditorUI, globalScope, currentFileName, undoStack, updateVariableToolbar };
