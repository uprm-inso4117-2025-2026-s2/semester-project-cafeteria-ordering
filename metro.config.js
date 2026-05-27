const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Exclude @stripe/stripe-react-native from web bundling
config.resolver.blockList = [
    ...(config.resolver.blockList || []),
    /node_modules\/@stripe\/stripe-react-native\/.*/,
];

module.exports = withNativeWind(config, { input: "./global.css" });