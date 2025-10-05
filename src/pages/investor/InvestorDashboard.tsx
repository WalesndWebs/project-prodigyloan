import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Investment, InvestmentProduct } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, Wallet, PieChart } from 'lucide-react'
import { Link } from 'react-router-dom'

export function InvestorDashboard() {
  const { profile } = useAuth()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [products, setProducts] = useState<InvestmentProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    let isMounted = true

    ;(async () => {
      try {
        const [investmentsRes, productsRes] = await Promise.all([
          supabase
            .from('investments')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('investment_products')
            .select('*')
            .order('expected_return', { ascending: false })
            .limit(3)
        ])

        if (!isMounted) return
        if (investmentsRes.data) setInvestments(investmentsRes.data)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const totalInvested = investments
    .filter(inv => inv.status === 'active')
    .reduce((sum, inv) => sum + inv.amount, 0)
  const activeInvestments = investments.filter(inv => inv.status === 'active').length

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Investor Dashboard</h1>
        <p className="text-muted-foreground">Track your investment portfolio</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all investments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvestments}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">8.5%</div>
            <p className="text-xs text-muted-foreground">Average annual return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Investment Opportunities</CardTitle>
          <CardDescription>High-quality investments with attractive returns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {products.map((product) => {
              const riskColor = 
                product.risk_level === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                product.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'

              return (
                <div key={product.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${riskColor}`}>
                      {product.risk_level} Risk
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected Return</span>
                      <span className="font-medium text-primary">{product.expected_return}% p.a.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min. Investment</span>
                      <span className="font-medium">${product.min_investment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{product.duration_months} months</span>
                    </div>
                  </div>
                  <Button className="w-full" size="sm" asChild>
                    <Link to="/investor/investments">Invest Now</Link>
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Investments */}
      <Card>
        <CardHeader>
          <CardTitle>Your Investments</CardTitle>
          <CardDescription>Portfolio overview</CardDescription>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No investments yet</p>
              <Button asChild>
                <Link to="/investor/investments">Start Investing</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.slice(0, 5).map((investment) => (
                <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">${investment.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(investment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="capitalize font-medium text-sm">{investment.status}</div>
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
