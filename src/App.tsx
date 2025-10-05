import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { Home } from '@/pages/Home'
import { BorrowerDashboard } from '@/pages/borrower/BorrowerDashboard'
import { BorrowerLoans } from '@/pages/borrower/BorrowerLoans'
import LoanApplicationForm from '@/pages/borrower/LoanApplicationForm'
import { InvestorDashboard } from '@/pages/investor/InvestorDashboard'
import { InvestorInvestments } from '@/pages/investor/InvestorInvestments'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminUsers } from '@/pages/admin/AdminUsers'
import { AdminLoans } from '@/pages/admin/AdminLoans'
import { BusinessDepartment } from '@/pages/admin/BusinessDepartment'
import { CustomerService } from '@/pages/admin/CustomerService'
import { RiskManagement } from '@/pages/admin/RiskManagement'
import { Compliance } from '@/pages/admin/Compliance'
import { TechnicalSupport } from '@/pages/admin/TechnicalSupport'
import AdminInvites from '@/pages/admin/AdminInvites'
import { Transactions } from '@/pages/Transactions'
import { Toaster } from 'sonner'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            
            {/* Borrower Routes */}
            <Route
              path="/borrower"
              element={
                <ProtectedRoute allowedRoles={['borrower']}>
                  <BorrowerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/borrower/loans"
              element={
                <ProtectedRoute allowedRoles={['borrower']}>
                  <BorrowerLoans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/borrower/apply"
              element={
                <ProtectedRoute allowedRoles={['borrower']}>
                  <LoanApplicationForm />
                </ProtectedRoute>
              }
            />
            
            {/* Investor Routes */}
            <Route
              path="/investor"
              element={
                <ProtectedRoute allowedRoles={['investor']}>
                  <InvestorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/investor/investments"
              element={
                <ProtectedRoute allowedRoles={['investor']}>
                  <InvestorInvestments />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']} requiredDepartment="dashboard">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']} requiredDepartment="users">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/loans"
              element={
                <ProtectedRoute allowedRoles={['admin']} requiredDepartment="loans">
                  <AdminLoans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/business"
              element={
                <ProtectedRoute allowedRoles={['admin']} requiredDepartment="business">
                  <BusinessDepartment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/customer-service"
              element={
                <ProtectedRoute allowedRoles={['admin']} requiredDepartment="customer-service">
                  <CustomerService />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/risk-management"
              element={
                <ProtectedRoute allowedRoles={['admin']} requiredDepartment="risk-management">
                  <RiskManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/compliance"
              element={
                <ProtectedRoute allowedRoles={['admin']} requiredDepartment="compliance">
                  <Compliance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/technical-support"
              element={
                <ProtectedRoute allowedRoles={['admin']} requiredDepartment="technical-support">
                  <TechnicalSupport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/invites"
              element={
                <ProtectedRoute allowedRoles={['admin']} requiredDepartment="invites">
                  <AdminInvites />
                </ProtectedRoute>
              }
            />
            
            {/* Shared Routes */}
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
