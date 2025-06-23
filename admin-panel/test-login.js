const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://vnmjbcqrpohlpthfewzz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubWpiY3FycG9obHB0aGZld3p6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4MTQ0MCwiZXhwIjoyMDY2MjU3NDQwfQ.OmQ2_bTfs7dVPS2mCoYtponpVmJpBm4ntrd6kLshD1w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testExactLogin() {
  console.log('🔍 Testing Exact Login Credentials');
  console.log('==================================');
  
  // Get the admin user from database
  const { data: admin, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username', 'admin')
    .eq('is_active', true)
    .single();

  if (error || !admin) {
    console.log('❌ Admin user not found:', error?.message);
    return;
  }

  console.log('✅ Found admin user:');
  console.log('   Username:', admin.username);
  console.log('   Email:', admin.email);
  console.log('   Active:', admin.is_active);
  console.log('   Hash in DB:', admin.password_hash);

  // Test different password combinations
  const passwordsToTest = ['admin123', 'admin', 'password', 'Admin123'];
  
  console.log('\n🧪 Testing passwords:');
  for (const testPassword of passwordsToTest) {
    const isValid = await bcrypt.compare(testPassword, admin.password_hash);
    console.log(`   "${testPassword}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
    
    if (isValid) {
      console.log(`\n🎉 WORKING LOGIN CREDENTIALS:`);
      console.log(`   Username: admin`);
      console.log(`   Password: ${testPassword}`);
      return;
    }
  }
  
  console.log('\n❌ None of the common passwords worked.');
  console.log('🔧 Creating new admin with admin123...');
  
  // Create fresh admin user
  await supabase.from('admin_users').delete().eq('username', 'admin');
  
  const newHash = await bcrypt.hash('admin123', 10);
  const { data: newAdmin, error: createError } = await supabase
    .from('admin_users')
    .insert([{
      username: 'admin',
      email: 'admin@yaduraj.me',
      password_hash: newHash,
      is_active: true
    }])
    .select()
    .single();

  if (createError) {
    console.log('❌ Error creating admin:', createError.message);
  } else {
    console.log('✅ Fresh admin created!');
    console.log('   Username: admin');
    console.log('   Password: admin123');
  }
}

testExactLogin(); 