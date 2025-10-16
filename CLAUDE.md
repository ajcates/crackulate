# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Crackulator** is a mobile-first Progressive Web App (PWA) that functions as a calculator with a spreadsheet-like interface. Users can write mathematical expressions in a text editor, and results are calculated and displayed in real-time alongside each line. The app supports variable assignments, line references, file operations, and URL-based sharing with compression.

## Development Commands

```bash
# Start development server with live-server (opens browser)
npm run dev

# Start development server without opening browser
npm run test

# Deploy to Surge (happens automatically on git push via git-scripts)
surge --project ./ --domain crackulator.surge.sh

# The project uses live-server for development - it serves files and auto-reloads on changes
# There are no build steps, linting, or test commands configured
```

## Architecture Overview

The codebase has been refactored to use modern ES2022+ patterns with dependency injection, event-driven architecture, and clear separation of concerns.

### Core Architecture Patterns

**Dependency Injection Container (`js/core/Container.js`)**
- Manages service registration and resolution
- Supports singleton and transient lifetimes
- Detects circular dependencies
- All services are registered in `Application.js` during initialization

**Event Bus (`js/core/EventBus.js`)**
- Global singleton for decoupled component communication
- Async event emission with Promise.allSettled
- Subscribe/emit pattern for loose coupling
- Key events: `app:initialized`, `state:changed`, `editor:undo`, `file:save/open/new`

**Centralized State Management (`js/core/AppState.js`)**
- Single source of truth for application state
- Reactive updates via EventBus `state:changed` events
- Dot-notation key paths (e.g., `editor.content`, `ui.hasUnsavedChanges`)
- Built-in validation and middleware support
- State structure: `editor`, `variables`, `currentFile`, `results`, `history`, `ui`

### Application Bootstrap (`main.js` → `js/Application.js`)

**main.js**
- Entry point that imports and starts `Application` class
- Includes fallback to legacy initialization if modern architecture fails
- Initializes `EnhancedConsole` for debugging
- Makes app instance available globally as `window.__crackulator`

**Application.js initialization sequence:**
1. Register services with DI container (storage, calculation, file, notification, sharing, etc.)
2. Load initial state (checks for URL-shared content first, then auto-saved content)
3. Initialize views (EditorView, FileModalView)
4. Initialize controllers (EditorController, FileController)
5. Setup global event handlers (keyboard shortcuts, auto-save, share button)
6. Register service worker for PWA

### MVC Architecture

**Controllers** (`js/controllers/`)
- **EditorController**: Coordinates editor view, calculation service, and app state
  - Handles input with 300ms debouncing
  - Manages undo/redo history stack
  - Triggers calculations on content changes
  - Updates variable toolbar based on calculated variables
- **FileController**: Manages file operations (new, open, save, delete)
  - Integrates with FileService for localStorage operations
  - Uses ConfirmationService for unsaved changes prompts
  - Shows notifications via NotificationService

**Views** (`js/views/`)
- **EditorView**: Pure DOM manipulation for editor UI
  - Syncs scrolling between editor, results, and line numbers
  - Handles mobile keyboard detection and layout adjustments
  - Provides event registration (onInput, onScroll, onKeyDown)
  - Updates results display, line numbers, and variable toolbar
  - No business logic - only UI concerns
- **FileModalView**: Manages file selection modal UI

**Services** (`js/services/`)
- **CalculationService**: Processes mathematical expressions
  - Line-by-line parsing and evaluation using legacy lexer/parser/evaluator
  - Maintains variable scope across lines
  - Handles line references (e.g., `#2`)
  - Returns structured results with error handling
- **FileService**: localStorage-based file system
  - Prefix: `calcedit_file_` for saved files
  - CRUD operations: list, load, save, delete files
- **SharingService**: URL-based calculation sharing
  - Compresses content using `CompressionService` (pako gzip)
  - Creates shareable URLs with base64-encoded data in URL hash
  - Format: `#{v:1, d:compressed_data, n:filename, t:timestamp}`
  - Validates content size before sharing (max 10000 chars, max 2000 char URL)
  - Auto-loads shared content on app initialization
- **NotificationService**: Toast-style notifications
- **ConfirmationService**: Confirmation dialogs

### Language Processing Pipeline

