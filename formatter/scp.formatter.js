/**
 * @fileoverview SCP (Sphere Script) document formatter that provides intelligent
 * formatting for Sphere script files including keyword capitalization, trigger
 * formatting, and proper code structure formatting.
 */

const vscode = require("vscode");
const {
  VarsKeywords,
  ScopedVarPrefixes,
  ControlKeywords,
  CommandKeywords
} = require("./constants");

/**
 * Formatter class for Sphere script (.scp) files.
 * Provides document formatting functionality for VS Code.
 */
class SCPFormatter {
  /**
   * Precompiles the regular expressions and keyword lookups used while
   * formatting. Building these once (instead of per line) keeps formatting
   * fast on large files and centralizes the matching rules.
   */
  constructor() {
    // Matches a section header line such as "[ITEMDEF i_test]".
    this.sectionPattern = /^\s*\[(\w+)(\s+.*)?\]\s*$/i;
    // Captures the first bare keyword of a line (used to detect block control).
    this.leadingKeywordPattern = /^\s*([A-Za-z_]+)\b/;
    // Matches trigger declarations such as "ON=@Create".
    this.triggerPattern = /(\bon=@\w+\b[^\s/]*)(?!\S)/gi;
    // Captures a leading "keyword=" assignment.
    this.assignmentPattern = /^([ \t]*)([A-Za-z_]\w*)=/;

    // Fast membership lookups for keyword classification.
    this.controlKeywordSet = new Set(ControlKeywords);
    this.varKeywordSet = new Set(VarsKeywords.map((keyword) => keyword.toUpperCase()));

    // Anchored patterns so only the leading token of a statement is rewritten.
    this.controlPattern = new RegExp(`^(\\s*)(${ControlKeywords.join("|")})\\b`, "i");
    this.commandPattern = new RegExp(`^(\\s*)(${CommandKeywords.join("|")})\\b`, "i");
    this.scopedPattern = new RegExp(`^(\\s*)(${ScopedVarPrefixes.join("|")})(?=\\.|=)`, "i");
  }

  /**
   * Determines the indentation unit based on VS Code formatting options.
   * 
   * @param {vscode.FormattingOptions | undefined} options - Formatting options
   * @returns {string} Indentation unit (tabs or spaces)
   */
  getIndentUnit(options) {
    if (options && options.insertSpaces) {
      const size = Number.isInteger(options.tabSize) ? options.tabSize : 2;
      return " ".repeat(Math.max(1, size));
    }

    return "\t";
  }

  /**
   * Returns true when a line is a section header like [ITEMDEF ...].
   * 
   * @param {string} line - The line to check
   * @returns {boolean} True if the line is a section header
   */
  isSectionHeader(line) {
    return this.sectionPattern.test(line);
  }

  /**
   * Extracts the first control keyword from a line if present.
   * 
   * @param {string} line - The line to inspect
   * @returns {string | null} The control keyword in uppercase or null
   */
  getControlKeyword(line) {
    const match = line.match(this.leadingKeywordPattern);
    if (!match) {
      return null;
    }

    const keyword = match[1].toUpperCase();
    if (this.controlKeywordSet.has(keyword)) {
      return keyword;
    }

    return null;
  }

  /**
   * Returns true when the control keyword closes a block.
   * 
   * @param {string | null} keyword - The keyword to check
   * @returns {boolean} True if the keyword is a block end
   */
  isBlockEnd(keyword) {
    return (
      keyword === "END" ||
      keyword === "ENDIF" ||
      keyword === "ENDFOR" ||
      keyword === "ENDWHILE" ||
      keyword === "ENDDO"
    );
  }

  /**
   * Returns true when the control keyword is a mid-block token.
   * 
   * @param {string | null} keyword - The keyword to check
   * @returns {boolean} True if the keyword is a block middle
   */
  isBlockMiddle(keyword) {
    return keyword === "ELSE" || keyword === "ELSEIF" || keyword === "ELIF";
  }

