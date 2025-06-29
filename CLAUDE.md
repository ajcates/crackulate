# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Crackulator** is a mobile-first Progressive Web App (PWA) that functions as a calculator with a spreadsheet-like interface. Users can write mathematical expressions in a text editor, and results are calculated and displayed in real-time alongside each line. The app supports variable assignments, line references, and file operations.

## Development Commands

```bash
# Start development server with live-server (opens browser)
npm run dev

# Start development server without opening browser)
npm run test

# The project uses live-server for development - it serves files and auto-reloads on changes
# There are no build steps, linting, or test commands configured
```

## Architecture Overview

### Core Components

**Main Entry Point (`main.js`)**
- Initializes the application by importing and calling setup functions
- Registers service worker for PWA functionality
- Coordinates between UI and file management systems

**DOM Management (`js/domUtils.js`)**
- Manages all DOM interactions and UI state
- Handles real-time calculation updates with debouncing (300ms)
- Implements undo functionality with stack-based history
- Manages variable toolbar with clickable variable buttons
- Controls line numbers display synchronized with editor scrolling
- Exports: `editor`, `resultsDiv`, `clearPage`, `updateResults`, `globalScope`, `currentFileName`, `undoStack`

**Language Processing Pipeline**
1. **Lexer (`js/lexerParser.js`)** - Tokenizes input strings into structured tokens
2. **Parser (`js/lexerParser.js`)** - Builds Abstract Syntax Trees (AST) using recursive descent parsing
3. **Evaluator (`js/evaluator.js`)** - Processes AST nodes to compute numerical results

**File System (`js/fileManager.js`)**
- Uses localStorage as a simple file system with `calcedit_file_` prefix
- Handles Open/Save/New operations with unsaved changes detection
- Manages modal dialogs for file selection
- Integrates with DOM utilities for state management

### Data Flow

1. User types in editor → `input` event triggers debounced update
2. Each line gets lexed → parsed → evaluated individually
3. Variable assignments persist in `globalScope` across lines
4. Results displayed in parallel column alongside editor
5. Auto-save to localStorage (`calcedit_content`) every 300ms

### Language Features

- **Variable assignments**: `foo = 1+1`
- **Line references**: `#2` refers to result of line 2
- **Basic arithmetic**: `+`, `-`, `*`, `/` with proper precedence
- **Parentheses**: For grouping expressions
- **Error handling**: Shows 'e' for syntax/runtime errors, '0' for NaN results

### PWA Features

- **Service Worker (`sw.js`)**: Caches app and Google Fonts for offline use
- **Web App Manifest (`manifest.json`)**: Enables "Add to Home Screen"
- **Responsive Design**: Mobile-first with dark theme using CSS variables

### State Management

- `globalScope`: Persistent variable storage across evaluations
- `undoStack`: Array-based history for undo functionality  
- `currentFileName`: Tracks currently open file for save operations
- Auto-save to localStorage for session persistence

## File Structure Patterns

- All JavaScript modules are in `/js/` directory
- ES6 modules with clear separation of concerns
- Each module exports specific functions/objects for other modules
- HTML uses semantic structure with CSS classes for styling
- PWA assets (icons, manifest) in root directory

## Development Notes

- The app has no build process - files are served directly
- Uses modern JavaScript features (ES6 modules, async/await)
- Error handling shows 'e' in results for any parsing/evaluation errors
- Line numbers are 1-indexed for user display but 0-indexed internally
- Variables are case-sensitive and can contain letters/numbers
- Division by zero returns NaN, displayed as '0'

## Project Tone and Style

- keep a hella ghetto crack dealin tone through da projects for real.