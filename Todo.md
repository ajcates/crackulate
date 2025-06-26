# Todo List - Crackulator

## 🚨 Critical Bug Fixes (Priority 1)

### Code Quality & Stability
- [x] **✅ COMPLETED: Add precise decimal arithmetic** - Replaced IEEE 754 with Decimal.js library
- [ ] **Fix default content typo** in `js/domUtils.js:138` - Change `'foo l'` to `'foo'` or `'foo = 1'`
- [ ] **Fix package.json main entry** - Change from `index.js` to `main.js` or `index.html`
- [ ] **Add localStorage error handling** - Wrap all localStorage operations in try-catch blocks
- [ ] **Fix service worker error handling** - Add proper error handling for cache operations
- [ ] **Implement undo stack size limit** - Prevent memory leaks by limiting to 50-100 entries
- [ ] **Validate file names** - Sanitize user input for file names to prevent localStorage conflicts
- [ ] **Fix mobile keyboard handling** - Variable toolbar positioning when keyboard appears (currently disabled)

### Security & Input Validation
- [ ] **Add input sanitization** for DOM insertion in results display
- [ ] **Implement localStorage quota management** - Handle storage full scenarios
- [ ] **Validate line references** - Improve bounds checking and error messages

## 🔧 Performance & Code Quality (Priority 2)

### Performance Optimizations
- [ ] **Optimize DOM updates** - Only update changed line numbers instead of rebuilding all
- [ ] **Debounce line number updates** - Use same debouncing as main results
- [ ] **Clean up CSS duplicates** - Remove duplicate CSS variable definitions
- [ ] **Minimize CSS complexity** - Simplify scrollbar styling and remove unused properties

### Code Consistency
- [ ] **Standardize naming convention** - Decide between `calcedit` vs `crackulator` and apply consistently
- [ ] **Unify error message format** - Create consistent error message style across modules
- [ ] **Standardize comment style** - Use consistent JSDoc-style comments
- [ ] **Add proper TypeScript JSDoc** - Improve code documentation for better IDE support

## ♿ Accessibility & UX (Priority 2)

### Accessibility Improvements
- [ ] **Add ARIA labels** to all interactive elements
- [ ] **Implement proper keyboard navigation** for file list and modals
- [ ] **Add focus management** - Restore focus when modals close
- [ ] **Label the editor textarea** - Add proper form labels for screen readers
- [ ] **Add keyboard shortcuts** - Implement common shortcuts (Ctrl+S, Ctrl+O, Ctrl+N)

### User Experience
- [ ] **Add loading states** - Show feedback during file operations
- [ ] **Improve error display** - Show user-friendly error messages instead of just 'e'
- [ ] **Add tooltips** - Explain features and buttons
- [ ] **Implement auto-resize** - Make editor auto-resize based on content

## 🧪 Testing Infrastructure (Priority 3)

### Test Setup
- [ ] **Choose testing framework** - Recommend Vitest for simplicity and speed
- [ ] **Set up test configuration** - Add basic test setup without complex build process
- [ ] **Create test utilities** - Helper functions for testing calculator operations

### Unit Tests
- [ ] **Test lexer functionality** - Cover all token types and edge cases
- [ ] **Test parser logic** - Test AST generation for various expressions
- [ ] **Test evaluator** - Cover all operations, variable assignments, line references
- [ ] **Test file operations** - Mock localStorage for file management tests
- [ ] **Test error handling** - Ensure all error paths are covered

### Integration Tests
- [ ] **Test full calculation pipeline** - From input to result display
- [ ] **Test PWA functionality** - Service worker and offline capabilities
- [ ] **Test user workflows** - Common user interactions end-to-end

## 🔢 Calculator Enhancements (Priority 4)

### Mathematical Functions
- [ ] **Add basic math functions** - `sin`, `cos`, `tan`, `sqrt`, `abs`, `floor`, `ceil`
- [ ] **Add logarithmic functions** - `log`, `ln`, `log10`
- [ ] **Add power functions** - `pow`, `exp`, support for `^` operator
- [ ] **Add rounding functions** - `round`, `trunc`, with precision support
- [ ] **Add constants** - `pi`, `e`, `phi` (golden ratio)
- [ ] **Add arrow function syntax** - Support for `(x) => x * 2` function definitions

