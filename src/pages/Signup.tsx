import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DollarSign } from 'lucide-react'
import { toast } from 'sonner'

export function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isBorrower, setIsBorrower] = useState(true)
  const [isInvestor, setIsInvestor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [rolesError, setRolesError] = useState('')
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Reset errors
    setEmailError('')
    setPasswordError('')
    setRolesError('')

    let hasError = false

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError('Enter a valid email address')
      hasError = true
    }

    // Basic password validation (min length 6 to match input requirement)
    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      hasError = true
    }

    // Role selection validation
    if (!isBorrower && !isInvestor) {
      setRolesError('Select at least one role')
      hasError = true
    }

    if (hasError) return

    setLoading(true)

    try {
      await signUp(email, password, { isBorrower, isInvestor })
      toast.success('Account created successfully!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md border-2 border-gray-200 dark:border-gray-700 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <img src="/favicon.svg" alt="Prodigy Group Services" className="h-16 w-16 object-contain rounded-xl shadow-sm bg-white p-1" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</CardTitle>
          <CardDescription className="text-base mt-2 text-gray-600 dark:text-gray-400">Join Prodigy Group Services today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                aria-invalid={Boolean(emailError)}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) setEmailError('')
                }}
                required
              />
              {emailError && (
                <p className="text-red-600 text-sm mt-1">{emailError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                aria-invalid={Boolean(passwordError)}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordError) setPasswordError('')
                }}
                required
                minLength={6}
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            <div className="space-y-3">
              <Label>Select your roles</Label>
              <div className={`space-y-3 ${rolesError ? 'border border-red-500 rounded-lg p-2' : ''}`}>
                <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer transition-all">
                  <Checkbox id="borrower" checked={isBorrower} onCheckedChange={(v) => {
                    const val = Boolean(v)
                    setIsBorrower(val)
                    if (val || isInvestor) setRolesError('')
                  }} />
                  <Label htmlFor="borrower" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-gray-900 dark:text-white">Borrower</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Apply for loans</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer transition-all">
                  <Checkbox id="investor" checked={isInvestor} onCheckedChange={(v) => {
                    const val = Boolean(v)
                    setIsInvestor(val)
                    if (val || isBorrower) setRolesError('')
                  }} />
                  <Label htmlFor="investor" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-gray-900 dark:text-white">Investor</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Earn returns on investments</div>
                  </Label>
                </div>
                {rolesError && (
                  <p className="text-red-600 text-sm">{rolesError}</p>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base rounded-lg" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}