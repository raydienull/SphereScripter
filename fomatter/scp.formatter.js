const vscode = require("vscode");
const { VarsKeywords } = require("./constants");

class SCPFormatter {
  provideDocumentFormattingEdits(document, options, token) {
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

  // format triggers (ON=) to uppercase
  formatTriggers(line) {
    var pattern = /(\bon=@\w+\b[^\s/]*)(?!\S)/gi;

    // Do not format commented lines
    if (line.trim().startsWith("//")) {
      return line;
    }

    return line.replace(pattern, (match) => {
      return match.toUpperCase();
    });
  }

  formatVars(line) {
    for (const varKeyword of VarsKeywords) {
      var pattern = new RegExp(`^[ \t]*${varKeyword}=`, "i");
      line = line.replace(pattern, `${varKeyword.toUpperCase()}=`);
    }

    return line;
  }

  //format keywords to uppercase
  formatLine(line) {
    // Do not format commented lines
    if (!line.trim().startsWith("//")) {
      //format triggers
      line = this.formatTriggers(line);

      //format vars
      line = this.formatVars(line);
    }

    return line;
  }
}

module.exports = SCPFormatter;
