/**
 * @fileoverview Main extension entry point for Sphere Scripter VS Code extension.
 * Provides formatting capabilities for Sphere script (.scp) files.
 */

const vscode = require("vscode");
const SCPFormatter = require("./formatter/scp.formatter");

// Initialize the formatter instance
const formatter = new SCPFormatter();

/**
 * Called when the extension is activated.
 * Registers the document formatting provider for .scp files.
 * 
 * @param {vscode.ExtensionContext} context - The extension context
 */
function activate(context) {
  const formattingProvider = {
    /**
     * Provides formatting edits for the document
     * @param {vscode.TextDocument} document - The document to format
     * @returns {vscode.TextEdit[]} Array of text edits to apply
     */
    provideDocumentFormattingEdits(document) {
      return formatter.provideDocumentFormattingEdits(document);
    },
  };

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      { language: "scp" },
      formattingProvider
    )
  );
}

/**
 * Called when the extension is deactivated.
 * Currently performs no cleanup operations.
 */
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
