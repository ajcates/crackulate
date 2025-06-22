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

// Main text area where users input their calculations.
const editor = document.querySelector('.editor');
// DIV element used to display the results of calculations for each line.
const resultsDiv = document.querySelector('.results');
// DIV element for displaying line numbers alongside the editor.
const lineNumbersDiv = document.querySelector('.line-numbers');
// DIV element that serves as a toolbar for dynamically created variable buttons.
const variableToolbar = document.getElementById('variable-toolbar');

// **Application State Variables**

// `globalScope`: An object storing variables (and their values) defined by the user's calculations.
// This scope persists across multiple evaluations within the same session until explicitly cleared (e.g., by `clearPage`).
// It is updated by `updateResults` after processing all lines.
let globalScope = {};

// `undoStack`: An array storing snapshots of the editor's content.
// Each time the editor's content changes, the new content is pushed onto this stack.
// Used by the "Undo" functionality to revert to previous states.
// It's reset when a new file is loaded or when `clearPage` is called.
let undoStack = [];

// `currentFileName`: A string storing the name of the file currently loaded into the editor.
// If no file is loaded (e.g., new session, after "New" button), this is `null`.
// This variable is managed by `fileManager.js` when files are opened or saved,
// and reset by `clearPage`. It's crucial for "Save" (overwrite) vs. "Save As" logic.
let currentFileName = null;

// `defaultInitialContent`: A string representing the default content loaded into the editor
// when the application starts without any saved content or when a "New" operation occurs
// and no prior content needs to be loaded from autosave.
// Exported for use in `fileManager.js` to help determine if content is "unsaved".
const defaultInitialContent = 'foo = 1+1\n5\nbar = 1\nfoobar = foo + bar + #2';

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
  updateLineNumbers(); // Update line numbers
  updateVariableToolbar(); // Refresh the variable toolbar to reflect any changes in globalScope.
}

// **Update Line Numbers Function**
// This function updates the line number display next to the editor.
function updateLineNumbers() {
  const lineCount = editor.value.split('\n').length;
  lineNumbersDiv.innerHTML = Array.from({ length: lineCount }, (_, i) => `<div>${i + 1}</div>`).join('');
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
/**
 * Resets the editor and application state to a clean, empty slate.
 * This function is typically invoked when the "New" button is clicked (via `fileManager.js`).
 * It performs the following actions:
 * - Clears the editor's text content.
 * - Clears the results display area.
 * - Resets the `undoStack` to an initial empty state.
 * - Clears the `globalScope` of all user-defined variables.
 * - Calls `updateResults()` to reflect the cleared state in the UI (results should show '-').
 * - Calls `updateLineNumbers()` to reset line numbers.
 * - Removes the 'calcedit_content' item from `localStorage`, effectively clearing any autosaved work.
 * - Resets `currentFileName` to `null`, indicating no file is currently open.
 * - Calls `updateVariableToolbar()` to remove any variable buttons from the toolbar.
 */
function clearPage() {
  editor.value = ''; // Clear the editor textarea.
  resultsDiv.innerHTML = ''; // Clear the results display.
  // Reset the undo stack; an empty string represents the cleared editor state.
  undoStack = [''];
  globalScope = {}; // Clear all user-defined variables.
  updateResults(); // Update UI to reflect the cleared state.
  updateLineNumbers(); // Reset line numbers for the empty editor.
  // Remove the autosaved content. If the user starts typing again,
  // debouncedUpdate will create a new 'calcedit_content'.
  localStorage.removeItem('calcedit_content');
  // Reset the current file name state, as no file is "open" anymore.
  currentFileName = null;
  updateVariableToolbar(); // Clear variable buttons as globalScope is now empty.
}

// **Initialize Editor UI Function**
// Encapsulates the setup of the editor and related UI elements when the page loads.
// It does not handle file operation event listeners, which are in fileManager.js.
function initializeEditorUI() {
  // **Initialize Editor Content**
  // Attempt to load content that was previously autosaved to localStorage.
  const savedContent = localStorage.getItem('calcedit_content');
  // If saved content exists, use it; otherwise, use the default initial content.
  editor.value = savedContent || defaultInitialContent;
  // Initialize the undo stack with the initial content (either saved or default).
  undoStack = [editor.value];
  updateResults(); // Perform an initial calculation and display of results.
  updateLineNumbers(); // Initialize line numbers
  updateVariableToolbar(); // Populate the variable toolbar based on the initial state.

  // **Editor Input Event Listener**
  // This listener fires every time the user types in the editor.
  editor.addEventListener('input', () => {
    undoStack.push(editor.value); // Save the current editor state to the undo stack.
    debouncedUpdate(); // Trigger the debounced update function to re-calculate and display results.
  });

  // **Editor Scroll Event Listener**
  // Synchronizes the scrolling of the line numbers div with the editor textarea.
  editor.addEventListener('scroll', () => {
    lineNumbersDiv.scrollTop = editor.scrollTop;
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
// `defaultInitialContent` is exported for `fileManager.js` to use in unsaved changes checks.
export { editor, resultsDiv, clearPage, updateResults, debouncedUpdate, initializeEditorUI, globalScope, currentFileName, undoStack, updateVariableToolbar, defaultInitialContent };
