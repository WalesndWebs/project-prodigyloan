import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, TrendingUp, FileText } from 'lucide-react'

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLoans: 0,
    totalInvestments: 0,
    pendingApplications: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const [usersRes, loansRes, investmentsRes, pendingRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('loan_applications').select('id', { count: 'exact', head: true }),
        supabase.from('investments').select('id', { count: 'exact', head: true }),
        supabase.from('loan_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      setStats({
        totalUsers: usersRes.count || 0,
        totalLoans: loansRes.count || 0,
        totalInvestments: investmentsRes.count || 0,
        pendingApplications: pendingRes.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
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
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loan Applications</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLoans}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingApplications} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvestments}</div>
            <p className="text-xs text-muted-foreground">Active investments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">User Management</div>
                <div className="text-sm text-muted-foreground">View and manage all users</div>
              </div>
              <a href="/admin/users" className="text-primary hover:underline">View →</a>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Loan Applications</div>
                <div className="text-sm text-muted-foreground">Review and approve loan requests</div>
              </div>
              <a href="/admin/loans" className="text-primary hover:underline">View →</a>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Investment Products</div>
                <div className="text-sm text-muted-foreground">Manage investment offerings</div>
              </div>
              <a href="/admin/investments" className="text-primary hover:underline">View →</a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
