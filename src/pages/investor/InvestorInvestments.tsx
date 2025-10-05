import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, InvestmentProduct } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

export function InvestorInvestments() {
  const { profile } = useAuth()
  const [products, setProducts] = useState<InvestmentProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<InvestmentProduct | null>(null)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('investment_products')
        .select('*')
        .order('expected_return', { ascending: false })

      if (error) throw error
      if (data) setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load investment products')
    } finally {
      setLoading(false)
    }
  }

  async function handleInvest(e: React.FormEvent) {
    e.preventDefault()
    if (!profile || !selectedProduct) return

    const investAmount = parseFloat(amount)
    if (investAmount < selectedProduct.min_investment) {
      toast.error(`Minimum investment is $${selectedProduct.min_investment.toLocaleString()}`)
      return
    }

    try {
      const { error } = await supabase
        .from('investments')
        .insert({
          user_id: profile.id,
          investment_product_id: selectedProduct.id,
          amount: investAmount,
          status: 'active'
        })

      if (error) throw error

      toast.success('Investment created successfully!')
      setDialogOpen(false)
      setAmount('')
      setSelectedProduct(null)
    } catch (error: any) {
      console.error('Error creating investment:', error)
      toast.error(error.message || 'Failed to create investment')
    }
  }

  function openInvestDialog(product: InvestmentProduct) {
    setSelectedProduct(product)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const riskColors = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Investment Products</h1>
        <p className="text-muted-foreground">Choose from our curated investment opportunities</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <CardTitle>{product.name}</CardTitle>
                <span className={`px-2 py-1 text-xs rounded-full capitalize ${riskColors[product.risk_level]}`}>
                  {product.risk_level} Risk
                </span>
              </div>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expected Return</span>
                  <span className="font-medium text-primary">{product.expected_return}% p.a.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Min. Investment</span>
                  <span className="font-medium">${product.min_investment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{product.duration_months} months</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => openInvestDialog(product)}>
                <Plus className="h-4 w-4 mr-2" />
                Invest Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Invest in {selectedProduct?.name}</DialogTitle>
            <DialogDescription>Enter the amount you want to invest</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <form onSubmit={handleInvest} className="space-y-4">
              <div className="p-3 bg-accent/50 rounded-lg text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Expected Return:</span>
                  <span className="font-medium text-primary">{selectedProduct.expected_return}% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{selectedProduct.duration_months} months</span>
                </div>
                <div className="flex justify-between">
                  <span>Min. Investment:</span>
                  <span className="font-medium">${selectedProduct.min_investment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Risk Level:</span>
                  <span className="font-medium capitalize">{selectedProduct.risk_level}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={selectedProduct.min_investment.toString()}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={selectedProduct.min_investment}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimum: ${selectedProduct.min_investment.toLocaleString()}
                </p>
              </div>

              {amount && parseFloat(amount) >= selectedProduct.min_investment && (
                <div className="p-3 bg-primary/10 rounded-lg text-sm">
                  <div className="font-medium mb-1">Projected Returns</div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">After {selectedProduct.duration_months} months:</span>
                    <span className="font-semibold text-primary">
                      ${(parseFloat(amount) * (1 + selectedProduct.expected_return / 100 * selectedProduct.duration_months / 12)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">Confirm Investment</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
