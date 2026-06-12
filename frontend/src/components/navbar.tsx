import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useTheme } from '../lib/ThemeContext'

import dashboardGrey from '../assets/dashboard-icon-grey.png'
import dashboardBlue from '../assets/dashboard-icon-blue.png'
import expensesGrey from '../assets/expenses-icon-grey.png'
import expensesBlue from '../assets/expenses-icon-blue.png'
import incomeGrey from '../assets/income-icon-grey.png'
import incomeBlue from '../assets/income-icon-blue.png'
import categoriesGrey from '../assets/categories-icon-grey.png'
import categoriesBlue from '../assets/categories-icon-blue.png'
import budgetsGrey from '../assets/budgets-icon-grey.png'
import budgetsBlue from '../assets/budgets-icon-blue.png'
import reportsGrey from '../assets/reports-icon-grey.png'
import reportsBlue from '../assets/reports-icon-blue.png'
import logoutGrey from '../assets/logout-icon-grey.png'
import logoutBlue from '../assets/logout-icon-blue.png'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const navItems = [
    { path: '/', label: 'Dashboard', grey: dashboardGrey, blue: dashboardBlue },
    { path: '/expenses', label: 'Expenses', grey: expensesGrey, blue: expensesBlue },
    { path: '/income', label: 'Income', grey: incomeGrey, blue: incomeBlue },
    { path: '/categories', label: 'Categories', grey: categoriesGrey, blue: categoriesBlue },
    { path: '/budgets', label: 'Budgets', grey: budgetsGrey, blue: budgetsBlue },
    { path: '/reports', label: 'Reports', grey: reportsGrey, blue: reportsBlue },
  ]

  return (
    <div className={`fixed left-0 top-0 h-full w-56 border-r flex flex-col py-6 px-4 ${
      theme === 'dark'
        ? 'bg-[#1e293b] border-slate-700/50'
        : 'bg-white border-slate-100'
    }`}>
      <div className="px-2 mb-8">
        <img src={logo} className="w-32 object-contain" />
      </div>

      <nav className="flex flex-col space-y-1 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
              isActive(item.path)
                ? 'bg-violet-500/20 text-violet-500'
                : theme === 'dark'
                  ? 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <img
              src={isActive(item.path) ? item.blue : item.grey}
              className="w-5 h-5 group-hover:hidden"
            />
            <img
              src={item.blue}
              className="w-5 h-5 hidden group-hover:block"
            />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={`border-t pt-4 space-y-1 ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'}`}>

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl transition-all group text-left ${
            theme === 'dark'
              ? 'text-slate-400 hover:bg-rose-500/10 hover:text-rose-400'
              : 'text-slate-500 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <img src={logoutGrey} className="w-5 h-5 group-hover:hidden" />
          <img src={logoutBlue} className="w-5 h-5 hidden group-hover:block" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Navbar