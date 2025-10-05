import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'
import { toast } from 'sonner'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md border-2 border-gray-200 dark:border-gray-700 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <img src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2Fc5oCqVpf7jMz7S2yGjhOWEN5tiQ2%2Flogo-removebg-preview__7d62ffb1.png?alt=media&token=826babad-c568-409b-abe5-280c08183874" alt="Prodigy Group Services" className="h-16 w-16 object-contain rounded-xl shadow-sm bg-white p-1" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</CardTitle>
          <CardDescription className="text-base mt-2 text-gray-600 dark:text-gray-400">Sign in to Prodigy Group Services</CardDescription>
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
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base rounded-lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
