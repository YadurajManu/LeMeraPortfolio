const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'admin123';
  
  console.log('🔐 Generating new password hash for:', password);
  
  // Generate a new hash
  const newHash = await bcrypt.hash(password, 10);
  console.log('✅ Generated hash:', newHash);
  
  // Test the hash
  const isValid = await bcrypt.compare(password, newHash);
  console.log('🧪 Hash validation:', isValid);
  
  console.log('\n📋 Use this hash in Supabase:');
  console.log(newHash);
  
  console.log('\n🔑 Login credentials:');
  console.log('Username: admin');
  console.log('Password:', password);
}

testPassword().catch(console.error); 