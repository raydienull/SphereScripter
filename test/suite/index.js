/**
 * @fileoverview Test runner for the Sphere Scripter VS Code extension.
 * Configures and runs Mocha tests in the VS Code extension environment.
 */

const path = require('path');
const Mocha = require('mocha');
const glob = require('glob');

/**
 * Runs all test files in the test suite using Mocha.
 * Discovers test files using glob pattern and executes them.
 * 
 * @returns {Promise<void>} Promise that resolves when tests complete successfully
 * @throws {Error} If tests fail or encounter errors
 */
function run() {
	// Create the mocha test runner with TDD interface
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((resolve, reject) => {
		// Find all test files matching the pattern
		glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
			if (err) {
				return reject(err);
			}

			// Add all discovered test files to the test suite
			files.forEach(file => mocha.addFile(path.resolve(testsRoot, file)));

			try {
				// Execute the test suite
				mocha.run(failures => {
					if (failures > 0) {
						reject(new Error(`${failures} tests failed.`));
					} else {
						resolve();
					}
				});
			} catch (err) {
				console.error(err);
				reject(err);
			}
		});
	});
}

module.exports = {
	run
};
