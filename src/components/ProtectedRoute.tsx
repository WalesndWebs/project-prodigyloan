import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requiredDepartment?: string
}

export function ProtectedRoute({ children, allowedRoles, requiredDepartment }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles) {
    const canAccess = allowedRoles.some((r) => {
      if (r === 'admin') return profile.role === 'admin'
      if (r === 'borrower') return Boolean(profile.is_borrower) || profile.role === 'borrower'
      if (r === 'investor') return Boolean(profile.is_investor) || profile.role === 'investor'
      return false
    })
    if (!canAccess) return <Navigate to="/" replace />
  }

  // Department-based access control for admins
  if (requiredDepartment && profile.role === 'admin') {
    const userDepartment = profile.department
    // 'all' department has access to everything
    if (userDepartment !== 'all' && userDepartment !== requiredDepartment) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
