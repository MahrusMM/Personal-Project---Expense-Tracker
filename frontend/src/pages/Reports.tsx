import { useState, useEffect } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import Navbar from '../components/navbar'
import API from '../lib/api'
import { useTheme } from '../lib/ThemeContext'

ChartJS.register(ArcElement, Tooltip, Legend)

function Reports() {
  const { theme } = useTheme()
  const [categoryData, setCategoryData] = useState([])
  const [summary, setSummary] = useState<any>(null)

  const bg = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#f0f2f7]'
  const card = theme === 'dark' ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-slate-100'
  const heading = theme === 'dark' ? 'text-white' : 'text-slate-800'
  const subtext = theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
  const summaryCard = theme === 'dark' ? 'bg-[#0f172a] border-slate-700/30' : 'bg-slate-50 border-slate-100'

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, sumRes] = await Promise.all([
        API.get('/reports/by-category'),
        API.get('/reports/summary')
      ])
      setCategoryData(catRes.data)
      setSummary(sumRes.data)
    }
    fetchData()
  }, [])

  const donutData = {
    labels: categoryData.map((c: any) => c.category_name),
    datasets: [{
      data: categoryData.map((c: any) => c.total_amount),
      backgroundColor: ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#a855f7'],
      borderWidth: 0,
    }]
  }

  const summaryRows = summary ? [
    { label: 'Today', expenses: summary.day_expenses, income: summary.day_income },
    { label: 'This Week', expenses: summary.week_expenses, income: summary.week_income },
    { label: 'This Month', expenses: summary.month_expenses, income: summary.month_income },
    { label: 'This Year', expenses: summary.year_expenses, income: summary.year_income },
  ] : []

  return (
    <div className={`min-h-screen flex ${bg}`}>
      <Navbar />
      <div className="ml-56 flex-1 p-8">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${heading}`}>Reports</h1>
          <p className={`${subtext} text-sm mt-1`}>Insights into your finances</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className={`rounded-2xl border p-6 ${card}`}>
            <h2 className={`font-semibold text-base mb-6 ${heading}`}>Spending by Category</h2>
            {categoryData.length > 0 ? (
              <div className="w-64 mx-auto">
                <Doughnut data={donutData} options={{
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        color: theme === 'dark' ? '#94a3b8' : '#64748b',
                        padding: 16,
                        usePointStyle: true,
                        font: { size: 12 }
                      }
                    }
                  }
                }} />
              </div>
            ) : (
              <div className={`text-center py-12 ${subtext}`}>No data yet</div>
            )}
          </div>

          <div className={`rounded-2xl border p-6 ${card}`}>
            <h2 className={`font-semibold text-base mb-6 ${heading}`}>Quick Summary</h2>
            <div className="space-y-2">
              {summaryRows.map((row) => (
                <div key={row.label} className={`flex justify-between items-center p-4 rounded-xl border ${summaryCard}`}>
                  <span className={`font-medium text-sm ${heading}`}>{row.label}</span>
                  <div className="flex gap-6">
                    <div className="text-right">
                      <p className={`text-xs mb-0.5 ${subtext}`}>Income</p>
                      <p className="text-emerald-500 font-bold text-sm">${row.income.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs mb-0.5 ${subtext}`}>Expenses</p>
                      <p className="text-rose-500 font-bold text-sm">${row.expenses.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports