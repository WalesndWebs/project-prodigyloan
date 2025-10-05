import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wittyftnqarnvowbonuq.supabase.co'
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpdHR5ZnRucWFybnZvd2JvbnVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUyMjU4NCwiZXhwIjoyMDc1MDk4NTg0fQ.vqMOe-ZMKWtiaPExk3LAmMXoE0llCcRsgG5Gb8cS5aA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  const adminEmail = 'admin@loanapp.com'
  const adminPassword = 'Admin#2025!'
  
  console.log('Creating admin user...')
  
  try {
    // Create user with Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'System Administrator',
        role: 'admin'
      }
    })
    
    if (authError) {
      console.error('Auth error:', authError)
      throw authError
    }
    
    console.log('✓ User created in Auth:', authData.user.id)
    
    // Update user role in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        role: 'admin',
        full_name: 'System Administrator'
      })
      .eq('id', authData.user.id)
    
    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }
    
    console.log('✓ User role updated to admin')
    
    console.log('\n=== ADMIN CREDENTIALS ===')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    console.log('User ID:', authData.user.id)
    console.log('========================\n')
    
    return {
      email: adminEmail,
      password: adminPassword,
      userId: authData.user.id
    }
  } catch (error) {
    console.error('Failed to create admin:', error)
    throw error
  }
}

createAdminUser()
  .then(() => {
    console.log('Admin user created successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed:', error)
    process.exit(1)
  })
