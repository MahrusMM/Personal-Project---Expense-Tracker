import { useTheme } from '../lib/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`fixed bottom-6 right-6 z-50 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${
        theme === 'dark'
          ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400'
          : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
      }`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

export default ThemeToggle