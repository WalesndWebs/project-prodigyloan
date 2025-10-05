import { useEffect, useState } from 'react'
import { supabase, LoanApplication } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export function AdminLoans() {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching applications:', err)
      setError(err?.message || 'Failed to load applications')
      toast.error(err?.message || 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('loan_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      toast.success(`Application ${status}`)
      fetchApplications()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const pending = applications.filter(app => app.status === 'pending')

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Loan Applications</h1>
        <p className="text-muted-foreground">Review and manage loan requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            Total: {applications.length} applications ({pending.length} pending)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {applications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No loan applications found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => {
                  const amountNumber = Number((app as any).amount ?? 0)
                  const amountDisplay = isNaN(amountNumber)
                    ? '-'
                    : amountNumber.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  const purpose = (app as any).purpose || '-'
                  const createdAt = (app as any).created_at
                    ? new Date((app as any).created_at).toLocaleDateString()
                    : '-'

                  return (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">${amountDisplay}</TableCell>
                      <TableCell className="max-w-xs truncate">{purpose}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            app.status === 'approved' || app.status === 'disbursed' ? 'default' :
                            app.status === 'pending' ? 'secondary' :
                            'destructive'
                          }
                          className="capitalize"
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{createdAt}</TableCell>
                      <TableCell>
                        {app.status === 'pending' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => updateStatus(app.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(app.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
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
    </div>
  )
}
