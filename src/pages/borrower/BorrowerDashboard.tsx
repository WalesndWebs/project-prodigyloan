import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, LoanApplication, LoanProduct } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, FileText, Clock, CheckCircle, XCircle, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export function BorrowerDashboard() {
  const { profile } = useAuth()
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [products, setProducts] = useState<LoanProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    let isMounted = true

    ;(async () => {
      try {
        const [appsRes, productsRes] = await Promise.all([
          supabase
            .from('loan_applications')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('loan_products')
            .select('*')
            .order('interest_rate', { ascending: true })
            .limit(3)
        ])

        if (!isMounted) return
        if (appsRes.data) setApplications(appsRes.data)
        if (productsRes.data) setProducts(productsRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [profile?.id])

  function getStatusIcon(status: string) {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'approved':
      case 'disbursed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const activeLoans = applications.filter(app => app.status === 'approved' || app.status === 'disbursed')
  const pendingApps = applications.filter(app => app.status === 'pending')

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Borrower Dashboard</h1>
          <p className="text-muted-foreground">Manage your loans and applications</p>
        </div>
        <Link to="/borrower/apply">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Apply for Loan
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApps.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Loan Products */}
      <Card>
        <CardHeader>
          <CardTitle>Available Loan Products</CardTitle>
          <CardDescription>Choose the best option for your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">
                      ${product.min_amount.toLocaleString()} - ${product.max_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span className="font-medium text-primary">{product.interest_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Term</span>
                    <span className="font-medium">{product.term_months} months</span>
                  </div>
                </div>
                <Button className="w-full" size="sm" asChild>
                  <Link to="/borrower/apply">Apply Now</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Track your loan application status</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No applications yet</p>
              <Button asChild>
                <Link to="/borrower/apply">Apply for a Loan</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(app.status)}
                    <div>
                      <div className="font-medium">${app.amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{app.purpose}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="capitalize font-medium text-sm">{app.status}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
