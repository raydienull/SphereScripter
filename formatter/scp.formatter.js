/**
 * @fileoverview SCP (Sphere Script) document formatter that provides intelligent
 * formatting for Sphere script files including keyword capitalization, trigger
 * formatting, and proper code structure formatting.
 */

const vscode = require("vscode");
const { VarsKeywords, ScopedVarPrefixes, Controls } = require("./constants");

/**
 * Formatter class for Sphere script (.scp) files.
 * Provides document formatting functionality for VS Code.
 */
class SCPFormatter {
  /**
   * Main method called by VS Code to format a document.
   * Processes each line of the document and applies formatting rules.
   * 
   * @param {vscode.TextDocument} document - The document to format
   * @returns {vscode.TextEdit[]} Array of text edits to apply formatting
   */
  provideDocumentFormattingEdits(document) {
    const textEdits = [];

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const trimmedLine = line.text.trimRight();
      const formattedLine = this.formatLine(trimmedLine);
      const startPos = new vscode.Position(i, 0);
      const endPos = new vscode.Position(i, line.text.length);
      const range = new vscode.Range(startPos, endPos);
      const textEdit = new vscode.TextEdit(range, formattedLine);

      textEdits.push(textEdit);
    }

    return textEdits;
  }

  /**
   * Formats trigger declarations (ON=@trigger) to uppercase.
   * Converts patterns like "on=@create" to "ON=@CREATE".
   * 
   * @param {string} line - The line to format
   * @returns {string} The formatted line with uppercase triggers
   */
  formatTriggers(line) {
    const pattern = /(\bon=@\w+\b[^\s/]*)(?!\S)/gi;

    // Do not format commented lines
    if (line.trim().startsWith("//")) {
      return line;
    }

    return line.replace(pattern, (match) => {
      return match.toUpperCase();
    });
  }

  /**
   * Formats variable keyword assignments to uppercase.
   * Converts patterns like "defname=" to "DEFNAME=".
   * 
   * @param {string} line - The line to format
   * @returns {string} The formatted line with uppercase variable keywords
   */
  formatVars(line) {
    for (const varKeyword of VarsKeywords) {
      const pattern = new RegExp(`^[ \\t]*${varKeyword}=`, "i");
      line = line.replace(pattern, `${varKeyword.toUpperCase()}=`);
    }

    return line;
  }

  /**
   * Formats scoped variable prefixes for dotted assignments.
   * Converts patterns like "tag.name=" to "TAG.name=".
   * 
   * @param {string} line - The line to format
   * @returns {string} The formatted line with uppercase scoped prefixes
   */
  formatScopedVars(line) {
    const trimmed = line.trim();

    if (trimmed.startsWith("//")) {
      return line;
    }

    for (const prefix of ScopedVarPrefixes) {
      const pattern = new RegExp(`^(\\s*)(${prefix})(?=\\.|=)`, "i");
      line = line.replace(pattern, (match, whitespace, keyword) => {
        return whitespace + keyword.toUpperCase();
      });
    }

    return line;
  }

  /**
   * Formats control structure keywords to uppercase.
   * Handles keywords like BEGIN, END, IF, ENDIF, FOR, ENDFOR, etc.
   * 
   * @param {string} line - The line to format
   * @returns {string} The formatted line with uppercase control keywords
   */
  formatControls(line) {
    const trimmed = line.trim();
    
    // Skip comment lines
    if (trimmed.startsWith("//")) {
      return line;
    }

    for (const control of Controls) {
      // Match control keywords at the beginning of line (possibly with whitespace)
      const pattern = new RegExp(`^(\\s*)(${control})\\b`, "i");
      line = line.replace(pattern, (match, whitespace, keyword) => {
        return whitespace + keyword.toUpperCase();
      });
    }

    return line;
  }

  /**
   * Formats section headers to uppercase.
   * Converts patterns like "[itemdef something]" to "[ITEMDEF something]".
   * 
   * @param {string} line - The line to format
   * @returns {string} The formatted line with uppercase section headers
   */
  formatSections(line) {
    const trimmed = line.trim();
    
    // Skip comment lines
    if (trimmed.startsWith("//")) {
      return line;
    }

    // Format section headers like [TYPEDEF], [ITEMDEF], [CHARDEF], etc.
    const sectionPattern = /^\s*\[(\w+)(\s+.*)?\]\s*$/i;
    line = line.replace(sectionPattern, (match, sectionType, rest) => {
      rest = rest || "";
      return `[${sectionType.toUpperCase()}${rest}]`;
    });

    return line;
  }

  /**
   * Formats common Sphere function calls to uppercase.
   * Handles functions like SAY, EMOTE, SYSMESSAGE, etc.
   * 
   * @param {string} line - The line to format
   * @returns {string} The formatted line with uppercase function calls
   */
  formatFunctions(line) {
    const trimmed = line.trim();
    
    // Skip comment lines
    if (trimmed.startsWith("//")) {
      return line;
    }

    // Common Sphere functions that should be uppercase
    const functions = [
      "SAY", "EMOTE", "SYSMESSAGE", "DIALOG", "NEWITEM", "EQUIP", "UNEQUIP",
      "GO", "FACE", "FOLLOW", "SPEAK", "BOUNCE", "CONSUME", "REMOVE"
    ];

    for (const func of functions) {
      // Match function calls (word followed by space or opening parenthesis)
      const pattern = new RegExp(`\\b(${func})\\b(?=\\s|\\(|$)`, "gi");
      line = line.replace(pattern, func.toUpperCase());
    }

    return line;
  }

  /**
   * Main line formatting method that applies all formatting rules.
   * Skips comment lines and applies formatting in the correct order.
   * 
   * @param {string} line - The line to format
   * @returns {string} The fully formatted line
   */
  formatLine(line) {
    // Do not format commented lines
    if (!line.trim().startsWith("//")) {
      // Apply formatting in order:
      // 1. Section headers (must be first to avoid conflicts)
      // 2. Triggers (ON= patterns)
      // 3. Variables (keyword= patterns) 
      // 4. Control structures (BEGIN, IF, etc.)
      // 5. Function calls (SAY, EMOTE, etc.)
      line = this.formatSections(line);
      line = this.formatTriggers(line);
      line = this.formatScopedVars(line);
      line = this.formatVars(line);
      line = this.formatControls(line);
      line = this.formatFunctions(line);
    }

    return line;
  }
}

module.exports = SCPFormatter;
