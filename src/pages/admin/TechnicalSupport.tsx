import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wrench, Server, AlertTriangle, Activity } from 'lucide-react'

interface TechnicalIncident {
  id: string
  title: string
  severity: string
  status: string
  description: string
  created_at: string
  resolved_at?: string
}

export function TechnicalSupport() {
  const [incidents, setIncidents] = useState<TechnicalIncident[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    critical: 0,
    active: 0,
    resolved: 0,
    uptime: 99.9
  })

  useEffect(() => {
    fetchIncidents()
    fetchStats()
  }, [])

  async function fetchIncidents() {
    try {
      const { data, error } = await supabase
        .from('technical_incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15)

      if (error) throw error
      setIncidents(data || [])
    } catch (error) {
      console.error('Error fetching incidents:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const [criticalRes, activeRes, resolvedRes] = await Promise.all([
        supabase.from('technical_incidents').select('id', { count: 'exact', head: true }).eq('severity', 'critical'),
        supabase.from('technical_incidents').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('technical_incidents').select('id', { count: 'exact', head: true }).eq('status', 'resolved')
      ])

      setStats({
        critical: criticalRes.count || 0,
        active: activeRes.count || 0,
        resolved: resolvedRes.count || 0,
        uptime: 99.9
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  function getSeverityBadge(severity: string) {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      critical: { variant: 'destructive', label: 'Critical' },
      high: { variant: 'default', label: 'High' },
      medium: { variant: 'secondary', label: 'Medium' },
      low: { variant: 'outline', label: 'Low' }
    }
    const config = variants[severity] || { variant: 'outline', label: severity }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  function getStatusBadge(status: string) {
    const colors: Record<string, string> = {
      active: 'text-red-600 bg-red-50',
      investigating: 'text-yellow-600 bg-yellow-50',
      resolved: 'text-green-600 bg-green-50'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.investigating}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
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
          <h1 className="text-3xl font-bold mb-2">Technical Support</h1>
          <p className="text-muted-foreground">System monitoring and incident management</p>
        </div>
        <Button>
          <Wrench className="mr-2 h-4 w-4" />
          Report Incident
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Being investigated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uptime}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Database Servers</div>
                <div className="text-sm text-muted-foreground">Primary and backup database instances</div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">API Gateway</div>
                <div className="text-sm text-muted-foreground">REST API and authentication services</div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Payment Processing</div>
                <div className="text-sm text-muted-foreground">Transaction handling and verification</div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Notification Service</div>
                <div className="text-sm text-muted-foreground">Email and SMS delivery system</div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">Operational</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {incidents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Technical Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium">{incident.title}</div>
                      {getSeverityBadge(incident.severity)}
                      {getStatusBadge(incident.status)}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {incident.description}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(incident.created_at).toLocaleDateString()}
                      {incident.resolved_at && ` • Resolved: ${new Date(incident.resolved_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Details
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
