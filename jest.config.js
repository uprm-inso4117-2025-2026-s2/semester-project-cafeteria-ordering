module.exports = {
    preset: "jest-expo",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
    testMatch: ["**/?(*.)+(test|spec).[tj]s?(x)"],
    transformIgnorePatterns: [
        "node_modules/(?!(jest-)?react-native|@react-native|react-native|expo(nent)?|@expo(nent)?/.*|expo-router|@expo/vector-icons|@react-navigation/.*|@react-native-async-storage/async-storage)"
    ],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^expo$": "<rootDir>/src/tests/__mocks__/expoMock.js",
        "^expo/(.*)$": "<rootDir>/src/tests/__mocks__/expoMock.js",
        "\\.(png|jpg|jpeg|gif|webp|svg)$": "<rootDir>/src/tests/__mocks__/fileMock.js"
    }
};