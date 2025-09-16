# SphereSvrScripter VS Code Extension

**ALWAYS follow these instructions first and fallback to search or additional context gathering only when the information here is incomplete or found to be in error.**

SphereSvrScripter is a Visual Studio Code extension that provides syntax highlighting, formatting, and code snippets for Sphere script files (.scp). The extension is built with JavaScript/Node.js and uses the VS Code Extension API.

## Prerequisites and Setup

- Ensure Node.js v20+ is installed
- Ensure npm v10+ is installed
- Run all commands from the repository root directory

## Essential Commands

### Install Dependencies
```bash
npm install
```
**Timing:** ~12 seconds. NEVER CANCEL - set timeout to 30+ seconds.
**Result:** Installs all required dependencies including VS Code API types, testing frameworks, and development tools.

### Linting
```bash
npm run lint
```
**Timing:** <1 second
**Purpose:** Validates JavaScript code style and correctness using ESLint.

```bash
npm run lint:fix
```
**Timing:** <1 second
**Purpose:** Automatically fixes linting issues where possible.

### Extension Packaging
```bash
vsce package --no-dependencies
```
**Prerequisites:** Install vsce globally: `npm install -g @vscode/vsce`
**Timing:** ~2 seconds. Set timeout to 30+ seconds.
**Result:** Creates a `.vsix` file that can be installed in VS Code.

### Testing
```bash
npm test
```
**IMPORTANT:** Tests require downloading VS Code and will fail in network-restricted environments with "ENOTFOUND update.code.visualstudio.com" error. This is expected behavior in sandboxed environments.

**Alternative validation:**
```bash
# Validate syntax of core files
node -c extension.js
node -c formatter/scp.formatter.js
```

## Building and Validation Workflow

### 1. Initial Setup
```bash
npm install
```

### 2. Validate Code Quality
```bash
npm run lint
```
**Always run this before making changes to understand baseline.**

### 3. Make Changes
- Edit extension code in `extension.js`
- Edit formatter logic in `formatter/scp.formatter.js`
- Edit language syntax in `syntaxes/scp.Language.json`
- Edit snippets in `snippets/scp.Snippets.json`

### 4. Validate Changes
```bash
npm run lint
npm run lint:fix  # Fix auto-fixable issues
vsce package --no-dependencies  # Validate extension builds
```

### 5. Manual Validation Scenarios
Since automated tests require VS Code download, validate changes manually:

**For formatter changes:**
- Open VS Code with the extension loaded
- Create a test .scp file with sample Sphere script content
- Test formatting functionality (right-click → Format Document)
- Verify triggers (ON=@timer) are converted to uppercase (ON=@TIMER)
- Verify variable keywords are formatted correctly

**For syntax highlighting changes:**
- Open a .scp file in VS Code
- Verify syntax highlighting for comments (//), strings, keywords, and triggers
- Test autocompletion with snippets

**For snippet changes:**
- Open a .scp file
- Type snippet prefixes (like "begin", "dorand", "for")
- Verify autocompletion works correctly

## Key Files and Navigation

### Core Extension Files
- `extension.js` - Main extension entry point, registers the formatter
- `formatter/scp.formatter.js` - Core formatting logic for SCP files
- `formatter/constants.js` - Keywords, triggers, and variables definitions
- `package.json` - Extension manifest and dependencies

### Configuration Files
- `syntaxes/scp.Language.json` - TextMate grammar for syntax highlighting (25KB)
- `scp.configuration.json` - Language configuration (brackets, comments)
- `snippets/scp.Snippets.json` - Code snippets for common SCP patterns
- `.eslintrc.js` - ESLint configuration

### VS Code Integration
- `.vscode/launch.json` - Debug configurations for "Run Extension" and "Extension Tests"
- `.vscode/extensions.json` - Recommended extensions (currently empty)

## Development Workflow

### Running Extension in Development
1. Open the project in VS Code
2. Press `F5` or use "Run Extension" debug configuration
3. A new VS Code window opens with the extension loaded
4. Test functionality with .scp files

### Making Formatter Changes
1. Edit `formatter/scp.formatter.js`
2. The formatter handles three main operations:
   - `formatTriggers()` - Converts ON=@trigger patterns to uppercase
   - `formatVars()` - Formats variable keywords to uppercase
   - `formatLine()` - Main formatting entry point

### Adding New Keywords
1. Edit `formatter/constants.js`
2. Add keywords to appropriate arrays (VarsKeywords, Triggers, etc.)
3. Test formatting behavior

## Important Notes

### Network Dependencies
- `npm test` fails in network-restricted environments - this is expected
- Use manual validation and `vsce package` for testing instead
- The extension works offline once dependencies are installed

### File Structure Validation
Always check these key files exist and are valid:
```bash
# Core functionality
ls -la extension.js formatter/
# Language support  
ls -la syntaxes/ snippets/ scp.configuration.json
# Configuration
ls -la package.json .eslintrc.js .vscode/
```

### Common Tasks Output Reference

#### Repository Root Structure
```
├── extension.js           # Main extension entry point
├── package.json          # Extension manifest
├── formatter/            # Formatting logic
│   ├── scp.formatter.js  # Main formatter class
│   └── constants.js      # SCP language keywords
├── syntaxes/            # Syntax highlighting
│   └── scp.Language.json # TextMate grammar
├── snippets/            # Code snippets
│   └── scp.Snippets.json # SCP code templates
├── test/                # Test suite
│   ├── runTest.js       # Test runner
│   └── suite/           # Test cases
├── .vscode/             # VS Code configuration
├── img/                 # Extension icon
└── README.md           # Basic documentation
```

#### package.json Scripts
```json
{
  "test": "node ./test/runTest.js",           // Runs extension tests
  "lint": "eslint . --ext .js",              // Lints JavaScript files  
  "lint:fix": "eslint . --ext .js --fix",    // Auto-fixes lint issues
  "extension": "node ./extension.js"         // Direct node execution (limited use)
}
```

## Validation Checklist
Before completing any changes:
- [ ] `npm run lint` passes
- [ ] `vsce package --no-dependencies` succeeds
- [ ] Extension loads in VS Code development host
- [ ] Formatter works on sample .scp files
- [ ] Syntax highlighting displays correctly
- [ ] Snippets autocomplete properly

## Troubleshooting

### Common Issues
- **"Cannot find module 'vscode'"** - Normal when running outside VS Code context
- **"ENOTFOUND update.code.visualstudio.com"** - Expected in network-restricted environments
- **Linting failures** - Run `npm run lint:fix` to auto-resolve many issues

### Performance Expectations
- Dependency installation: ~12 seconds
- Linting: <1 second  
- Extension packaging: ~2 seconds
- Manual testing: 2-5 minutes per scenario

NEVER CANCEL build or package operations - they complete quickly but set timeouts appropriately (30+ seconds) to account for network variations.