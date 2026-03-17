import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import {
  TC_SUPA_01_TEST_DATA,
  getSupabaseCredentialsFromEnv,
} from '../cases/TC-SUPA-01_supabase_configuration_validation';

dotenv.config();

const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentialsFromEnv();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

/**
 * Test suite for Supabase connection and configuration
 *
 * Run these tests to verify:
 * - Supabase client is properly initialized
 * - Environment variables are set correctly
 * - Database connection works
 * - Authentication is configured
 */

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  error?: any;
}

async function testClientInitialization(): Promise<TestResult> {
  try {
    if (!supabase) {
      return {
        name: 'Client Initialization',
        passed: false,
        message: 'Supabase client is not initialized',
      };
    }

    if (!supabase.auth || !supabase.from || !supabase.storage) {
      return {
        name: 'Client Initialization',
        passed: false,
        message: 'Supabase client is missing required methods',
      };
    }

    return {
      name: 'Client Initialization',
      passed: true,
      message: 'Supabase client initialized successfully',
    };
  } catch (error) {
    return {
      name: 'Client Initialization',
      passed: false,
      message: 'Failed to initialize client',
      error,
    };
  }
}

async function testEnvironmentVariables(): Promise<TestResult> {
  try {
    const envUrlValue = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const envAnonValue = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!envUrlValue || !envAnonValue) {
      return {
        name: 'Environment Variables',
        passed: false,
        message: 'Missing Supabase environment variables in .env file',
      };
    }

    if (!envUrlValue.startsWith('https://') || !envUrlValue.includes('supabase.co')) {
      return {
        name: 'Environment Variables',
        passed: false,
        message: 'Invalid Supabase URL format',
      };
    }

    if (!envAnonValue.startsWith('eyJ')) {
      return {
        name: 'Environment Variables',
        passed: false,
        message: 'Invalid Supabase anon key format',
      };
    }

    return {
      name: 'Environment Variables',
      passed: true,
      message: 'Environment variables configured correctly',
    };
  } catch (error) {
    return {
      name: 'Environment Variables',
      passed: false,
      message: 'Error reading environment variables',
      error,
    };
  }
}

async function testDatabaseConnection(): Promise<TestResult> {
  try {
    const { error } = await supabase
      .from(TC_SUPA_01_TEST_DATA.databaseProbe.table)
      .select(TC_SUPA_01_TEST_DATA.databaseProbe.selectColumn)
      .limit(1);

    if (error) {
      return {
        name: 'Database Connection',
        passed: false,
        message: `Database connection error: ${error.message}`,
        error,
      };
    }

    return {
      name: 'Database Connection',
      passed: true,
      message: 'Database connection successful',
    };
  } catch (error) {
    return {
      name: 'Database Connection',
      passed: false,
      message: 'Failed to connect to database',
      error,
    };
  }
}

async function testAuthConfiguration(): Promise<TestResult> {
  try {
    const session = await getCurrentSession();

    return {
      name: 'Authentication Configuration',
      passed: true,
      message: session
        ? 'Authentication configured (user logged in)'
        : 'Authentication configured (no active session)',
    };
  } catch (error: any) {
    return {
      name: 'Authentication Configuration',
      passed: false,
      message: `Authentication error: ${error.message}`,
      error,
    };
  }
}

async function testStorageConfiguration(): Promise<TestResult> {
  try {
    const { data, error } = await supabase.storage
      .from(TC_SUPA_01_TEST_DATA.storageProbe.bucket)
      .list();

    if (error) {
      return {
        name: 'Storage Configuration',
        passed: false,
        message: `Storage error: ${error.message}`,
        error,
      };
    }

    return {
      name: 'Storage Configuration',
      passed: true,
      message: `Storage configured with menu-images bucket (${data?.length ?? 0} file(s) found)`,
    };
  } catch (error) {
    return {
      name: 'Storage Configuration',
      passed: false,
      message: 'Failed to access storage',
      error,
    };
  }
}

export async function runSupabaseTests(): Promise<void> {
  console.log('\n[TEST] Supabase Configuration Tests\n');

  const tests = [
    testClientInitialization,
    testEnvironmentVariables,
    testDatabaseConnection,
    testAuthConfiguration,
    testStorageConfiguration,
  ];

  const results: TestResult[] = [];

  for (const test of tests) {
    const result = await test();
    results.push(result);

    console.log(`${result.passed ? '[PASS]' : '[FAIL]'} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.error) {
      console.error('   Error:', result.error);
    }
    console.log('');
  }

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n[SUMMARY] ${passedCount}/${totalCount} tests passed\n`);

  if (passedCount === totalCount) {
    console.log('[SUCCESS] All tests passed! Supabase is configured correctly.');
  } else {
    console.log('[WARNING] Some tests failed. Review the errors above.');
  }
  console.log('');
}

export async function quickTest(): Promise<boolean> {
  try {
    console.log('Running quick Supabase test...');

    const { error } = await supabase.auth.getSession();

    if (error) {
      console.error('Quick test failed:', error.message);
      return false;
    }

    console.log('Quick test passed! Supabase is working.');
    return true;
  } catch (error) {
    console.error('Quick test error:', error);
    return false;
  }
}

if (require.main === module) {
  runSupabaseTests().catch(error => {
    console.error('[ERROR] Failed to run Supabase configuration tests:', error);
    process.exit(1);
  });
}
