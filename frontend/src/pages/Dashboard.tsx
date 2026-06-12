import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/navbar'
import API from '../lib/api'
import { useTheme } from '../lib/ThemeContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

function Dashboard() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [dashboard, setDashboard] = useState({
    total_expenses: 0,
    total_income: 0,
    total_budget: 0,
    available: 0,
    expense_percentage: 0
  })
  const [monthly, setMonthly] = useState([])
  const [loading, setLoading] = useState(true)

  const bg = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#f0f2f7]'
  const card = theme === 'dark' ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-slate-100'
  const heading = theme === 'dark' ? 'text-white' : 'text-slate-800'
  const subtext = theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
  const circleTrack = theme === 'dark' ? '#1e3a5f' : '#e2e8f0'
  const remainingBg = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-slate-50'

  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, monthlyRes] = await Promise.all([
          API.get('/reports/dashboard'),
          API.get('/reports/monthly')
        ])
        setDashboard(dashRes.data)
        setMonthly(monthlyRes.data)
      } catch (err) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const chartData = {
    labels: monthly.map((m: any) => m.month),
    datasets: [
      {
        label: 'Income',
        data: monthly.map((m: any) => m.total_income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
        borderWidth: 2.5,
      },
      {
        label: 'Expenses',
        data: monthly.map((m: any) => m.total_expenses),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#f43f5e',
        borderWidth: 2.5,
      },
      {
        label: 'Budget',
        data: monthly.map(() => dashboard.total_budget),
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        tension: 0,
        fill: false,
        borderDash: [6, 4],
        pointRadius: 0,
        borderWidth: 2,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 },
          color: theme === 'dark' ? '#94a3b8' : '#64748b'
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
        titleColor: theme === 'dark' ? '#fff' : '#1e293b',
        bodyColor: theme === 'dark' ? '#cbd5e1' : '#64748b',
        padding: 12,
        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' }
      }
    }
  }

  const percentage = Math.min(Math.round(dashboard.expense_percentage), 100)

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-sm ${subtext}`}>Loading your finances...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex ${bg}`}>
      <Navbar />
      <div className="ml-56 flex-1 p-8">

        {/* header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${heading}`}>Dashboard</h1>
            <p className={`text-sm mt-1 ${subtext}`}>{date}</p>
          </div>
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl px-5 py-3 shadow-lg">
            <p className="text-violet-200 text-xs uppercase tracking-wide">Net Balance</p>
            <p className="text-white text-xl font-bold">${dashboard.available.toFixed(2)}</p>
          </div>
        </div>

        {/* 3 tiles */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div
            onClick={() => navigate('/expenses')}
            className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-200 shadow-lg shadow-rose-500/20"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-rose-100 text-sm font-medium">Total Expenses</p>
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm">↑</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">${dashboard.total_expenses.toFixed(2)}</p>
            <p className="text-rose-200 text-xs mt-2">This month</p>
          </div>

          <div
            onClick={() => navigate('/income')}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-200 shadow-lg shadow-emerald-500/20"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-emerald-100 text-sm font-medium">Total Income</p>
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm">↓</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">${dashboard.total_income.toFixed(2)}</p>
            <p className="text-emerald-200 text-xs mt-2">This month</p>
          </div>

          <div
            onClick={() => navigate('/budgets')}
            className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-200 shadow-lg shadow-violet-500/20"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-violet-100 text-sm font-medium">Total Budget</p>
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm">◎</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">${dashboard.total_budget.toFixed(2)}</p>
            <p className="text-violet-200 text-xs mt-2">This month</p>
          </div>
        </div>

        {/* bottom section */}
        <div className="grid grid-cols-2 gap-6">
          <div className={`rounded-2xl p-6 border ${card}`}>
            <div className="mb-6">
              <h2 className={`font-semibold text-base ${heading}`}>Cash Flow</h2>
              <p className={`text-xs mt-0.5 ${subtext}`}>Last 6 months</p>
            </div>
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className={`rounded-2xl p-6 border flex flex-col items-center justify-center ${card}`}>
            <p className={`text-sm font-medium mb-6 ${subtext}`}>Budget Used</p>
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke={circleTrack} strokeWidth="10"/>
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke={percentage >= 90 ? '#f43f5e' : percentage >= 70 ? '#f59e0b' : '#6366f1'}
                  strokeWidth="10"
                  strokeDasharray={`${percentage * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className={`text-3xl font-bold ${heading}`}>{percentage}%</span>
              </div>
            </div>
            <div className={`w-full rounded-2xl p-4 text-center ${remainingBg}`}>
              <p className={`text-xs mb-1 ${subtext}`}>Remaining Budget</p>
              <p className={`text-2xl font-bold ${dashboard.available >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                ${dashboard.available.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard