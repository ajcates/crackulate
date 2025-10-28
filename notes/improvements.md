# Crackulator Improvements & Feature Ideas

This doc tracks potential improvements and features to make Crackulator even more fire.

## 🔥 Core Calculator Features

### Mathematical Functions
- [ ] **Built-in math functions**: `sin()`, `cos()`, `tan()`, `sqrt()`, `abs()`, `round()`, `floor()`, `ceil()`
- [ ] **Power operator**: Support `^` or `**` for exponentiation (e.g., `2^3 = 8`)
- [ ] **Modulo operator**: Support `%` for remainder operations
- [ ] **Constants**: Add `pi`, `e` as built-in constants
- [ ] **Min/max functions**: `min(1,2,3)`, `max(4,5,6)`
- [ ] **Percentage calculations**: Better handling of `%` for percentages

### Language Features
- [ ] **Comments**: Support `//` or `#` for line comments that don't calculate
- [ ] **Multi-line expressions**: Break long expressions across lines with `\`
- [ ] **Arrays/lists**: Support `[1, 2, 3]` and operations like `sum([1,2,3])`
- [ ] **Ranges**: Support `1..10` to generate ranges
- [ ] **String support**: Store and concatenate strings, useful for labels
- [ ] **Conditional expressions**: `if/else` or ternary operator `x > 5 ? 10 : 20`
- [ ] **Custom functions**: Define reusable functions like `fn discount(price, pct) = price * (1 - pct)`

### Better Error Handling
- [ ] **Detailed error messages**: Instead of just 'e', show "Division by zero on line 5"
- [ ] **Error highlighting**: Highlight the specific part of the line with the error
- [ ] **Warning messages**: Warn about precision loss, undefined variables, etc.
- [ ] **Error panel**: Show all errors in a collapsible panel at bottom

## 🎨 UI/UX Improvements

### Editor Enhancements
- [ ] **Syntax highlighting**: Color-code numbers, operators, variables, functions
- [ ] **Line highlighting**: Highlight current line or line on hover
- [ ] **Bracket matching**: Highlight matching parentheses
- [ ] **Auto-indent**: Smart indentation for multi-line expressions
- [ ] **Line selection**: Click line number to select entire line
- [ ] **Drag to reorder**: Drag lines up/down to reorder (with auto-recalculation)
- [ ] **Copy result button**: Click result to copy to clipboard
- [ ] **Result formatting**: Format large numbers with commas (1000 → 1,000)

### Dark Mode & Themes
- [ ] **Dark mode toggle**: Manual toggle for dark/light mode
- [ ] **Auto theme**: Follow system preference
- [ ] **Custom themes**: Multiple color schemes (Material You, Nord, Dracula, etc.)
- [ ] **Theme editor**: Let users customize colors

### Mobile Experience
- [ ] **Better keyboard**: Numeric keyboard with calculator symbols
- [ ] **Swipe gestures**: Swipe to delete lines, undo, etc.
- [ ] **Pinch to zoom**: Scale font size with pinch gesture
- [ ] **Landscape mode**: Better layout for landscape orientation
- [ ] **Haptic feedback**: Vibration on button presses

### Visual Polish
- [ ] **Loading states**: Show loading spinner during calculations
- [ ] **Empty state**: Better UI when no files exist
- [ ] **Animations**: Smooth transitions for tab switching, modal opening
- [ ] **Progress indicator**: Show calculation progress for large files
- [ ] **Result diff**: Highlight results that changed after edit

## 📝 Editor Features

### Undo/Redo
- [ ] **Redo functionality**: Currently only undo exists, add redo (Ctrl+Shift+Z)
- [ ] **Persistent history**: Save undo history to localStorage
- [ ] **History panel**: Show list of recent changes with timestamps

### Find & Replace
- [ ] **Find**: Ctrl+F to search in editor
- [ ] **Replace**: Ctrl+H to find and replace
- [ ] **Find in all files**: Search across all saved files
- [ ] **Regex support**: Use regex patterns in search

### Advanced Editing
- [ ] **Multi-cursor**: Alt+Click to add cursors, edit multiple lines
- [ ] **Auto-complete**: Suggest variable names as you type
- [ ] **Variable renaming**: Rename variable and update all references
- [ ] **Line commenting**: Ctrl+/ to toggle comment on selected lines
- [ ] **Duplicate line**: Ctrl+D to duplicate current line
- [ ] **Move line up/down**: Alt+Up/Down to move lines
- [ ] **Select word/line**: Double-click word, triple-click line

### Code Organization
- [ ] **Sections/headings**: Support `## Section Name` for organizing calculations
- [ ] **Collapsible sections**: Fold/unfold sections to focus on specific parts
- [ ] **Bookmarks**: Mark important lines for quick navigation
- [ ] **Minimap**: Show overview of entire document like VS Code

## 📁 File Management

### File Operations
- [ ] **Rename files**: Edit filename in UI without opening file menu
- [ ] **Duplicate file**: Copy existing file with "Copy of..." prefix
- [ ] **File templates**: Create files from templates (Budget, Invoice, etc.)
- [ ] **Import files**: Upload .txt, .csv, .calc files
- [ ] **Export files**: Download as .txt, .csv, .json, .pdf
- [ ] **Trash/recycle bin**: Soft delete files, restore within 30 days
- [ ] **File search**: Filter files by name in file modal
- [ ] **Sort files**: Sort by name, date modified, date created
- [ ] **File tags**: Add tags to files for organization
- [ ] **File folders**: Organize files into folders/categories

### File Info
- [ ] **File metadata**: Show created date, modified date, line count, char count
- [ ] **File size**: Display file size in bytes/KB
- [ ] **Version history**: Track changes over time, restore previous versions
- [ ] **Last modified**: Show "Edited 5 minutes ago" in file list

## 🔗 Sharing & Collaboration

### Enhanced Sharing
- [ ] **QR code generation**: Generate QR code for shared URLs for easy mobile sharing
- [ ] **Custom URL slugs**: Instead of random hash, use memorable slugs (crackulator.app/s/my-budget)
- [ ] **Share expiration**: Set expiration dates for shared links
- [ ] **Password protection**: Require password to view shared calculations
- [ ] **Share analytics**: See how many times share link was viewed
- [ ] **Share preview**: Show preview image when sharing on social media

### Embedding & Integration
- [ ] **Embeddable widget**: iframe embed code for blogs/websites
- [ ] **Public gallery**: Share calculations to public gallery for others to discover
- [ ] **API access**: REST API to run calculations programmatically
- [ ] **Webhook integration**: Trigger webhooks when calculations change

## ⚡ Performance & Technical

### Calculation Optimization
- [ ] **Lazy evaluation**: Only recalculate lines affected by changes
- [ ] **Dependency graph**: Build graph of variable dependencies for smarter recalc
- [ ] **Web worker**: Move calculations to background thread for large files
- [ ] **Calculation limits**: Prevent infinite loops or resource exhaustion
- [ ] **Memoization**: Cache results of expensive calculations

### Rendering Performance
- [ ] **Virtual scrolling**: Only render visible lines for files with 1000+ lines
- [ ] **Debounce improvements**: Tune debounce timing for better responsiveness
- [ ] **Progressive rendering**: Render results incrementally as they calculate

### Data Management
- [ ] **Export all data**: Backup all files and settings to JSON
- [ ] **Import backup**: Restore from backup file
- [ ] **Cloud sync**: Optional sync to cloud storage (Dropbox, Google Drive)
- [ ] **IndexedDB migration**: Move from localStorage to IndexedDB for larger capacity
- [ ] **Compression**: Compress stored files to save space

## 🧪 Developer Experience

### Testing & Quality
- [ ] **Unit tests**: Test core calculation logic
- [ ] **E2E tests**: Test user flows (create file, share, etc.)
- [ ] **Visual regression tests**: Catch UI breaking changes
- [ ] **Performance monitoring**: Track calculation times, render times
- [ ] **Error tracking**: Integrate Sentry or similar for production errors

### Documentation
- [ ] **User guide**: In-app tutorial for new users
- [ ] **Keyboard shortcuts panel**: Show all shortcuts (Ctrl+?)
- [ ] **Function reference**: Documentation for all built-in functions
- [ ] **Example gallery**: Built-in examples (budget, tip calculator, etc.)
- [ ] **Release notes**: Show what's new after updates

### Debug Tools
- [ ] **Debug mode**: Toggle verbose logging for troubleshooting
- [ ] **AST viewer**: Show parsed AST for debugging expressions
- [ ] **Variable inspector**: Panel showing all variables and their values
- [ ] **Performance profiler**: Show which lines are slowest to calculate
- [ ] **Console access**: Built-in REPL for testing expressions

## ♿ Accessibility

### Keyboard Navigation
- [ ] **Full keyboard support**: Navigate entire app without mouse
- [ ] **Focus indicators**: Clear visual focus states
- [ ] **Keyboard shortcuts**: Document and support standard shortcuts
- [ ] **Skip to content**: Skip navigation links for screen readers

### Screen Reader Support
- [ ] **ARIA labels**: Proper ARIA labels on all interactive elements
- [ ] **Live regions**: Announce calculation results to screen readers
- [ ] **Semantic HTML**: Use proper heading hierarchy, landmarks

### Visual Accessibility
- [ ] **High contrast mode**: WCAG AAA compliant high contrast theme
- [ ] **Font size controls**: Zoom in/out with Ctrl+/Ctrl- or dedicated buttons
- [ ] **Dyslexia-friendly font**: Option for OpenDyslexic or similar fonts
- [ ] **Color blind modes**: Adjust colors for different types of color blindness
- [ ] **Reduced motion**: Respect `prefers-reduced-motion` for animations

## 🎯 Product Features

### Templates & Examples
- [ ] **Budget template**: Pre-built budget calculator
- [ ] **Tip calculator**: Restaurant tip and split calculator
- [ ] **Unit converter**: Convert between units (miles to km, etc.)
- [ ] **Loan calculator**: Calculate loan payments, interest
- [ ] **Grade calculator**: Calculate GPA, grade averages
- [ ] **Time calculator**: Work with hours, minutes, seconds

### Social Features
- [ ] **User accounts**: Optional accounts for cloud sync
- [ ] **Profile page**: Show user's public calculations
- [ ] **Following**: Follow other users, see their public calcs
- [ ] **Comments**: Comment on shared calculations
- [ ] **Likes/favorites**: Star/like favorite calculations
- [ ] **Forking**: Copy and modify someone else's shared calc

### Monetization Ideas (if needed)
- [ ] **Pro version**: Premium features (cloud sync, unlimited files, themes)
- [ ] **Tips/donations**: Let users support development
- [ ] **Team features**: Shared workspaces for teams
- [ ] **White label**: Sell embedded version to businesses

## 🐛 Bug Fixes & Polish

### Known Issues
- [ ] **NaN display**: Show 'NaN' or 'Error' instead of '0' for invalid operations
- [ ] **Precision issues**: Fix floating point precision problems (0.1 + 0.2 = 0.30000000000000004)
- [ ] **Very large numbers**: Better formatting for scientific notation
- [ ] **Circular references**: Detect and warn about circular variable references

### UX Polish
- [ ] **Confirmation dialogs**: Confirm destructive actions (delete file, clear all)
- [ ] **Unsaved changes warning**: Better detection and warning
- [ ] **Loading states**: Show loading for slow operations
- [ ] **Empty states**: Better messaging when no results or files
- [ ] **Success animations**: Satisfying animations on save, share, etc.

---

## Priority Legend

- 🔥 **High Priority**: Core features that would significantly improve the app
- 💎 **Quick Wins**: Easy to implement, high user value
- 🎨 **Polish**: Nice-to-have improvements for better UX
- 🔮 **Future**: Ideas for much later or major versions

## Contributing

Got more ideas? Add them here! Keep it organized by category and mark with priority.
