/**
 * @fileoverview SCP (Sphere Script) document formatter that provides intelligent
 * formatting for Sphere script files including keyword capitalization, trigger
 * formatting, and proper code structure formatting.
 */

const vscode = require("vscode");
const { VarsKeywords, ScopedVarPrefixes, ControlKeywords } = require("./constants");

/**
 * Formatter class for Sphere script (.scp) files.
 * Provides document formatting functionality for VS Code.
 */
class SCPFormatter {
  /**
   * Returns true when a line is a comment and should not be formatted.
   * 
   * @param {string} line - The line to check
   * @returns {boolean} True if the line is a comment
   */
  isCommentLine(line) {
    return line.trim().startsWith("//");
  }
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
  formatTriggers(sourceLine) {
    const triggerPattern = /(\bon=@\w+\b[^\s/]*)(?!\S)/gi;
    return sourceLine.replace(triggerPattern, (match) => {
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
  formatAssignmentKeywords(sourceLine) {
    for (const varKeyword of VarsKeywords) {
      const assignmentPattern = new RegExp(`^[ \\t]*${varKeyword}=`, "i");
      sourceLine = sourceLine.replace(assignmentPattern, `${varKeyword.toUpperCase()}=`);
    }

    return sourceLine;
  }

  /**
   * Formats scoped variable prefixes for dotted assignments.
   * Converts patterns like "tag.name=" to "TAG.name=".
   * 
   * @param {string} line - The line to format
   * @returns {string} The formatted line with uppercase scoped prefixes
   */
  formatScopedAssignments(sourceLine) {
    for (const prefix of ScopedVarPrefixes) {
      const scopedPattern = new RegExp(`^(\\s*)(${prefix})(?=\\.|=)`, "i");
      sourceLine = sourceLine.replace(scopedPattern, (match, whitespace, keyword) => {
        return whitespace + keyword.toUpperCase();
      });
    }

    return sourceLine;
  }

  /**
   * Formats control structure keywords to uppercase.
   * Handles keywords like BEGIN, END, IF, ENDIF, FOR, ENDFOR, etc.
   * 
   * @param {string} line - The line to format
   * @returns {string} The formatted line with uppercase control keywords
   */
  formatControlKeywords(sourceLine) {
    for (const control of ControlKeywords) {
      // Match control keywords at the beginning of line (possibly with whitespace)
      const controlPattern = new RegExp(`^(\\s*)(${control})\\b`, "i");
      sourceLine = sourceLine.replace(controlPattern, (match, whitespace, keyword) => {
        return whitespace + keyword.toUpperCase();
      });
    }

    return sourceLine;
  }

  /**
   * Formats section headers to uppercase.
   * Converts patterns like "[itemdef something]" to "[ITEMDEF something]".
   * 
   * @param {string} line - The line to format
   * @returns {string} The formatted line with uppercase section headers
   */
  formatSectionHeaders(sourceLine) {
    // Format section headers like [TYPEDEF], [ITEMDEF], [CHARDEF], etc.
    const sectionPattern = /^\s*\[(\w+)(\s+.*)?\]\s*$/i;
    sourceLine = sourceLine.replace(sectionPattern, (match, sectionType, rest) => {
      rest = rest || "";
      return `[${sectionType.toUpperCase()}${rest}]`;
    });

    return sourceLine;
  }

  /**
   * Formats common Sphere function calls to uppercase.
   * Handles functions like SAY, EMOTE, SYSMESSAGE, etc.
   * 
   * @param {string} line - The line to format
   * @returns {string} The formatted line with uppercase function calls
   */
  formatCommandCalls(sourceLine) {
    // Common Sphere functions that should be uppercase
    const commandKeywords = [
      "SAY", "EMOTE", "SYSMESSAGE", "DIALOG", "NEWITEM", "EQUIP", "UNEQUIP",
      "GO", "FACE", "FOLLOW", "SPEAK", "BOUNCE", "CONSUME", "REMOVE"
    ];

    for (const func of commandKeywords) {
      // Match function calls (word followed by space or opening parenthesis)
      const commandPattern = new RegExp(`\\b(${func})\\b(?=\\s|\\(|$)`, "gi");
      sourceLine = sourceLine.replace(commandPattern, func.toUpperCase());
    }

    return sourceLine;
  }

  /**
   * Main line formatting method that applies all formatting rules.
   * Skips comment lines and applies formatting in the correct order.
   * 
   * @param {string} line - The line to format
   * @returns {string} The fully formatted line
   */
  formatLine(sourceLine) {
    if (this.isCommentLine(sourceLine)) {
      return sourceLine;
    }

    // Apply formatting in order:
    // 1. Section headers (must be first to avoid conflicts)
    // 2. Triggers (ON= patterns)
    // 3. Variables (keyword= patterns) 
    // 4. Control structures (BEGIN, IF, etc.)
    // 5. Function calls (SAY, EMOTE, etc.)
    sourceLine = this.formatSectionHeaders(sourceLine);
    sourceLine = this.formatTriggers(sourceLine);
    sourceLine = this.formatScopedAssignments(sourceLine);
    sourceLine = this.formatAssignmentKeywords(sourceLine);
    sourceLine = this.formatControlKeywords(sourceLine);
    sourceLine = this.formatCommandCalls(sourceLine);

    return sourceLine;
  }
}

module.exports = SCPFormatter;
