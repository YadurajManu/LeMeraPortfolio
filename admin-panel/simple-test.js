// Simple test to check what's happening with login
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Use the actual Supabase URL
const supabaseUrl = 'https://vnmjbcqrpohlpthfewzz.supabase.co';

// You need to get your actual service role key from Supabase dashboard
// Go to: Project Settings -> API -> service_role key
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubWpiY3FycG9obHB0aGZld3p6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4MTQ0MCwiZXhwIjoyMDY2MjU3NDQwfQ.OmQ2_bTfs7dVPS2mCoYtponpVmJpBm4ntrd6kLshD1w';

console.log('🧪 Simple Login Test');
console.log('===================');

async function testLogin() {
  // Test with the actual service key
  console.log('1. Testing with actual service key...');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);
      
    console.log('Data:', data);
    console.log('Error:', error);
  } catch (err) {
    console.log('Connection error:', err.message);
  }
  
  // Test password hashing
  console.log('\n2. Testing password hashing...');
  const testPassword = 'admin123';
  const hash = await bcrypt.hash(testPassword, 10);
  console.log('Generated hash:', hash);
  
  const isValid = await bcrypt.compare(testPassword, hash);
  console.log('Hash validation:', isValid);
}

console.log('📋 To get your service role key:');
console.log('1. Go to: https://supabase.com/dashboard');
console.log('2. Select your project: vnmjbcqrpohlpthfewzz');
console.log('3. Go to Settings -> API');
console.log('4. Copy the "service_role" key (starts with eyJ...)');
console.log('5. Replace YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE in this file');

testLogin(); 