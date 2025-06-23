const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const { generateToken, setAuthCookie, clearAuthCookie, requireAuth } = require('./simple-auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'admin-panel-secret-change-this',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to false for now to debug
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Note: requireAuth is now imported from simple-auth.js

// Routes

// Login page
app.get('/login', (req, res) => {
  // Check if already logged in
  const token = req.cookies.admin_token;
  if (token) {
    const { verifyToken } = require('./simple-auth');
    const decoded = verifyToken(token);
    if (decoded) {
      return res.redirect('/dashboard');
    }
  }
  res.render('login', { error: null });
});

// Login POST
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🔍 Login attempt:', { username, passwordLength: password?.length });
    
    // Get admin user from database
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    console.log('🔍 Database query result:', { 
      found: !!admin, 
      error: error?.message,
      adminUser: admin ? { id: admin.id, username: admin.username, email: admin.email } : null
    });

    if (error || !admin) {
      console.log('❌ Admin user not found or database error');
      return res.render('login', { error: 'Invalid credentials' });
    }

    // Check password
    console.log('🔍 Testing password against hash');
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    console.log('🔍 Password validation result:', validPassword);
    
    if (!validPassword) {
      console.log('❌ Password validation failed');
      console.log('🔍 Hash in DB:', admin.password_hash);
      console.log('🔍 Password provided:', password);
      return res.render('login', { error: 'Invalid credentials' });
    }

    console.log('✅ Login successful for user:', username);

    // Generate JWT token
    const token = generateToken(admin);
    setAuthCookie(res, token);
    
    console.log('🔍 Auth token set for user:', username);

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    console.log('🔍 Redirecting to dashboard...');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('❌ Login error:', error);
    res.render('login', { error: 'Login failed. Please try again.' });
  }
});

// Logout
app.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.redirect('/login');
});

// Dashboard
app.get('/dashboard', requireAuth, async (req, res) => {
  console.log('🔍 Dashboard route accessed');
  console.log('🔍 Admin data:', { adminId: req.admin.adminId, username: req.admin.username });
  try {
    // Get submissions statistics
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.render('dashboard', { 
        submissions: [], 
        stats: {}, 
        error: 'Failed to load data' 
      });
    }

    // Calculate statistics
    const stats = {
      total: submissions.length,
      thisMonth: submissions.filter(s => {
        const date = new Date(s.created_at);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length,
      responded: submissions.filter(s => s.status === 'responded').length,
      pending: submissions.filter(s => s.status === 'new').length
    };

    res.render('dashboard', { 
      submissions: submissions.slice(0, 10), // Show latest 10
      stats,
      error: null,
      username: req.admin.username
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('dashboard', { 
      submissions: [], 
      stats: {}, 
      error: 'Failed to load dashboard',
      username: req.admin.username
    });
  }
});

// Submissions list
app.get('/submissions', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || 'all';
    const search = req.query.search || '';

    let query = supabase
      .from('submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    }

    const { data: submissions, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.render('submissions', { 
        submissions: [], 
        pagination: {},
        filters: { status, search },
        error: 'Failed to load submissions' 
      });
    }

    const totalPages = Math.ceil(count / limit);

    res.render('submissions', { 
      submissions,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: { status, search },
      error: null,
      username: req.admin.username
    });
  } catch (error) {
    console.error('Submissions error:', error);
    res.render('submissions', { 
      submissions: [], 
      pagination: {},
      filters: { status: 'all', search: '' },
      error: 'Failed to load submissions',
      username: req.admin.username
    });
  }
});

// View individual submission
app.get('/submission/:id', requireAuth, async (req, res) => {
  try {
    const { data: submission, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !submission) {
      return res.redirect('/submissions?error=Submission not found');
    }

    res.render('submission-detail', { 
      submission,
      error: null,
      username: req.admin.username
    });
  } catch (error) {
    console.error('Submission detail error:', error);
    res.redirect('/submissions?error=Failed to load submission');
  }
});

// Update submission status
app.post('/submission/:id/status', requireAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const updateData = { status };
    if (status === 'responded') {
      updateData.responded_at = new Date().toISOString();
    }
    if (notes) {
      updateData.admin_notes = notes;
    }

    const { error } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', req.params.id);

    if (error) {
      return res.redirect(`/submission/${req.params.id}?error=Failed to update status`);
    }

    res.redirect(`/submission/${req.params.id}?success=Status updated`);
  } catch (error) {
    console.error('Status update error:', error);
    res.redirect(`/submission/${req.params.id}?error=Failed to update status`);
  }
});

// Analytics API endpoint
app.get('/api/analytics', requireAuth, async (req, res) => {
  try {
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('created_at, project_type, budget, status');

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch analytics data' });
    }

    // Process data for charts
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailySubmissions = last30Days.map(date => {
      const count = submissions.filter(s => 
        s.created_at.split('T')[0] === date
      ).length;
      return { date, count };
    });

    const projectTypes = submissions.reduce((acc, s) => {
      acc[s.project_type] = (acc[s.project_type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      dailySubmissions,
      projectTypes,
      totalSubmissions: submissions.length
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Root redirect
app.get('/', (req, res) => {
  // Check if already logged in
  const token = req.cookies.admin_token;
  if (token) {
    const { verifyToken } = require('./simple-auth');
    const decoded = verifyToken(token);
    if (decoded) {
      return res.redirect('/dashboard');
    }
  }
  res.redirect('/login');
});

// Debug endpoint to check database and admin user
app.get('/debug', async (req, res) => {
  try {
    // Test database connection
    const { data: testConnection, error: connectionError } = await supabase
      .from('admin_users')
      .select('count(*)', { count: 'exact' });

    if (connectionError) {
      return res.json({
        status: 'error',
        message: 'Database connection failed',
        error: connectionError.message
      });
    }

    // Check if admin users exist
    const { data: admins, error: adminError } = await supabase
      .from('admin_users')
      .select('id, username, email, created_at, is_active')
      .order('created_at', { ascending: false });

    if (adminError) {
      return res.json({
        status: 'error',
        message: 'Failed to fetch admin users',
        error: adminError.message
      });
    }

    res.json({
      status: 'success',
      database_connected: true,
      admin_users_count: admins.length,
      admin_users: admins,
      environment: {
        has_supabase_url: !!process.env.SUPABASE_URL,
        has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        has_session_secret: !!process.env.SESSION_SECRET,
        node_env: process.env.NODE_ENV
      }
    });
  } catch (error) {
    res.json({
      status: 'error',
      message: 'Debug check failed',
      error: error.message
    });
  }
});

// Create default admin user on startup
const createDefaultAdmin = async () => {
  try {
    const { data: admins, error } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error checking admin users:', error);
      return;
    }

    if (!admins || admins.length === 0) {
      const defaultPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert([
          {
            username: 'admin',
            email: 'admin@yaduraj.me',
            password_hash: hashedPassword
          }
        ]);

      if (insertError) {
        console.error('Error creating default admin:', insertError);
      } else {
        console.log('✅ Default admin created');
        console.log('📧 Username: admin');
        console.log('🔑 Password: admin123');
        console.log('⚠️  Change password after first login!');
      }
    }
  } catch (error) {
    console.error('Error in createDefaultAdmin:', error);
  }
};

// Start server
app.listen(PORT, () => {
  console.log('🚀 Admin Panel Server Started');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 Admin panel: http://localhost:${PORT}`);
  console.log(`🔐 Login: /login`);
  
  // Create default admin
  createDefaultAdmin();
});

module.exports = app; 