**Unchanged from legacy code:**
1. **Lexer** (`js/lexerParser.js`) - Tokenizes input strings into structured tokens
2. **Parser** (`js/lexerParser.js`) - Builds Abstract Syntax Trees (AST) using recursive descent parsing
3. **Evaluator** (`js/evaluator.js`) - Processes AST nodes to compute numerical results

### Data Flow

1. User types in editor → EditorView captures input event
2. EditorController handles input → updates AppState (debounced 300ms)
3. State change triggers CalculationService.processLines()
4. Each line: lexer → parser → evaluator (using legacy modules)
5. Variable assignments stored in AppState.variables
6. Results emitted via `state:changed` event
7. EditorController updates view with new results
8. Auto-save to localStorage after 300ms via state subscription
9. Variable toolbar updated with clickable variable buttons

### Language Features

- **Variable assignments**: `foo = 1+1` (stored in state, persistent across lines)
- **Line references**: `#2` refers to result of line 2
- **Basic arithmetic**: `+`, `-`, `*`, `/` with proper precedence
- **Parentheses**: For grouping expressions
- **Error handling**: Shows 'e' for syntax/runtime errors, '0' for NaN results

### PWA and Sharing Features

- **Service Worker** (`sw.js`): Caches app and Google Fonts for offline use
- **Web App Manifest** (`manifest.json`): Enables "Add to Home Screen"
- **URL Sharing**: Compress and encode calculations in URL hash for sharing
  - Share button creates URL and copies to clipboard
  - Shows compression stats (e.g., "65% compression")
  - Auto-loads shared calculations on page load
  - Clears URL hash after loading for cleaner URLs

## Key Files and Responsibilities

### Modern Architecture Files
- `js/Application.js` - Main application orchestrator, DI setup
- `js/core/Container.js` - Dependency injection container
- `js/core/EventBus.js` - Global event bus for component communication
- `js/core/AppState.js` - Centralized state management with validation
- `js/controllers/EditorController.js` - Editor coordination and calculation triggering
- `js/controllers/FileController.js` - File operation coordination
- `js/views/EditorView.js` - Pure editor DOM manipulation
- `js/views/FileModalView.js` - File modal DOM manipulation
- `js/services/CalculationService.js` - Calculation processing wrapper
- `js/services/FileService.js` - localStorage file operations
- `js/services/SharingService.js` - URL-based sharing with compression
- `js/services/NotificationService.js` - Toast notifications
- `js/services/ConfirmationService.js` - Confirmation dialogs
- `js/utils/compression.js` - Gzip compression using pako
- `js/utils/EnhancedConsole.js` - Enhanced logging for debugging

### Legacy Files (still in use)
- `js/lexerParser.js` - Tokenizer and parser (used by CalculationService)
- `js/evaluator.js` - Expression evaluator (used by CalculationService)
- `js/domUtils.js` - Legacy DOM utilities (fallback mode only)
- `js/fileManager.js` - Legacy file management (fallback mode only)
- `js/storageUtils.js` - Simple localStorage wrapper

### Storage Keys

- `calcedit_content` - Auto-saved editor content
- `calcedit_file_{filename}` - Saved calculation files
- State is NOT persisted - only content and named files

## Development Notes

- **No build process**: Files served directly, ES6 modules loaded natively
- **Fallback mode**: If modern architecture fails, falls back to legacy `domUtils.js` / `fileManager.js`
- **Error handling**: Shows 'e' in results column for syntax/runtime errors
- **Line indexing**: 1-indexed for display, 0-indexed internally
- **Variables**: Case-sensitive, alphanumeric names
- **Division by zero**: Returns NaN, displayed as '0'
- **Private fields**: ES2022 `#private` fields used throughout for encapsulation
- **Async/await**: Used consistently for async operations
- **Keyboard shortcuts**: Ctrl/Cmd+S (save), Ctrl/Cmd+O (open), Ctrl/Cmd+N (new)
- **Mobile support**: Detects mobile keyboards and adjusts layout via CSS class

## Adding New Features

When adding features to Crackulator:

1. **Create a service** in `js/services/` for new business logic
2. **Register it** in `Application.js` DI container
3. **Use EventBus** for cross-component communication instead of direct calls
4. **Update AppState** schema if new state properties are needed
5. **Create a controller** if coordinating multiple services/views
6. **Keep views pure** - no business logic in View classes
7. **Subscribe to events** rather than calling methods directly across components

## Project Tone and Style

- keep a hella ghetto crack dealin tone through da projects for real.