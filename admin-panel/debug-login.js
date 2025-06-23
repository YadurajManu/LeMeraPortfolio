const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://vnmjbcqrpohlpthfewzz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 DEBUG: Login Flow Test');
console.log('========================');

async function debugLogin() {
  try {
    // 1. Check environment variables
    console.log('1️⃣ Environment Variables:');
    console.log('   SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
    console.log('   SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing');
    
    if (!supabaseServiceKey) {
      console.log('❌ Cannot proceed without SUPABASE_SERVICE_ROLE_KEY');
      return;
    }

    // 2. Test database connection
    console.log('\n2️⃣ Testing Database Connection:');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: connectionTest, error: connectionError } = await supabase
      .from('admin_users')
      .select('count(*)', { count: 'exact' });

    if (connectionError) {
      console.log('❌ Database connection failed:', connectionError.message);
      return;
    }
    
    console.log('✅ Database connection successful');

    // 3. Check admin users table
    console.log('\n3️⃣ Checking admin_users table:');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*');

    if (adminError) {
      console.log('❌ Error fetching admin users:', adminError.message);
      return;
    }

    console.log(`📊 Found ${adminUsers.length} admin users:`);
    adminUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. Username: ${user.username}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Active: ${user.is_active}`);
      console.log(`      Created: ${user.created_at}`);
    });

    // 4. Test login with existing user
    if (adminUsers.length > 0) {
      const testUser = adminUsers.find(u => u.username === 'admin');
      if (testUser) {
        console.log('\n4️⃣ Testing Login Logic:');
        console.log('   Testing username: admin');
        console.log('   Testing password: admin123');
        
        const isPasswordValid = await bcrypt.compare('admin123', testUser.password_hash);
        console.log('   Password validation:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
        
        if (!isPasswordValid) {
          console.log('   Current hash:', testUser.password_hash);
          console.log('   Expected for admin123:', await bcrypt.hash('admin123', 10));
        }
      } else {
        console.log('\n4️⃣ No admin user found with username "admin"');
      }
    }

    // 5. Create/recreate admin user
    console.log('\n5️⃣ Creating Fresh Admin User:');
    
    // Delete existing admin
    await supabase.from('admin_users').delete().eq('username', 'admin');
    
    // Create new admin
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data: newAdmin, error: createError } = await supabase
      .from('admin_users')
      .insert([
        {
          username: 'admin',
          email: 'admin@yaduraj.me',
          password_hash: hashedPassword,
          is_active: true
        }
      ])
      .select()
      .single();

    if (createError) {
      console.log('❌ Error creating admin:', createError.message);
    } else {
      console.log('✅ Fresh admin user created successfully!');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Hash:', hashedPassword);
      
      // Test the new hash immediately
      const testNewHash = await bcrypt.compare('admin123', hashedPassword);
      console.log('   Hash test:', testNewHash ? '✅ Valid' : '❌ Invalid');
    }

  } catch (error) {
    console.log('❌ Debug script error:', error.message);
    console.log('Full error:', error);
  }
}

debugLogin(); 