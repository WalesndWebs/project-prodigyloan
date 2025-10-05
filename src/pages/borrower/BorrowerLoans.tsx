import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, LoanProduct } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export function BorrowerLoans() {
  const { profile } = useAuth()
  const [products, setProducts] = useState<LoanProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    loan_product_id: '',
    amount: '',
    purpose: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('loan_products')
        .select('*')
        .order('interest_rate', { ascending: true })

      if (error) throw error
      if (data) setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load loan products')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    try {
      const { error } = await supabase
        .from('loan_applications')
        .insert({
          user_id: profile.id,
          loan_product_id: formData.loan_product_id,
          amount: parseFloat(formData.amount),
          purpose: formData.purpose,
          status: 'pending'
        })

      if (error) throw error

      toast.success('Loan application submitted successfully!')
      setDialogOpen(false)
      setFormData({ loan_product_id: '', amount: '', purpose: '' })
    } catch (error: any) {
      console.error('Error submitting application:', error)
      toast.error(error.message || 'Failed to submit application')
    }
  }

  const selectedProduct = products.find(p => p.id === formData.loan_product_id)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Loan Products</h1>
          <p className="text-muted-foreground">Apply for a loan that fits your needs</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Application
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Apply for a Loan</DialogTitle>
                <DialogDescription>Fill out the application form to get started</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Loan Product</Label>
                  <Select
                    value={formData.loan_product_id}
                    onValueChange={(value) => setFormData({ ...formData, loan_product_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a loan product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.interest_rate}% APR
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProduct && (
                  <div className="p-3 bg-accent/50 rounded-lg text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Amount Range:</span>
                      <span className="font-medium">
                        ${selectedProduct.min_amount.toLocaleString()} - ${selectedProduct.max_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest Rate:</span>
                      <span className="font-medium">{selectedProduct.interest_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Term:</span>
                      <span className="font-medium">{selectedProduct.term_months} months</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="amount">Loan Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="5000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    min={selectedProduct?.min_amount}
                    max={selectedProduct?.max_amount}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Loan</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Describe why you need this loan..."
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                    rows={4}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">Submit Application</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Link to="/borrower/apply">
            <Button variant="secondary">Go to Apply Form</Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Range</span>
                  <span className="font-medium">
                    ${product.min_amount.toLocaleString()} - ${product.max_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-medium text-primary">{product.interest_rate}% APR</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Term</span>
                  <span className="font-medium">{product.term_months} months</span>
                </div>
              </div>
              <Button className="w-full" asChild>
                <Link to="/borrower/apply">Apply Now</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
