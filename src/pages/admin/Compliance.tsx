import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, FileCheck, AlertCircle, CheckCircle } from 'lucide-react'

interface ComplianceReport {
  id: string
  report_type: string
  status: string
  findings: string
  recommendations: string
  created_at: string
}

export function Compliance() {
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    compliant: 0,
    pending: 0,
    violations: 0,
    total: 0
  })

  useEffect(() => {
    fetchComplianceReports()
    fetchStats()
  }, [])

  async function fetchComplianceReports() {
    try {
      const { data, error } = await supabase
        .from('compliance_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15)

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching compliance reports:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const [compliantRes, pendingRes, violationsRes] = await Promise.all([
        supabase.from('compliance_reports').select('id', { count: 'exact', head: true }).eq('status', 'compliant'),
        supabase.from('compliance_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('compliance_reports').select('id', { count: 'exact', head: true }).eq('status', 'violation')
      ])

      setStats({
        compliant: compliantRes.count || 0,
        pending: pendingRes.count || 0,
        violations: violationsRes.count || 0,
        total: (compliantRes.count || 0) + (pendingRes.count || 0) + (violationsRes.count || 0)
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      compliant: { variant: 'outline', label: 'Compliant' },
      pending: { variant: 'default', label: 'Pending Review' },
      violation: { variant: 'destructive', label: 'Violation' }
    }
    const config = variants[status] || { variant: 'outline', label: status }
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
          <h1 className="text-3xl font-bold mb-2">Compliance Department</h1>
          <p className="text-muted-foreground">Regulatory compliance and audit management</p>
        </div>
        <Button>
          <FileCheck className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.compliant}</div>
            <p className="text-xs text-muted-foreground">All requirements met</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting assessment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.violations}</div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regulatory Framework</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">KYC/AML Compliance</div>
                <div className="text-sm text-muted-foreground">Know Your Customer and Anti-Money Laundering</div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Data Protection (GDPR)</div>
                <div className="text-sm text-muted-foreground">Personal data handling and privacy</div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Financial Regulations</div>
                <div className="text-sm text-muted-foreground">SEC and banking regulations</div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Consumer Protection</div>
                <div className="text-sm text-muted-foreground">Fair lending and disclosure requirements</div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Compliance Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium">{report.report_type}</div>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {report.findings}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(report.created_at).toLocaleDateString()}
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
