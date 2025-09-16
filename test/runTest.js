/**
 * @fileoverview Main test runner entry point for VS Code extension tests.
 * Downloads VS Code, sets up the extension environment, and runs tests.
 */

const path = require('path');
const { runTests } = require('@vscode/test-electron');

/**
 * Main function that sets up and runs the extension tests.
 * Downloads VS Code if needed and executes tests in the extension environment.
 */
async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../');

		// The path to the extension test script
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// Download VS Code, unzip it and run the integration test
		await runTests({ extensionDevelopmentPath, extensionTestsPath });
	} catch (err) {
		console.error('Failed to run tests', err);
		process.exit(1);
	}
}

main();
