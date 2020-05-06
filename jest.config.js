// https://jestjs.io/docs/en/configuration.html

module.exports = {
	collectCoverage: true,

	// The directory where Jest should output its coverage files
	coverageDirectory: 'coverage',

	// An array of regexp pattern strings used to skip coverage collection
	coveragePathIgnorePatterns: ['/node_modules/'],

	// A preset that is used as a base for Jest's configuration
	preset: 'ts-jest',

	// The test environment that will be used for testing
	testEnvironment: 'node',
	testMatch: ['**/*.spec.ts'],
	testPathIgnorePatterns: ['/node_modules/'],
};
