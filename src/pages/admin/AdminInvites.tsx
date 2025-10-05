import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UserPlus, Mail, Clock, CheckCircle, XCircle, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface AdminInvite {
  id: string
  email: string
  token: string
  invited_by: string
  created_at: string
  expires_at: string
  used: boolean
  inviter?: {
    full_name: string
    email: string
  }
}

export default function AdminInvites() {
  const [invites, setInvites] = useState<AdminInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')

  useEffect(() => {
    fetchInvites()
  }, [])

  const fetchInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_invites')
        .select(`
          *,
          inviter:invited_by(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvites(data || [])
    } catch (error: any) {
      toast.error('Failed to load invites: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const generateInvite = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    try {
      // Generate secure token
      const token = crypto.randomUUID() + '-' + Date.now()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create invite
      const { error } = await supabase
        .from('admin_invites')
        .insert({
          email: email.trim().toLowerCase(),
          token,
          invited_by: user.id
        })

      if (error) throw error

      // Generate invite link
      const inviteUrl = `${window.location.origin}/signup?invite=${token}`
      setGeneratedLink(inviteUrl)
      
      toast.success('Admin invite created successfully!')
      setEmail('')
      fetchInvites()
    } catch (error: any) {
      toast.error('Failed to create invite: ' + error.message)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const revokeInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('admin_invites')
        .delete()
        .eq('id', inviteId)

      if (error) throw error
      
      toast.success('Invite revoked')
      fetchInvites()
    } catch (error: any) {
      toast.error('Failed to revoke invite: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Invites</h1>
          <p className="text-muted-foreground mt-2">Securely invite new administrators</p>
        </div>
      </div>

      {/* Create Invite Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New Admin Invite
          </CardTitle>
          <CardDescription>
            Generate a secure invite link to onboard new administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generateInvite()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generateInvite}>
                <Mail className="h-4 w-4 mr-2" />
                Generate Invite
              </Button>
            </div>
          </div>

          {generatedLink && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm font-medium mb-2 text-green-900 dark:text-green-100">
                Invite link generated! Share this with the new admin:
              </p>
              <div className="flex gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(generatedLink)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This link expires in 7 days and can only be used once.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invites List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending & Recent Invites</CardTitle>
          <CardDescription>
            {invites.length} total invites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invites created yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => {
                  const isExpired = new Date(invite.expires_at) < new Date()
                  const status = invite.used
                    ? 'used'
                    : isExpired
                    ? 'expired'
                    : 'pending'

                  return (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">{invite.email}</TableCell>
                      <TableCell>
                        {status === 'used' && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Used
                          </Badge>
                        )}
                        {status === 'expired' && (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        )}
                        {status === 'pending' && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{invite.inviter?.full_name || 'Unknown'}</div>
                          <div className="text-muted-foreground text-xs">
                            {invite.inviter?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(invite.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(invite.expires_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(
                                `${window.location.origin}/signup?invite=${invite.token}`
                              )}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Link
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => revokeInvite(invite.id)}
                            >
                              Revoke
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-8 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>• Invite links expire after 7 days for security</p>
          <p>• Each link can only be used once</p>
          <p>• Verify the email address before sending the invite</p>
          <p>• Revoke invites immediately if sent to wrong address</p>
          <p>• All admin actions are logged for audit purposes</p>
        </CardContent>
      </Card>
    </div>
  )
}
