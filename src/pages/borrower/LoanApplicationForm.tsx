import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, LoanProduct } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface Warehouse {
  number: string
  address: string
}

interface ParkingStore {
  number: string
  address: string
}

export default function LoanApplicationForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Form state
  const [email, setEmail] = useState(user?.email || '')
  const [loanOfficer, setLoanOfficer] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [representativeName, setRepresentativeName] = useState('')
  const [gender, setGender] = useState('')
  const [rcNumber, setRcNumber] = useState('')
  const [businessSince, setBusinessSince] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [homeAddress, setHomeAddress] = useState('')
  const [bvn, setBvn] = useState('')
  const [tin, setTin] = useState('')
  const [numShops, setNumShops] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [warehouses, setWarehouses] = useState<Warehouse[]>([{ number: '', address: '' }])
  const [parkingStores, setParkingStores] = useState<ParkingStore[]>([{ number: '', address: '' }])
  const [phoneNumbers, setPhoneNumbers] = useState([''])
  const [spousePhone, setSpousePhone] = useState('')
  const [annualSalary, setAnnualSalary] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [durationMonths, setDurationMonths] = useState('')
  const [repaymentCapacity, setRepaymentCapacity] = useState('')
  const [hasCurrentLoan, setHasCurrentLoan] = useState<boolean>(false)
  const [loanType, setLoanType] = useState('')
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([])
  const [loanProductId, setLoanProductId] = useState('')

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('loan_products')
        .select('*')
        .order('interest_rate', { ascending: true })
      if (!error && data) setLoanProducts(data)
    }
    fetchProducts()
  }, [])

  const addWarehouse = () => {
    setWarehouses([...warehouses, { number: '', address: '' }])
  }

  const removeWarehouse = (index: number) => {
    setWarehouses(warehouses.filter((_, i) => i !== index))
  }

  const updateWarehouse = (index: number, field: 'number' | 'address', value: string) => {
    const updated = [...warehouses]
    updated[index][field] = value
    setWarehouses(updated)
  }

  const addParkingStore = () => {
    setParkingStores([...parkingStores, { number: '', address: '' }])
  }

  const removeParkingStore = (index: number) => {
    setParkingStores(parkingStores.filter((_, i) => i !== index))
  }

  const updateParkingStore = (index: number, field: 'number' | 'address', value: string) => {
    const updated = [...parkingStores]
    updated[index][field] = value
    setParkingStores(updated)
  }

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, ''])
  }

  const removePhoneNumber = (index: number) => {
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index))
  }

  const updatePhoneNumber = (index: number, value: string) => {
    const updated = [...phoneNumbers]
    updated[index] = value
    setPhoneNumbers(updated)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Valid email is required'
    }
    if (!businessName) newErrors.businessName = 'Business name is required'
    if (!representativeName) newErrors.representativeName = 'Representative name is required'
    if (!gender) newErrors.gender = 'Gender is required'
    if (!loanAmount || parseFloat(loanAmount) <= 0) {
      newErrors.loanAmount = 'Valid loan amount is required'
    }
    if (!loanProductId) newErrors.loanProductId = 'Loan product is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix all errors before submitting')
      return
    }

    if (!user) {
      toast.error('You must be logged in to apply')
      return
    }

    setLoading(true)

    try {
      // Prepare application data
      const selected = loanProducts.find(p => p.id === loanProductId)

      const applicationData = {
        user_id: user.id,
        email,
        loan_officer: loanOfficer || null,
        business_name: businessName,
        representative_name: representativeName,
        gender,
        rc_number: rcNumber || null,
        business_since: businessSince || null,
        business_address: businessAddress || null,
        home_address: homeAddress || null,
        bvn: bvn || null,
        tin: tin || null,
        num_shops: numShops ? parseInt(numShops) : null,
        marital_status: maritalStatus || null,
        warehouses: warehouses.filter(w => w.number || w.address),
        parking_stores: parkingStores.filter(p => p.number || p.address),
        phone_numbers: phoneNumbers.filter(p => p.trim() !== ''),
        spouse_phone: spousePhone || null,
        annual_salary: annualSalary ? parseFloat(annualSalary) : null,
        loan_amount: parseFloat(loanAmount),
        duration_months: durationMonths ? parseInt(durationMonths) : null,
        repayment_capacity: repaymentCapacity || null,
        has_current_loan: hasCurrentLoan,
        loan_product_id: loanProductId,
        loan_type: loanType || selected?.name || null,
        status: 'pending'
      }

      // Insert into database
      const { data: application, error: dbError } = await supabase
        .from('loan_applications')
        .insert([applicationData])
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error('Failed to save application')
      }

      // Call edge function to send email
      const { error: emailError } = await supabase.functions.invoke('send-loan-application-email', {
        body: { application: applicationData, applicationId: application.id }
      })

      if (emailError) {
        console.warn('Email notification failed:', emailError)
        // Don't fail the whole submission if email fails
      }

      toast.success('Application submitted successfully!')
      navigate('/borrower/loans')
    } catch (error: any) {
      console.error('Submission error:', error)
      toast.error(error.message || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Loan Application Form</CardTitle>
          <CardDescription>
            Complete all required fields to submit your loan application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="loanOfficer">Loan Officer / Credit Risk Officer</Label>
                  <Input
                    id="loanOfficer"
                    value={loanOfficer}
                    onChange={(e) => setLoanOfficer(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={errors.businessName ? 'border-red-500' : ''}
                  />
                  {errors.businessName && <p className="text-sm text-red-500 mt-1">{errors.businessName}</p>}
                </div>

                <div>
                  <Label htmlFor="rcNumber">RC Number</Label>
                  <Input
                    id="rcNumber"
                    value={rcNumber}
                    onChange={(e) => setRcNumber(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="businessSince">Business Since</Label>
                  <Input
                    id="businessSince"
                    type="date"
                    value={businessSince}
                    onChange={(e) => setBusinessSince(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="numShops">Number of Shops</Label>
                  <Input
                    id="numShops"
                    type="number"
                    min="0"
                    value={numShops}
                    onChange={(e) => setNumShops(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="representativeName">Representative Name *</Label>
                  <Input
                    id="representativeName"
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    className={errors.representativeName ? 'border-red-500' : ''}
                  />
                  {errors.representativeName && <p className="text-sm text-red-500 mt-1">{errors.representativeName}</p>}
                </div>

                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bvn">BVN</Label>
                  <Input
                    id="bvn"
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value)}
                    maxLength={11}
                  />
                </div>

                <div>
                  <Label htmlFor="tin">TIN</Label>
                  <Input
                    id="tin"
                    value={tin}
                    onChange={(e) => setTin(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="annualSalary">Annual Salary</Label>
                  <Input
                    id="annualSalary"
                    type="number"
                    min="0"
                    step="0.01"
                    value={annualSalary}
                    onChange={(e) => setAnnualSalary(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="homeAddress">Home Address</Label>
                <Textarea
                  id="homeAddress"
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Phone Numbers */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Phone Numbers</h3>
              
              {phoneNumbers.map((phone, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Phone number ${index + 1}`}
                    value={phone}
                    onChange={(e) => updatePhoneNumber(index, e.target.value)}
                  />
                  {phoneNumbers.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removePhoneNumber(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addPhoneNumber} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Phone Number
              </Button>

              <div>
                <Label htmlFor="spousePhone">Spouse Phone Number</Label>
                <Input
                  id="spousePhone"
                  value={spousePhone}
                  onChange={(e) => setSpousePhone(e.target.value)}
                />
              </div>
            </div>

            {/* Warehouses */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Warehouses</h3>
              
              {warehouses.map((warehouse, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
                  <div>
                    <Label>Warehouse Number</Label>
                    <Input
                      placeholder="Number"
                      value={warehouse.number}
                      onChange={(e) => updateWarehouse(index, 'number', e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label>Address</Label>
                      <Input
                        placeholder="Address"
                        value={warehouse.address}
                        onChange={(e) => updateWarehouse(index, 'address', e.target.value)}
                      />
                    </div>
                    {warehouses.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeWarehouse(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addWarehouse} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Warehouse
              </Button>
            </div>

            {/* Parking Stores */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Parking Stores</h3>
              
              {parkingStores.map((store, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
                  <div>
                    <Label>Store Number</Label>
                    <Input
                      placeholder="Number"
                      value={store.number}
                      onChange={(e) => updateParkingStore(index, 'number', e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label>Address</Label>
                      <Input
                        placeholder="Address"
                        value={store.address}
                        onChange={(e) => updateParkingStore(index, 'address', e.target.value)}
                      />
                    </div>
                    {parkingStores.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeParkingStore(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addParkingStore} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Parking Store
              </Button>
            </div>

            {/* Loan Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Loan Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loanProduct">Loan Product *</Label>
                  <Select
                    value={loanProductId}
                    onValueChange={(value) => {
                      setLoanProductId(value)
                      const p = loanProducts.find(lp => lp.id === value)
                      setLoanType(p?.name || '')
                    }}
                  >
                    <SelectTrigger className={errors.loanProductId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select loan product" />
                    </SelectTrigger>
                    <SelectContent>
                      {loanProducts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} - {p.interest_rate}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.loanProductId && <p className="text-sm text-red-500 mt-1">{errors.loanProductId}</p>}
                </div>

                <div>
                  <Label htmlFor="loanAmount">Loan Amount *</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="0.00"
                    className={errors.loanAmount ? 'border-red-500' : ''}
                  />
                  {errors.loanAmount && <p className="text-sm text-red-500 mt-1">{errors.loanAmount}</p>}
                </div>

                <div>
                  <Label htmlFor="durationMonths">Duration (Months)</Label>
                  <Input
                    id="durationMonths"
                    type="number"
                    min="1"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="repaymentCapacity">Repayment Capacity</Label>
                  <Input
                    id="repaymentCapacity"
                    value={repaymentCapacity}
                    onChange={(e) => setRepaymentCapacity(e.target.value)}
                    placeholder="e.g., Monthly income"
                  />
                </div>
              </div>

              {loanProductId && (
                <div className="p-3 bg-accent/50 rounded-lg text-sm space-y-1">
                  {(() => {
                    const p = loanProducts.find(lp => lp.id === loanProductId)
                    if (!p) return null
                    return (
                      <>
                        <div className="flex justify-between">
                          <span>Amount Range:</span>
                          <span className="font-medium">${p.min_amount.toLocaleString()} - ${p.max_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Interest Rate:</span>
                          <span className="font-medium">{p.interest_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Term:</span>
                          <span className="font-medium">{p.term_months} months</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}

              <div className="space-y-2">
                <Label>Currently Running Loan?</Label>
                <RadioGroup
                  value={hasCurrentLoan ? 'yes' : 'no'}
                  onValueChange={(value) => setHasCurrentLoan(value === 'yes')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="loan-yes" />
                    <Label htmlFor="loan-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="loan-no" />
                    <Label htmlFor="loan-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/borrower/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
