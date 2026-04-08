// jest.setup.js
// This runs before the test environment is set up

// Set up global objects that Expo expects
global.__ExpoImportMetaRegistry = {
  get: () => {},
  set: () => {},
};

global.structuredClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
};
