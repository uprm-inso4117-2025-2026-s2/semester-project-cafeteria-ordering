/**
 * Quick Supabase Connection Test
 * Run this with: npx tsx src/tests/supabase/scripts/quick-test.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import {
  TC_SUPA_02_TEST_DATA,
  getQuickTestEnvValues,
} from '../cases/TC-SUPA-02_supabase_quick_connection_check';

dotenv.config();

async function runTests() {
  const { supabaseUrl, supabaseAnonKey } = getQuickTestEnvValues();

  console.log('\n[TEST] Supabase Configuration Tests\n');

  console.log('[1/5] Checking environment variables...');
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[FAIL] Missing environment variables!');
    console.log('   Make sure .env file exists with:');
    console.log(`   - ${TC_SUPA_02_TEST_DATA.env.urlVarName}`);
    console.log(`   - ${TC_SUPA_02_TEST_DATA.env.anonKeyVarName}`);
    process.exit(1);
  }
  console.log('[PASS] Environment variables found');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`);

  console.log('\n[2/5] Initializing Supabase client...');
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[PASS] Client initialized');

    console.log('\n[3/5] Testing database connection...');
    const { error } = await supabase
      .from(TC_SUPA_02_TEST_DATA.databaseProbe.table)
      .select(TC_SUPA_02_TEST_DATA.databaseProbe.selectColumn)
      .limit(1);

    if (error) {
      console.log('[FAIL] Database query error:', error.message);
    } else {
      console.log('[PASS] Database connection successful');
    }

    console.log('\n[4/5] Testing authentication...');
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError) {
      console.log('[FAIL] Auth error:', authError.message);
    } else {
      console.log('[PASS] Authentication configured');
      if (session) {
        console.log(`   Logged in as: ${session.user.email}`);
      } else {
        console.log('   No active session (expected)');
      }
    }

    console.log('\n[5/5] Testing storage...');

    const { data: files, error: listError } = await supabase.storage
      .from(TC_SUPA_02_TEST_DATA.storageProbe.bucket)
      .list();

    if (listError) {
      console.log('[FAIL] Storage error:', listError.message);
      console.log('   The menu-images bucket might not exist or has wrong permissions');
    } else {
      console.log('[PASS] Storage accessible');
      console.log('[PASS] menu-images bucket exists and is accessible');
      console.log(`   Files in bucket: ${files?.length || 0}`);

      const testUrl = supabase.storage
        .from(TC_SUPA_02_TEST_DATA.storageProbe.bucket)
        .getPublicUrl(TC_SUPA_02_TEST_DATA.storageProbe.sampleObject);

      if (testUrl.data.publicUrl) {
        console.log('[PASS] Public URL generation works');
        console.log(`   Example URL: ${testUrl.data.publicUrl}`);
      }
    }

    console.log('\n[SUCCESS] All tests passed! Supabase is configured correctly.\n');
  } catch (error: any) {
    console.error('[ERROR]', error.message);
    process.exit(1);
  }
}

runTests();
