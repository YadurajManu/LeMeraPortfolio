const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://vnmjbcqrpohlpthfewzz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log('🔍 Checking existing admin users...');
    
    // Check if admin users exist
    const { data: existingAdmins, error: checkError } = await supabase
      .from('admin_users')
      .select('*');

    if (checkError) {
      console.error('❌ Error checking admin users:', checkError.message);
      return;
    }

    console.log(`📊 Found ${existingAdmins.length} existing admin users`);

    // Delete existing admin with username 'admin'
    const { error: deleteError } = await supabase
      .from('admin_users')
      .delete()
      .eq('username', 'admin');

    if (deleteError) {
      console.error('⚠️ Error deleting existing admin:', deleteError.message);
    } else {
      console.log('🗑️ Deleted existing admin user');
    }

    // Create new admin user
    const username = 'admin';
    const password = 'admin123';
    const email = 'admin@yaduraj.me';

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('👤 Creating new admin user...');
    const { data: newAdmin, error: createError } = await supabase
      .from('admin_users')
      .insert([
        {
          username: username,
          email: email,
          password_hash: hashedPassword,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating admin user:', createError.message);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('📋 Login Credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Email: ${email}`);
    console.log('🔗 Login at: https://admin.yaduraj.me/login');
    console.log('⚠️ Please change the password after first login!');

  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

// Run the script
createAdminUser(); 