import { createClient } from '@supabase/supabase-js'

// Prefer environment variables; fallback to known project values for convenience in this seed script
const supabaseUrl = process.env.SUPABASE_URL || 'https://wittyftnqarnvowbonuq.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpdHR5ZnRucWFybnZvd2JvbnVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUyMjU4NCwiZXhwIjoyMDc1MDk4NTg0fQ.vqMOe-ZMKWtiaPExk3LAmMXoE0llCcRsgG5Gb8cS5aA'

const supabase = createClient(supabaseUrl, serviceRoleKey)

const DEFAULT_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin#2025!'

type TestAccount = {
  email: string
  fullName: string
  page: string
}

const accounts: TestAccount[] = [
  { email: 'admin.dashboard@loanapp.com', fullName: 'Admin - Dashboard', page: '/admin' },
  { email: 'admin.users@loanapp.com', fullName: 'Admin - Users', page: '/admin/users' },
  { email: 'admin.loans@loanapp.com', fullName: 'Admin - Loans', page: '/admin/loans' },
  { email: 'admin.business@loanapp.com', fullName: 'Admin - Business', page: '/admin/business' },
  { email: 'admin.cs@loanapp.com', fullName: 'Admin - Customer Service', page: '/admin/customer-service' },
  { email: 'admin.risk@loanapp.com', fullName: 'Admin - Risk Management', page: '/admin/risk-management' },
  { email: 'admin.compliance@loanapp.com', fullName: 'Admin - Compliance', page: '/admin/compliance' },
  { email: 'admin.tech@loanapp.com', fullName: 'Admin - Technical Support', page: '/admin/technical-support' },
  { email: 'admin.invites@loanapp.com', fullName: 'Admin - Invites', page: '/admin/invites' },
]

async function findUserIdByEmail(email: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (error) throw error
    const user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    return user?.id || null
  } catch (err) {
    console.error('Error listing users:', err)
    return null
  }
}

async function ensureAdminUser(acc: TestAccount) {
  console.log(`\n→ Ensuring admin user: ${acc.email}`)
  // Try create user first
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: acc.email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: acc.fullName, role: 'admin' },
  })

  let userId = created?.user?.id || null

  if (createErr) {
    const msg = String(createErr.message || '').toLowerCase()
    if (msg.includes('already') || msg.includes('exists')) {
      console.log('• User already exists, fetching id...')
      userId = await findUserIdByEmail(acc.email)
    } else {
      console.error('× Failed to create user:', createErr)
      throw createErr
    }
  } else {
    console.log(`• Created auth user: ${userId}`)
  }

  if (!userId) throw new Error(`Could not resolve user id for ${acc.email}`)

  // Upsert profile in users table with admin role
  const { error: upsertErr } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: acc.email,
      role: 'admin',
      full_name: acc.fullName,
      is_borrower: false,
      is_investor: false,
    })

  if (upsertErr) {
    console.error('× Failed to upsert into users table:', upsertErr)
    throw upsertErr
  }

  console.log(`✓ Ready: ${acc.email} (${acc.fullName}) → ${acc.page}`)
  return { email: acc.email, password: DEFAULT_PASSWORD, page: acc.page }
}

async function main() {
  console.log('Seeding admin test accounts...')
  const results = [] as Array<{ email: string; password: string; page: string }>

  for (const acc of accounts) {
    const res = await ensureAdminUser(acc)
    results.push(res)
  }

  console.log('\n=== Admin Test Accounts Seeded ===')
  results.forEach(r => {
    console.log(`${r.email}\t${r.password}\t${r.page}`)
  })
  console.log('=================================\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
