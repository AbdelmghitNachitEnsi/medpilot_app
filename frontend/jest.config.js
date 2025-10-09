module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['./tests/setup.js'],
    testMatch: [
        '**/tests/unit/**/*.test.(js|jsx)'
    ],
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(your-module|another-module)/)'
    ],
};