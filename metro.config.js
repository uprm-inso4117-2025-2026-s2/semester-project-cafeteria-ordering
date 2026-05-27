const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Exclude @stripe/stripe-react-native from web bundling
config.resolver.blockList = [
    ...(config.resolver.blockList || []),
    /node_modules\/@stripe\/stripe-react-native\/.*/,
];

module.exports = config;