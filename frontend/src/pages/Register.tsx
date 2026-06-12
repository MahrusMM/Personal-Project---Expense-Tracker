import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import logo from '../assets/logo.png'
import { useTheme } from '../lib/ThemeContext'

function Register() {
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const bg = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#f0f2f7]'
  const card = theme === 'dark' ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-slate-100'
  const input = theme === 'dark' ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
  const subtext = theme === 'dark' ? 'text-slate-400' : 'text-slate-500'

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:8000/auth/register', {
        email,
        username,
        password
      })
      navigate('/login')
    } catch (err) {
      setError('Registration failed. Email or username already taken.')
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${bg}`}>
      <div className={`border rounded-2xl shadow-2xl p-8 w-full max-w-md ${card}`}>
        <img src={logo} className="w-36 mx-auto mb-6 object-contain" />
        <p className={`text-center mb-8 text-sm ${subtext}`}>Create your account</p>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className={`text-sm font-medium ${subtext}`}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`}
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className={`text-sm font-medium ${subtext}`}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`}
              placeholder="Choose a username"
            />
          </div>
          <div>
            <label className={`text-sm font-medium ${subtext}`}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`}
              placeholder="Choose a password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white p-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-violet-500/20"
          >
            Create Account
          </button>
        </form>

        <p className={`text-center text-sm mt-6 ${subtext}`}>
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 font-medium hover:text-violet-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register