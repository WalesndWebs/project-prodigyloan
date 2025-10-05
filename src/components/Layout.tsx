import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Home, 
  DollarSign, 
  TrendingUp, 
  Users, 
  History, 
  LogOut, 
  Menu,
  LayoutDashboard,
  FileText,
  Wallet,
  Briefcase,
  Headphones,
  Shield,
  ShieldCheck,
  Wrench,
  Mail
} from 'lucide-react'
import { useState } from 'react'
import { useMediaQuery } from 'react-responsive'

export function Layout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMediaQuery({ maxWidth: 768 })

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  function getNavItems() {
    if (!profile) return []

    const common = [
      { icon: Home, label: 'Home', path: '/' },
      { icon: History, label: 'Transactions', path: '/transactions' },
    ]

    if (profile.role === 'borrower') {
      return [
        ...common,
        { icon: LayoutDashboard, label: 'Dashboard', path: '/borrower' },
        { icon: FileText, label: 'My Loans', path: '/borrower/loans' },
      ]
    }

    if (profile.role === 'investor') {
      return [
        ...common,
        { icon: LayoutDashboard, label: 'Dashboard', path: '/investor' },
        { icon: Wallet, label: 'My Investments', path: '/investor/investments' },
      ]
    }

    if (profile.role === 'admin') {
      const allAdminItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', department: 'dashboard' },
        { icon: Users, label: 'Users', path: '/admin/users', department: 'users' },
        { icon: DollarSign, label: 'Loans', path: '/admin/loans', department: 'loans' },
        { icon: TrendingUp, label: 'Investments', path: '/admin/investments', department: 'investments' },
        { icon: Briefcase, label: 'Business', path: '/admin/business', department: 'business' },
        { icon: Headphones, label: 'Customer Service', path: '/admin/customer-service', department: 'customer-service' },
        { icon: Shield, label: 'Risk Management', path: '/admin/risk-management', department: 'risk-management' },
        { icon: ShieldCheck, label: 'Compliance', path: '/admin/compliance', department: 'compliance' },
        { icon: Wrench, label: 'Technical Support', path: '/admin/technical-support', department: 'technical-support' },
        { icon: Mail, label: 'Admin Invites', path: '/admin/invites', department: 'invites' },
      ]

      // Filter based on department access
      const department = profile.department
      if (department === 'all') {
        // Super admin sees everything
        return [...common, ...allAdminItems]
      } else if (department) {
        // Specific department admin sees only their section
        const allowedItems = allAdminItems.filter(item => item.department === department)
        return [...common, ...allowedItems]
      }
      
      // Fallback: no department assigned, show nothing
      return common
    }

    return common
  }

  const navItems = getNavItems()

  function NavLinks() {
    return (
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {isMobile && profile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex h-full flex-col">
                    <div className="border-b p-6">
                      <div className="flex items-center gap-3">
                        <img src="/favicon.svg" alt="Prodigy Group Services" className="h-8 w-auto" />
                        <h2 className="text-xl font-bold text-primary">Prodigy Group Services</h2>
                      </div>
                      {profile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile.role === 'admin' ? 'Admin' : `${profile.is_borrower ? 'Borrower' : ''}${profile.is_borrower && profile.is_investor ? ' + ' : ''}${profile.is_investor ? 'Investor' : ''}`} Portal
                        </p>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      <NavLinks />
                    </div>
                    <div className="border-t p-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <Link to="/" className="flex items-center gap-2">
              <img src="/favicon.svg" alt="Prodigy Group Services" className="h-8 w-auto" />
              <span className="text-xl font-bold">Prodigy Group Services</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {profile && (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Welcome,</span>
                <span className="font-medium">{profile.email}</span>
                <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                  {profile.role === 'admin' ? 'Admin' : `${profile.is_borrower ? 'Borrower' : ''}${profile.is_borrower && profile.is_investor ? ' + ' : ''}${profile.is_investor ? 'Investor' : ''}`}
                </span>
              </div>
            )}
            {!isMobile && profile && (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        {!isMobile && profile && (
          <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r bg-card">
            <div className="flex h-full flex-col p-4">
              <NavLinks />
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
