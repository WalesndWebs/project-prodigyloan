import { useEffect, useState } from 'react'
import { supabase, UserProfile } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, UserCog, UserPlus, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showPromoteDialog, setShowPromoteDialog] = useState(false)
  const [promoteEmail, setPromoteEmail] = useState('')
  const [promoteLoading, setPromoteLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function promoteToAdmin(userId: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId)

      if (error) throw error

      toast.success('User promoted to admin successfully')
      setShowPromoteDialog(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error: any) {
      toast.error('Failed to promote user: ' + error.message)
    }
  }

  async function demoteFromAdmin(userId: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'borrower' })
        .eq('id', userId)

      if (error) throw error

      toast.success('Admin privileges revoked successfully')
      fetchUsers()
    } catch (error: any) {
      toast.error('Failed to demote user: ' + error.message)
    }
  }

  async function promoteByEmail() {
    const email = promoteEmail.trim().toLowerCase()
    if (!email) {
      toast.error('Please enter an email to promote')
      return
    }
    setPromoteLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, role, email')
        .eq('email', email)
        .maybeSingle()

      if (error) throw error

      if (!data?.id) {
        toast.error('No user found with that email')
        return
      }

      if (data.role === 'admin') {
        toast.success('This user is already an admin')
        return
      }

      await promoteToAdmin(data.id)
      setPromoteEmail('')
    } catch (err: any) {
      toast.error('Unable to promote: ' + (err?.message || 'Unknown error'))
    } finally {
      setPromoteLoading(false)
    }
  }

  async function createNewAdmin() {
    const { email, password, fullName, phone } = newAdminForm
    
    if (!email || !password) {
      toast.error('Email and password are required')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setCreateLoading(true)
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          data: {
            full_name: fullName || null,
            phone: phone || null
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user account')

      // Update user role to admin in the users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          role: 'admin',
          full_name: fullName || null,
          phone: phone || null
        })
        .eq('id', authData.user.id)

      if (updateError) throw updateError

      toast.success(`Admin account created successfully for ${email}`)
      setShowCreateDialog(false)
      setNewAdminForm({ email: '', password: '', fullName: '', phone: '' })
      fetchUsers()
    } catch (error: any) {
      console.error('Create admin error:', error)
      toast.error('Failed to create admin: ' + (error.message || 'Unknown error'))
    } finally {
      setCreateLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">View and manage all platform users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Admin
          </CardTitle>
          <CardDescription>
            Create a new admin account or promote an existing user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Create new admin account */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Create new admin</p>
              <div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Create Admin Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Admin Account</DialogTitle>
                      <DialogDescription>
                        Create a new administrator account with full access rights
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="new-email">Email *</Label>
                        <Input
                          id="new-email"
                          type="email"
                          placeholder="admin@example.com"
                          value={newAdminForm.email}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-password">Password *</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Minimum 6 characters"
                          value={newAdminForm.password}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-fullname">Full Name</Label>
                        <Input
                          id="new-fullname"
                          type="text"
                          placeholder="John Doe"
                          value={newAdminForm.fullName}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, fullName: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-phone">Phone</Label>
                        <Input
                          id="new-phone"
                          type="tel"
                          placeholder="+1234567890"
                          value={newAdminForm.phone}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createNewAdmin} disabled={createLoading}>
                        {createLoading ? 'Creating...' : 'Create Admin'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-xs text-muted-foreground">Account with login credentials</p>
            </div>

            {/* Promote existing user by email */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Promote existing account</p>
              <div className="flex gap-2">
                <Input
                  placeholder="user@example.com"
                  type="email"
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && promoteByEmail()}
                />
                <Button onClick={promoteByEmail} disabled={promoteLoading}>
                  {promoteLoading ? 'Promoting…' : 'Promote'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Update role for existing user</p>
            </div>

            {/* Invite new admin */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Invite via link</p>
              <div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/admin/invites">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Go to Admin Invites
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Generate invite with expiry</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Total: {users.length} users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.full_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {user.role !== 'admin' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setShowPromoteDialog(true)
                        }}
                      >
                        <Shield className="h-3 w-3 mr-2" />
                        Promote to Admin
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => demoteFromAdmin(user.id)}
                      >
                        <UserCog className="h-3 w-3 mr-2" />
                        Revoke Admin
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promote User to Administrator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to grant admin privileges to{' '}
              <span className="font-semibold">{selectedUser?.email}</span>?
              <br /><br />
              Admin users will have access to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All user data and management</li>
                <li>Loan approval and rejection</li>
                <li>Financial reports and analytics</li>
                <li>System configuration</li>
              </ul>
              <br />
              This action can be reversed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && promoteToAdmin(selectedUser.id)}
              className="bg-primary"
            >
              Yes, Promote to Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