### Number Format Support
- [ ] **Add scientific notation** - Support for `1e10`, `2.5e-3` format
- [ ] **Add percentage calculations** - Support for `%` operator
- [ ] **Add binary/hex support** - `0b1010`, `0xFF` input formats
- [ ] **Add number base conversion functions** - `bin()`, `hex()`, `oct()`

### Advanced Features
- [ ] **Add unit conversion system** - Length, weight, temperature, etc.
- [ ] **Add statistical functions** - `sum`, `avg`, `min`, `max` for ranges
- [ ] **Add financial functions** - `compound`, `present_value`, etc.
- [ ] **Add date/time calculations** - Basic date arithmetic

## 🎨 UI/UX Improvements (Priority 4)

### Interface Enhancements
- [ ] **Add theme selector** - Light/dark/auto theme switching
- [ ] **Improve mobile responsiveness** - Better touch interactions
- [ ] **Add syntax highlighting** - Highlight variables, operators, functions
- [ ] **Add line highlighting** - Show which line is being calculated
- [ ] **Improve variable toolbar** - Categorize variables, show values on hover

### File Management
- [ ] **Add file search/filter** - Search through saved files
- [ ] **Add file organization** - Folders or tags for file organization
- [ ] **Add file metadata** - Show last modified, creation date
- [ ] **Add file preview** - Show first few lines in file list
- [ ] **Add bulk operations** - Delete multiple files, export all

### Editor Improvements
- [ ] **Add find/replace** - Search within the current document
- [ ] **Add bracket matching** - Highlight matching parentheses
- [ ] **Add auto-completion** - Suggest variables and functions
- [ ] **Add multi-cursor support** - Edit multiple lines simultaneously

## 🌐 Sharing & Collaboration (Priority 5)

### URL Sharing
- [ ] **Design URL encoding system** - Compress calculation data for URLs
- [ ] **Add share button** - Generate shareable URLs
- [ ] **Add URL import** - Load calculations from shared URLs
- [ ] **Add QR code generation** - Easy mobile sharing

### Export/Import
- [ ] **Add CSV export** - Export results as spreadsheet
- [ ] **Add JSON export/import** - Full calculation state
- [ ] **Add PDF export** - Formatted calculation reports
- [ ] **Add Markdown export** - Documentation-friendly format

### Future Collaboration (Phase 2)
- [ ] **Design collaboration architecture** - Plan for Cloudflare Workers integration
- [ ] **Add real-time sync** - Multiple users editing same calculation
- [ ] **Add comment system** - Annotate lines with comments
- [ ] **Add version history** - Track changes over time

## 📊 Analytics & Monitoring (Priority 6)

### Usage Analytics
- [ ] **Add basic usage tracking** - Which features are used most
- [ ] **Add performance monitoring** - Track calculation speed, errors
- [ ] **Add error reporting** - Collect and analyze user errors
- [ ] **Add user feedback system** - Built-in feedback collection

## 🚀 Advanced Features (Future)

### Power User Features
- [ ] **Add custom function definitions** - User-defined reusable functions
- [ ] **Add macro system** - Record and replay common operations
- [ ] **Add plugin architecture** - Extensible function system
- [ ] **Add scripting capabilities** - Loops, conditions, advanced logic

### Integration Features
- [ ] **Add API endpoints** - Use calculations in other applications
- [ ] **Add webhook support** - Trigger actions based on calculations
- [ ] **Add database connections** - Pull data from external sources
- [ ] **Add chart generation** - Visualize calculation results

---

## 📝 Notes

### Development Guidelines
- Keep the no-build philosophy as long as possible
- Prioritize progressive enhancement
- Maintain backwards compatibility
- Focus on performance and accessibility
- Test everything thoroughly

### Quick Wins
Start with these for immediate impact:
1. ✅ ~~Fix decimal precision issues~~ (COMPLETED)
2. Fix the default content typo
3. Add localStorage error handling  
4. Implement undo stack limit
5. Add basic ARIA labels
6. Fix mobile keyboard handling
7. Set up testing framework

### Long-term Vision
- Become the go-to calculator for technical users
- Support complex mathematical workflows
- Enable collaboration and sharing
- Maintain simplicity while adding power features