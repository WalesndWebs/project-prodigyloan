import { supabase } from '../lib/supabase'

export interface AdminCredentials {
  email: string
  password: string
  userId: string
}

/**
 * Creates an admin user programmatically
 * Note: This requires service role key access
 */
export async function createFirstAdmin(): Promise<AdminCredentials> {
  const adminEmail = 'admin@loanapp.com'
  const adminPassword = 'Admin#2025!'
  
  try {
    // First, sign up the user normally
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          full_name: 'System Administrator',
        }
      }
    })
    
    if (signupError) throw signupError
    
    if (!signupData.user) {
      throw new Error('User creation failed')
    }
    
    // Update the user's role to admin
    // Note: This requires RLS policies to allow or service role
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        role: 'admin',
        full_name: 'System Administrator'
      })
      .eq('id', signupData.user.id)
    
    if (updateError) {
      console.error('Role update error:', updateError)
      // Continue anyway - user can manually update in DB
    }
    
    return {
      email: adminEmail,
      password: adminPassword,
      userId: signupData.user.id
    }
  } catch (error) {
    console.error('Failed to create admin:', error)
    throw error
  }
}

/**
 * Alternative: Use service role to directly insert admin
 */
export async function createAdminWithServiceRole(): Promise<AdminCredentials> {
  const adminEmail = 'admin@loanapp.com'
  const adminPassword = 'Admin#2025!'
  
  // This would require using the service role key
  // which is not available in the frontend
  console.warn('Service role method not available in frontend')
  
  return {
    email: adminEmail,
    password: adminPassword,
    userId: 'pending'
  }
}
