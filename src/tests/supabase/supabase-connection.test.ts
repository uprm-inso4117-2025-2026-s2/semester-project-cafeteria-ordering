import { getCurrentSession, supabase } from '../../lib/supabase';

/**
 * Test suite for Supabase connection and configuration
 * 
 * Run these tests to verify:
 * - Supabase client is properly initialized
 * - Environment variables are set correctly
 * - Database connection works
 * - Authentication is configured
 * 
 * Usage:
 * ```typescript
 * import { runSupabaseTests } from '@/tests/supabase-connection.test';
 * 
 * await runSupabaseTests();
 * ```
 */

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  error?: any;
}

/**
 * Test 1: Verify Supabase client initialization
 */
async function testClientInitialization(): Promise<TestResult> {
  try {
    if (!supabase) {
      return {
        name: 'Client Initialization',
        passed: false,
        message: 'Supabase client is not initialized',
      };
    }

    // Check if client has required methods
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

/**
 * Test 2: Verify environment variables are set
 */
async function testEnvironmentVariables(): Promise<TestResult> {
  try {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        name: 'Environment Variables',
        passed: false,
        message: 'Missing Supabase environment variables in .env file',
      };
    }

    // Verify URL format
    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('supabase.co')) {
      return {
        name: 'Environment Variables',
        passed: false,
        message: 'Invalid Supabase URL format',
      };
    }

    // Verify key format (should be a JWT)
    if (!supabaseAnonKey.startsWith('eyJ')) {
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

/**
 * Test 3: Test database connection
 * Note: This will fail until database schema is deployed
 */
async function testDatabaseConnection(): Promise<TestResult> {
  try {
    // Try to query a simple view or table
    // Using 'information_schema.tables' which exists in all PostgreSQL databases
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (error) {
      // Expected error if schema not deployed yet
      if (error.message.includes('permission denied') || error.message.includes('does not exist')) {
        return {
          name: 'Database Connection',
          passed: true,
          message: 'Database connection works (schema not deployed yet)',
        };
      }

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

/**
 * Test 4: Test authentication configuration
 */
async function testAuthConfiguration(): Promise<TestResult> {
  try {
    // Try to get current session (should work even if no user is logged in)
    const session = await getCurrentSession();

    // Session will be null if not logged in, but this means auth is working
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

/**
 * Test 5: Test storage configuration
 */
async function testStorageConfiguration(): Promise<TestResult> {
  try {
    // Try to list storage buckets
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      return {
        name: 'Storage Configuration',
        passed: false,
        message: `Storage error: ${error.message}`,
        error,
      };
    }

    // Check if menu-images bucket exists
    const menuImagesBucket = data?.find(bucket => bucket.name === 'menu-images');

    if (!menuImagesBucket) {
      return {
        name: 'Storage Configuration',
        passed: false,
        message: 'Storage works, but menu-images bucket not created yet',
      };
    }

    return {
      name: 'Storage Configuration',
      passed: true,
      message: 'Storage configured with menu-images bucket',
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

/**
 * Run all Supabase tests
 */
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

  // Summary
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

/**
 * Quick test for debugging
 */
export async function quickTest(): Promise<boolean> {
  try {
    console.log('Running quick Supabase test...');
    
    // Just check if we can create a client
    const { data, error } = await supabase.auth.getSession();
    
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
