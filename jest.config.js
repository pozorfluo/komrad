module.exports = {
    preset: 'ts-jest',
    roots : [
        "<rootDir>/js/src"
    ],
    testEnvironment: 'jest-environment-jsdom',
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    transformIgnorePatterns: ['^.+\\.js$'],
    collectCoverage: true,
};
