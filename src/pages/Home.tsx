import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Shield, Users, Zap, ArrowRight } from 'lucide-react'

export function Home() {
  const { profile } = useAuth()

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-24 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Your Gateway to
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-blue-600 dark:text-blue-400">
            Financial Excellence
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Access premium loan and investment products tailored to your financial goals. 
            From flexible loans to bespoke investment portfolios.
          </p>
          {!profile && (
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg" asChild>
                <Link to="/signup">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-lg" asChild>
                <Link to="/login">
                  <Shield className="mr-2 h-5 w-5" /> Admin Login
                </Link>
              </Button>
            </div>
          )}
          {profile && (
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <Link to={profile.role === 'admin' ? '/admin' : (profile.is_borrower ? '/borrower' : (profile.is_investor ? '/investor' : '/'))}>Go to Dashboard</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="h-14 w-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Smart Investments</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Tailored investment strategies for maximum returns
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="h-14 w-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 mx-auto">
                  <Shield className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Secure Platform</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Bank-level security for your financial data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="h-14 w-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 mx-auto">
                  <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Expert Advisory</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Professional guidance from financial experts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="h-14 w-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 mx-auto">
                  <Zap className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Fast Processing</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Quick approval and instant access to services
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Products */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">Our Products</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Products & Services */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">
                  Products & Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Prodigy Flexi Loan</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Flexible repayment terms and competitive rates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Prodigy Liquidity Note</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">High liquidity with fixed returns</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Prodigy Vantage (FX Note)</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Foreign exchange opportunities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Prodigy Lite (Advisory services)</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Professional financial guidance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bespoke Products */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">
                  Bespoke Products
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Prodigy Genesis</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Premium investment portfolio</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Prodigy Aura</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Elite wealth management</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Prodigy Apex</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pinnacle investment experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Prodigy</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ultimate financial mastery</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied customers and start your financial journey today
          </p>
          {!profile && (
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-lg" asChild>
              <Link to="/signup">Create Free Account</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}
