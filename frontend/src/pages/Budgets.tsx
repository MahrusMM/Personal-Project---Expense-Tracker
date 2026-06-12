import { useState, useEffect } from 'react'
import Navbar from '../components/navbar'
import API from '../lib/api'
import { useTheme } from '../lib/ThemeContext'

function Budgets() {
  const { theme } = useTheme()
  const [categories, setCategories] = useState([])
  const [totalBudget, setTotalBudget] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [budgetAmount, setBudgetAmount] = useState('')
  const [expenseType, setExpenseType] = useState('Fixed')
  const [cycle, setCycle] = useState('Monthly')
  const [rollover, setRollover] = useState(false)

  const bg = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#f0f2f7]'
  const card = theme === 'dark' ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-slate-100'
  const heading = theme === 'dark' ? 'text-white' : 'text-slate-800'
  const subtext = theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
  const input = theme === 'dark' ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
  const divider = theme === 'dark' ? 'divide-slate-700/30' : 'divide-slate-100'
  const progressBg = theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-200'
  const modalBg = theme === 'dark' ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-slate-200'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [catRes, spendRes, budgetRes] = await Promise.all([
      API.get('/categories/'),
      API.get('/reports/by-category'),
      API.get('/budgets/')
    ])

    const cats = catRes.data
    const spendData = spendRes.data
    const budgets = budgetRes.data

    const enriched = cats.map((cat: any) => {
      const budget = budgets.find((b: any) => b.category_id === cat.id)
      const spend = spendData.find((s: any) => s.category_name === cat.name)
      return {
        ...cat,
        budget_amount: budget ? budget.amount : 0,
        budget_id: budget ? budget.id : null,
        expense_type: budget ? budget.expense_type : 'Fixed',
        cycle: budget ? budget.cycle : 'Monthly',
        rollover: budget ? budget.rollover : false,
        spent: spend ? spend.total_amount : 0
      }
    })

    setCategories(enriched)
    const total = enriched.reduce((sum: number, cat: any) => sum + cat.budget_amount, 0)
    const spent = enriched.reduce((sum: number, cat: any) => sum + cat.spent, 0)
    setTotalBudget(total)
    setTotalSpent(spent)
  }

  const handleSaveBudget = async () => {
    if (!editingCategory) return
    if (editingCategory.budget_id) {
      await API.put(`/budgets/${editingCategory.budget_id}`, {
        amount: parseFloat(budgetAmount),
        expense_type: expenseType,
        cycle,
        cycle_start_date: new Date().toISOString(),
        rollover,
        initial_rollover: 0,
        category_id: editingCategory.id
      })
    } else {
      await API.post('/budgets/', {
        amount: parseFloat(budgetAmount),
        expense_type: expenseType,
        cycle,
        cycle_start_date: new Date().toISOString(),
        rollover,
        initial_rollover: 0,
        category_id: editingCategory.id
      })
    }
    setEditingCategory(null)
    setBudgetAmount('')
    fetchData()
  }

  const getProgressColor = (spent: number, budget: number) => {
    if (budget === 0) return 'bg-slate-400'
    const pct = (spent / budget) * 100
    if (pct >= 90) return 'bg-rose-500'
    if (pct >= 70) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getPercentage = (spent: number, budget: number) => {
    if (budget === 0) return 0
    return Math.min(Math.round((spent / budget) * 100), 100)
  }

  return (
    <div className={`min-h-screen flex ${bg}`}>
      <Navbar />
      <div className="ml-56 flex-1 p-8">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${heading}`}>Budgets</h1>
          <p className={`${subtext} text-sm mt-1`}>Manage your spending limits</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-6 shadow-lg shadow-violet-500/20">
            <p className="text-violet-200 text-sm font-medium">Total Budget</p>
            <p className="text-3xl font-bold text-white mt-1">${totalBudget.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 shadow-lg shadow-rose-500/20">
            <p className="text-rose-200 text-sm font-medium">Total Spent</p>
            <p className="text-3xl font-bold text-white mt-1">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg shadow-emerald-500/20">
            <p className="text-emerald-200 text-sm font-medium">Available</p>
            <p className="text-3xl font-bold text-white mt-1">${(totalBudget - totalSpent).toFixed(2)}</p>
          </div>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          {categories.length === 0 ? (
            <div className={`p-12 text-center ${subtext}`}>No categories yet.</div>
          ) : (
            <div className={`divide-y ${divider}`}>
              {categories.map((cat: any) => (
                <div key={cat.id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <p className={`font-semibold ${heading}`}>{cat.name}</p>
                        <p className={`text-xs ${subtext}`}>{cat.expense_type} · {cat.cycle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="text-rose-500 font-semibold">${cat.spent.toFixed(2)}</span>
                          <span className={`${subtext}`}> / </span>
                          <span className={`font-semibold ${heading}`}>
                            {cat.budget_amount > 0 ? `$${cat.budget_amount.toFixed(2)}` : 'No budget'}
                          </span>
                        </p>
                        {cat.budget_amount > 0 && (
                          <p className={`text-xs ${subtext}`}>{getPercentage(cat.spent, cat.budget_amount)}% used</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditingCategory(cat)
                          setBudgetAmount(cat.budget_amount > 0 ? cat.budget_amount.toString() : '')
                          setExpenseType(cat.expense_type)
                          setCycle(cat.cycle)
                          setRollover(cat.rollover)
                        }}
                        className="bg-violet-500/20 text-violet-500 px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-500/30 transition-all"
                      >
                        {cat.budget_id ? 'Edit' : 'Set Budget'}
                      </button>
                    </div>
                  </div>
                  {cat.budget_amount > 0 && (
                    <div className={`w-full rounded-full h-1.5 ${progressBg}`}>
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(cat.spent, cat.budget_amount)}`}
                        style={{ width: `${getPercentage(cat.spent, cat.budget_amount)}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {editingCategory && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`border rounded-2xl shadow-2xl p-6 w-full max-w-md ${modalBg}`}>
              <h2 className={`font-semibold text-lg mb-1 ${heading}`}>{editingCategory.budget_id ? 'Edit Budget' : 'Set Budget'}</h2>
              <p className={`text-sm mb-5 ${subtext}`}>{editingCategory.icon} {editingCategory.name}</p>
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium ${subtext}`}>Budget Amount</label>
                  <input type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`} placeholder="0.00" />
                </div>
                <div>
                  <label className={`text-sm font-medium ${subtext}`}>Expense Type</label>
                  <select value={expenseType} onChange={(e) => setExpenseType(e.target.value)} className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`}>
                    <option>Fixed</option>
                    <option>Variable</option>
                    <option>Discretionary</option>
                  </select>
                </div>
                <div>
                  <label className={`text-sm font-medium ${subtext}`}>Cycle</label>
                  <select value={cycle} onChange={(e) => setCycle(e.target.value)} className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`}>
                    <option>Monthly</option>
                    <option>Weekly</option>
                    <option>Yearly</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={rollover} onChange={(e) => setRollover(e.target.checked)} className="w-4 h-4 accent-violet-500" />
                  <label className={`text-sm ${subtext}`}>Rollover unused budget</label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSaveBudget} className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all">Save Budget</button>
                <button onClick={() => setEditingCategory(null)} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Budgets