  /**
   * Returns true when the control keyword opens a block.
   * 
   * @param {string | null} keyword - The keyword to check
   * @returns {boolean} True if the keyword is a block start
   */
  isBlockStart(keyword) {
    if (!keyword) {
      return false;
    }

    return (
      keyword === "BEGIN" ||
      keyword === "IF" ||
      keyword === "WHILE" ||
      keyword === "DORAND" ||
      keyword === "DOSWITCH" ||
      keyword === "FOR" ||
      keyword === "FORCHARLAYER" ||
      keyword === "FORCHARMEMORYTYPE" ||
      keyword === "FORCHARS" ||
      keyword === "FORCLIENTS" ||
      keyword === "FORCONT" ||
      keyword === "FORCONTID" ||
      keyword === "FORCONTTYPE" ||
      keyword === "FORINSTANCES" ||
      keyword === "FORITEMS" ||
      keyword === "FOROBJS" ||
      keyword === "FORPLAYERS"
    );
  }
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
  provideDocumentFormattingEdits(document, options) {
    const textEdits = [];
    const indentUnit = this.getIndentUnit(options);
    let indentLevel = 0;

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const trimmedLine = line.text.trimRight();
      const trimmedContent = trimmedLine.trimLeft();
      const formattedContent = this.formatLine(trimmedContent);
      let formattedLine = formattedContent;

      if (formattedContent.length > 0) {
        if (this.isSectionHeader(formattedContent)) {
          indentLevel = 0;
        } else {
          const controlKeyword = this.getControlKeyword(formattedContent);
          const isCloser = this.isBlockEnd(controlKeyword);
          const isMiddle = this.isBlockMiddle(controlKeyword);

          if (isCloser || isMiddle) {
            indentLevel = Math.max(0, indentLevel - 1);
          }

          formattedLine = `${indentUnit.repeat(indentLevel)}${formattedContent}`;

          if (this.isBlockStart(controlKeyword)) {
            indentLevel += 1;
          }

          if (isMiddle) {
            indentLevel += 1;
          }
        }
      }
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
    return sourceLine.replace(this.triggerPattern, (match) => {
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
    return sourceLine.replace(this.assignmentPattern, (match, whitespace, keyword) => {
      const upper = keyword.toUpperCase();
      return this.varKeywordSet.has(upper) ? `${whitespace}${upper}=` : match;
    });
  }

  /**
   * Formats scoped variable prefixes for dotted assignments.
   * Converts patterns like "tag.name=" to "TAG.name=".
   * 
   * @param {string} line - The line to format
   * @returns {string} The formatted line with uppercase scoped prefixes
   */
  formatScopedAssignments(sourceLine) {
    return sourceLine.replace(this.scopedPattern, (match, whitespace, keyword) => {
      return whitespace + keyword.toUpperCase();
    });
  }

  /**
   * Formats control structure keywords to uppercase.
   * Handles keywords like BEGIN, END, IF, ENDIF, FOR, ENDFOR, etc.
   * 
   * @param {string} line - The line to format
   * @returns {string} The formatted line with uppercase control keywords
   */
  formatControlKeywords(sourceLine) {
    // Only the leading control keyword of a line is rewritten; the anchored
    // pattern combined with \b prevents partial matches (e.g. FOR vs FORITEMS).
    return sourceLine.replace(this.controlPattern, (match, whitespace, keyword) => {
      return whitespace + keyword.toUpperCase();
    });
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
    return sourceLine.replace(this.sectionPattern, (match, sectionType, rest) => {
      rest = rest || "";
      return `[${sectionType.toUpperCase()}${rest}]`;
    });
  }

  /**
   * Formats common Sphere command calls to uppercase.
   * Handles commands like SAY, EMOTE, SYSMESSAGE, etc.
   *
   * Only the leading command token of a statement is rewritten. Matching the
   * whole line would corrupt literal message text (e.g. "SAY lets go" must not
   * become "SAY lets GO"), so the pattern is anchored to the start of the line.
   *
   * @param {string} line - The line to format
   * @returns {string} The formatted line with an uppercase leading command
   */
  formatCommandCalls(sourceLine) {
    return sourceLine.replace(this.commandPattern, (match, whitespace, keyword) => {
      return whitespace + keyword.toUpperCase();
    });
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
