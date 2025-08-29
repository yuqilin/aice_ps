const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable CSS support for web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;