import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react'

interface BusinessMetric {
  id: string
  metric_name: string
  value: number
  change_percentage: number
  period: string
  created_at: string
}

export function BusinessDepartment() {
  const [metrics, setMetrics] = useState<BusinessMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [overviewStats, setOverviewStats] = useState({
    totalRevenue: 0,
    activeLoans: 0,
    activeInvestments: 0,
    monthlyGrowth: 0
  })

  useEffect(() => {
    fetchBusinessMetrics()
    fetchOverviewStats()
  }, [])

  async function fetchBusinessMetrics() {
    try {
      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setMetrics(data || [])
    } catch (error) {
      console.error('Error fetching business metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchOverviewStats() {
    try {
      const [loansRes, investmentsRes] = await Promise.all([
        supabase.from('loan_applications').select('amount').eq('status', 'approved'),
        supabase.from('investments').select('amount')
      ])

      const totalRevenue = (loansRes.data || []).reduce((sum, loan) => sum + (loan.amount || 0), 0) +
                          (investmentsRes.data || []).reduce((sum, inv) => sum + (inv.amount || 0), 0)

      setOverviewStats({
        totalRevenue,
        activeLoans: loansRes.data?.length || 0,
        activeInvestments: investmentsRes.data?.length || 0,
        monthlyGrowth: 12.5
      })
    } catch (error) {
      console.error('Error fetching overview stats:', error)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Business Department</h1>
          <p className="text-muted-foreground">Strategic business operations and performance analytics</p>
        </div>
        <Button>
          <Briefcase className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overviewStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{overviewStats.monthlyGrowth}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.activeLoans}</div>
            <p className="text-xs text-muted-foreground">Currently processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.activeInvestments}</div>
            <p className="text-xs text-muted-foreground">Investment products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.monthlyGrowth}%</div>
            <p className="text-xs text-muted-foreground">Monthly growth</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Strategic Planning</div>
                <div className="text-sm text-muted-foreground">Long-term business strategy and goals</div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Market Analysis</div>
                <div className="text-sm text-muted-foreground">Competitive analysis and market trends</div>
              </div>
              <Badge variant="outline">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Partnership Development</div>
                <div className="text-sm text-muted-foreground">Strategic partnerships and collaborations</div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Product Development</div>
                <div className="text-sm text-muted-foreground">New financial products and services</div>
              </div>
              <Badge variant="outline">Planning</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Business Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{metric.metric_name}</div>
                    <div className="text-sm text-muted-foreground">{metric.period}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{metric.value}</div>
                    <div className={`text-sm ${metric.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change_percentage >= 0 ? '+' : ''}{metric.change_percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
