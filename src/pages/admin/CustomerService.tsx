import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Headphones, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react'

interface Ticket {
  id: string
  user_id: string
  subject: string
  status: string
  priority: string
  created_at: string
  user_email?: string
}

export function CustomerService() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
    total: 0
  })

  useEffect(() => {
    fetchTickets()
    fetchStats()
  }, [])

  async function fetchTickets() {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setTickets(data || [])
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const [openRes, inProgressRes, resolvedRes] = await Promise.all([
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'resolved')
      ])

      setStats({
        open: openRes.count || 0,
        inProgress: inProgressRes.count || 0,
        resolved: resolvedRes.count || 0,
        total: (openRes.count || 0) + (inProgressRes.count || 0) + (resolvedRes.count || 0)
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      open: { variant: 'destructive', label: 'Open' },
      in_progress: { variant: 'default', label: 'In Progress' },
      resolved: { variant: 'outline', label: 'Resolved' }
    }
    const config = variants[status] || { variant: 'outline', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  function getPriorityBadge(priority: string) {
    const colors: Record<string, string> = {
      high: 'text-red-600 bg-red-50',
      medium: 'text-yellow-600 bg-yellow-50',
      low: 'text-green-600 bg-green-50'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority] || colors.low}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
          <h1 className="text-3xl font-bold mb-2">Customer Service</h1>
          <p className="text-muted-foreground">Manage customer inquiries and support tickets</p>
        </div>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Being handled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Headphones className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No support tickets found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium">{ticket.subject}</div>
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ticket.user_email || `User ID: ${ticket.user_id}`}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(ticket.status)}
                    <Button variant="outline" size="sm">
                      View
                    </Button>
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
