import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Transaction } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function Transactions() {
  const { profile } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    let isMounted = true

    ;(async () => {
      try {
        let query = supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })

        // Non-admin users only see their own transactions
        if (profile.role !== 'admin') {
          query = query.eq('user_id', profile.id)
        }

        const { data, error } = await query
        if (error) throw error
        if (!isMounted) return
        if (data) setTransactions(data)
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [profile?.id, profile?.role])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  function getTransactionIcon(type: string) {
    const incomingTypes = ['deposit', 'loan_disbursement', 'return']
    return incomingTypes.includes(type) ? (
      <ArrowDownRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowUpRight className="h-4 w-4 text-red-500" />
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Transaction History</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">View all your financial transactions</p>
        </div>

        <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-2xl text-gray-900 dark:text-white">All Transactions</CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
        <CardContent className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-lg">
              No transactions yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <span className="capitalize">{transaction.type.replace(/_/g, ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                    <TableCell className="font-medium">
                      ${transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === 'completed' ? 'default' :
                          transaction.status === 'pending' ? 'secondary' :
                          'destructive'
                        }
                        className="capitalize"
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
