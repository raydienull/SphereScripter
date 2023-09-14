const vscode = require("vscode");
const SCPFormatter = require("./fomatter/scp.formatter");
const formatter = new SCPFormatter();

function activate(context) {
  const formattingProvider = {
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

function deactivate() {}

exports.activate = activate;
exports.deactivate = deactivate;
