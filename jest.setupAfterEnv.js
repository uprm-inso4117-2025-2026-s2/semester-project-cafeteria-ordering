// jest.setupAfterEnv.js
// This runs after the test environment is set up

// Complete mock of React Native - DO NOT use requireActual
jest.mock('react-native', () => ({
  // Core components
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  ScrollView: 'ScrollView',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  TouchableOpacity: 'TouchableOpacity',
  Image: 'Image',
  Pressable: 'Pressable',
  Modal: 'Modal',
  Dimensions: {
    get: () => ({ width: 375, height: 667 }),
  },
  StyleSheet: {
    create: (styles) => styles,
    flatten: (styles) => styles,
  },
  Platform: {
    OS: 'ios',
    select: (obj) => obj.ios || obj.default,
    isTesting: true,
  },
  AccessibilityInfo: {
    announceForAccessibility: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  NativeModules: {
    PlatformConstants: {
      reactNativeVersion: { major: 0, minor: 81, patch: 0 },
    },
  },
  // Mock hooks
  useColorScheme: () => 'light',
  useWindowDimensions: () => ({ width: 375, height: 667 }),
}));

// Mock other React Native modules
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: (obj) => obj.ios || obj.default,
  isTesting: true,
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: ({ children }: any) => children,
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSegments: () => [],
  useLocalSearchParams: () => ({}),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    manifest: {},
    expoConfig: {},
    platform: { ios: false, android: true },
    deviceName: 'Test Device',
    systemVersion: '14.0',
  },
  Constants: {
    manifest: {},
    expoConfig: {},
    platform: { ios: false, android: true },
  },
}));

// Mock expo modules
jest.mock('expo', () => ({
  registerRootComponent: jest.fn(),
  Linking: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    openURL: jest.fn(),
    canOpenURL: jest.fn(),
  },
}));

jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: {},
  requireNativeModule: jest.fn(),
  requireNativeViewManager: jest.fn(),
  EventEmitter: class {},
  CodedError: class Error {},
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  presentNotificationAsync: jest.fn(),
  dismissNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock your custom components
jest.mock('@/components/themed-text', () => {
  const { Text } = require('react-native');
  return {
    ThemedText: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement(Text, props, children);
    },
  };
});

jest.mock('@/constants/theme', () => ({
  Colors: {
    pastelSage: '#D3E0D3',
    pastelPeach: '#FFCCBC',
    mutedGray: '#9CA3AF',
    primaryGreen: '#4CAF50',
    softGray: '#EEEEEE',
    light: { text: '#000000', secondaryText: '#FFFFFF', alternateText: '#1C1C1C', background: '#FAFAFA' },
    dark: { text: '#FFFFFF', secondaryText: '#BDBDBD', alternateText: '#1C1C1C', background: '#1C1C1C' },
  },
  Typography: {
    heading: { fontFamily: 'Bitter' },
    subheading: { fontFamily: 'Inter' },
    body: { fontFamily: 'Inter' },
    button: { fontFamily: 'Inter' },
  },
}));

jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

// Mock ThemedView
jest.mock('@/components/themed-view', () => {
  const { View } = require('react-native');
  return {
    ThemedView: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement(View, props, children);
    },
  };
});

// Mock custom UI components
jest.mock('@/components/ui/inputField', () => {
  const { TextInput } = require('react-native');
  return {
    __esModule: true,
    default: ({ label, value, onChangeText, ...props }: any) => {
      const React = require('react');
      return React.createElement(TextInput, {
        accessibilityLabel: label || 'input',
        value,
        onChangeText,
        nativeID: label || '',
        ...props,
      });
    },
  };
});

jest.mock('@/components/ui/primaryButton', () => {
  const { Pressable, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ title, onPress, ...props }: any) => {
      const React = require('react');
      return React.createElement(
        Pressable,
        { onPress, accessibilityRole: 'button', accessibilityLabel: title, ...props },
        React.createElement(Text, {}, title)
      );
    },
  };
});

jest.mock('@/components/ui/popupCard', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ visible, children, ...props }: any) => {
      const React = require('react');
      if (!visible) return null;
      return React.createElement(View, { accessibilityLabel: 'popup', ...props }, children);
    },
  };
});

// Mock password recovery lib
jest.mock('@/lib/password-recovery', () => ({
  requestPasswordReset: jest.fn(),
  updateRecoveredPassword: jest.fn(),
  validateEmailForPasswordRecovery: jest.fn(),
  validatePasswordPolicy: jest.fn(),
  PASSWORD_RESET_REQUEST_MESSAGE: 'If an account exists for that email, a password reset link has been sent.',
}));

jest.mock('@/lib/auth', () => ({
  mapSignUpError: jest.fn((error) => error),
  mapLoginError: jest.fn((error) => error),
}));

// Suppress warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes('has been extracted')) return;
  if (args[0]?.includes('has been deprecated')) return;
  originalConsoleWarn(...args);
};

const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes('not wrapped in act')) return;
  if (args[0]?.includes('TurboModuleRegistry')) return;
  originalConsoleError(...args);
};

globalThis.IS_REACT_ACT_ENVIRONMENT = true;