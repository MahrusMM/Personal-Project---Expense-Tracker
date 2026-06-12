import { useState, useEffect } from 'react'
import Navbar from '../components/navbar'
import API from '../lib/api'
import { useTheme } from '../lib/ThemeContext'

function Expenses() {
  const { theme } = useTheme()
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const bg = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#f0f2f7]'
  const card = theme === 'dark' ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-slate-100'
  const heading = theme === 'dark' ? 'text-white' : 'text-slate-800'
  const subtext = theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
  const input = theme === 'dark' ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
  const row = theme === 'dark' ? 'border-slate-700/30 hover:bg-slate-700/20' : 'border-slate-100 hover:bg-slate-50'
  const tableHead = theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'

  useEffect(() => {
    fetchExpenses()
    fetchCategories()
  }, [])

  const fetchExpenses = async () => {
    const res = await API.get('/expenses/')
    setExpenses(res.data)
  }

  const fetchCategories = async () => {
    const res = await API.get('/categories/')
    setCategories(res.data)
  }

  const handleCategoryChange = async (catId: string) => {
    setCategoryId(catId)
    setSubcategoryId('')
    if (catId) {
      const res = await API.get(`/subcategories/category/${catId}`)
      setSubcategories(res.data)
    } else {
      setSubcategories([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await API.post('/expenses/', {
      amount: parseFloat(amount),
      category_id: parseInt(categoryId),
      subcategory_id: subcategoryId ? parseInt(subcategoryId) : null,
      notes,
      date: new Date(date).toISOString()
    })
    setShowForm(false)
    setAmount('')
    setCategoryId('')
    setSubcategoryId('')
    setNotes('')
    setDate(new Date().toISOString().split('T')[0])
    fetchExpenses()
  }

  const handleDelete = async (id: number) => {
    await API.delete(`/expenses/${id}`)
    fetchExpenses()
  }

  return (
    <div className={`min-h-screen flex ${bg}`}>
      <Navbar />
      <div className="ml-56 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${heading}`}>Expenses</h1>
            <p className={`${subtext} text-sm mt-1`}>Track your spending</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all font-medium shadow-lg shadow-rose-500/20"
          >
            + Add Expense
          </button>
        </div>

        {showForm && (
          <div className={`rounded-2xl border p-6 mb-6 ${card}`}>
            <h2 className={`font-semibold text-base mb-5 ${heading}`}>New Expense</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className={`text-sm font-medium ${subtext}`}>Amount</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`} placeholder="0.00" required />
              </div>
              <div>
                <label className={`text-sm font-medium ${subtext}`}>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`} />
              </div>
              <div>
                <label className={`text-sm font-medium ${subtext}`}>Category</label>
                <select value={categoryId} onChange={(e) => handleCategoryChange(e.target.value)} className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`} required>
                  <option value="">Select category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`text-sm font-medium ${subtext}`}>Subcategory</label>
                <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)} className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`}>
                  <option value="">Select subcategory (optional)</option>
                  {subcategories.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className={`text-sm font-medium ${subtext}`}>Notes</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`} placeholder="Optional notes" />
              </div>
              <div className="col-span-2 flex gap-3">
                <button type="submit" className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-all font-medium">Save Expense</button>
                <button type="button" onClick={() => setShowForm(false)} className={`px-6 py-2.5 rounded-xl transition-all font-medium ${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          {expenses.length === 0 ? (
            <div className={`p-12 text-center ${subtext}`}>No expenses yet. Add your first one!</div>
          ) : (
            <table className="w-full">
              <thead className={`border-b ${tableHead}`}>
                <tr>
                  <th className={`text-left p-4 text-xs font-medium uppercase tracking-wide ${subtext}`}>Subcategory</th>
                  <th className={`text-left p-4 text-xs font-medium uppercase tracking-wide ${subtext}`}>Category</th>
                  <th className={`text-left p-4 text-xs font-medium uppercase tracking-wide ${subtext}`}>Date</th>
                  <th className={`text-right p-4 text-xs font-medium uppercase tracking-wide ${subtext}`}>Amount</th>
                  <th className={`text-right p-4 text-xs font-medium uppercase tracking-wide ${subtext}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense: any) => (
                  <tr key={expense.id} className={`border-b transition-all ${row}`}>
                    <td className={`p-4 font-medium ${heading}`}>{expense.subcategory?.name || '-'}</td>
                    <td className={`p-4 text-sm ${subtext}`}>{expense.category?.name}</td>
                    <td className={`p-4 text-sm ${subtext}`}>{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="p-4 text-right font-bold text-rose-500">${expense.amount.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(expense.id)} className={`text-sm transition-all ${subtext} hover:text-rose-500`}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Expenses