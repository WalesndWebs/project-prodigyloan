import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, TrendingUp, FileText } from 'lucide-react'

interface RiskAssessment {
  id: string
  loan_application_id: string
  risk_score: number
  risk_level: string
  assessment_date: string
  notes: string
}

export function RiskManagement() {
  const [assessments, setAssessments] = useState<RiskAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    avgRiskScore: 0
  })

  useEffect(() => {
    fetchRiskAssessments()
    fetchStats()
  }, [])

  async function fetchRiskAssessments() {
    try {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .order('assessment_date', { ascending: false })
        .limit(15)

      if (error) throw error
      setAssessments(data || [])
    } catch (error) {
      console.error('Error fetching risk assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const [highRes, mediumRes, lowRes, avgRes] = await Promise.all([
        supabase.from('risk_assessments').select('id', { count: 'exact', head: true }).eq('risk_level', 'high'),
        supabase.from('risk_assessments').select('id', { count: 'exact', head: true }).eq('risk_level', 'medium'),
        supabase.from('risk_assessments').select('id', { count: 'exact', head: true }).eq('risk_level', 'low'),
        supabase.from('risk_assessments').select('risk_score')
      ])

      const avgScore = avgRes.data?.length 
        ? avgRes.data.reduce((sum, r) => sum + r.risk_score, 0) / avgRes.data.length 
        : 0

      setStats({
        highRisk: highRes.count || 0,
        mediumRisk: mediumRes.count || 0,
        lowRisk: lowRes.count || 0,
        avgRiskScore: Math.round(avgScore)
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  function getRiskBadge(level: string) {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      high: { variant: 'destructive', label: 'High Risk' },
      medium: { variant: 'default', label: 'Medium Risk' },
      low: { variant: 'outline', label: 'Low Risk' }
    }
    const config = variants[level] || { variant: 'outline', label: level }
    return <Badge variant={config.variant}>{config.label}</Badge>
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
          <h1 className="text-3xl font-bold mb-2">Risk Management</h1>
          <p className="text-muted-foreground">Monitor and assess financial risk across the platform</p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          New Assessment
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highRisk}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
            <Shield className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mediumRisk}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowRisk}</div>
            <p className="text-xs text-muted-foreground">Good standing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRiskScore}</div>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Framework</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Credit Risk Analysis</div>
                <div className="text-sm text-muted-foreground">Borrower creditworthiness evaluation</div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Market Risk Monitoring</div>
                <div className="text-sm text-muted-foreground">Economic conditions and market volatility</div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Operational Risk Control</div>
                <div className="text-sm text-muted-foreground">Internal processes and system reliability</div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Liquidity Risk Management</div>
                <div className="text-sm text-muted-foreground">Cash flow and funding availability</div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {assessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Risk Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium">Loan Application #{assessment.loan_application_id}</div>
                      {getRiskBadge(assessment.risk_level)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Risk Score: {assessment.risk_score}/100
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(assessment.assessment_date).toLocaleDateString()}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
