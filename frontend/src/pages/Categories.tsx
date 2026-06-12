import { useState, useEffect } from 'react'
import Navbar from '../components/navbar'
import API from '../lib/api'
import { useTheme } from '../lib/ThemeContext'

function Categories() {
  const { theme } = useTheme()
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const [newSubName, setNewSubName] = useState('')
  const [addingSubFor, setAddingSubFor] = useState<number | null>(null)

  const bg = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#f0f2f7]'
  const card = theme === 'dark' ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-slate-100'
  const heading = theme === 'dark' ? 'text-white' : 'text-slate-800'
  const subtext = theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
  const input = theme === 'dark' ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
  const divider = theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'
  const subItem = theme === 'dark' ? 'hover:bg-slate-700/20' : 'hover:bg-slate-50'

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const res = await API.get('/categories/')
    setCategories(res.data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await API.post('/categories/', { name, icon })
    setShowForm(false)
    setName('')
    setIcon('')
    fetchCategories()
  }

  const handleDeleteCategory = async (id: number) => {
    await API.delete(`/categories/${id}`)
    fetchCategories()
  }

  const handleAddSubcategory = async (categoryId: number) => {
    if (!newSubName.trim()) return
    await API.post('/subcategories/', { name: newSubName, category_id: categoryId })
    setNewSubName('')
    setAddingSubFor(null)
    fetchCategories()
  }

  const handleDeleteSubcategory = async (subId: number) => {
    await API.delete(`/subcategories/${subId}`)
    fetchCategories()
  }

  return (
    <div className={`min-h-screen flex ${bg}`}>
      <Navbar />
      <div className="ml-56 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${heading}`}>Categories</h1>
            <p className={`${subtext} text-sm mt-1`}>Organise your spending</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all font-medium shadow-lg shadow-violet-500/20">
            + Add Category
          </button>
        </div>

        {showForm && (
          <div className={`rounded-2xl border p-6 mb-6 ${card}`}>
            <h2 className={`font-semibold text-base mb-5 ${heading}`}>New Category</h2>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1">
                <label className={`text-sm font-medium ${subtext}`}>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`} placeholder="Category name" required />
              </div>
              <div className="w-32">
                <label className={`text-sm font-medium ${subtext}`}>Icon</label>
                <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`} placeholder="🏠" />
              </div>
              <div className="flex items-end gap-2">
                <button type="submit" className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all font-medium">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className={`px-6 py-3 rounded-xl transition-all font-medium ${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {categories.map((cat: any) => (
            <div key={cat.id} className={`rounded-2xl border overflow-hidden ${card}`}>
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}>
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className={`font-semibold ${heading}`}>{cat.name}</p>
                    <p className={`text-xs ${subtext}`}>{cat.subcategories?.length || 0} subcategories</p>
                  </div>
                  <span className={`ml-2 text-sm ${subtext}`}>{expandedCategory === cat.id ? '▲' : '▼'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setAddingSubFor(addingSubFor === cat.id ? null : cat.id)} className="bg-violet-500/20 text-violet-500 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-violet-500/30 transition-all">
                    + Subcategory
                  </button>
                  <button onClick={() => handleDeleteCategory(cat.id)} className={`text-sm transition-all ${subtext} hover:text-rose-500`}>Delete</button>
                </div>
              </div>

              {addingSubFor === cat.id && (
                <div className={`px-5 pb-4 flex gap-3 border-t ${divider}`}>
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    className={`flex-1 mt-3 p-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm ${input}`}
                    placeholder="Subcategory name"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubcategory(cat.id)}
                  />
                  <button onClick={() => handleAddSubcategory(cat.id)} className="mt-3 bg-violet-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-violet-600 transition-all">Add</button>
                  <button onClick={() => setAddingSubFor(null)} className={`mt-3 px-4 py-2 rounded-xl text-sm transition-all ${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
                </div>
              )}

              {expandedCategory === cat.id && cat.subcategories?.length > 0 && (
                <div className={`border-t ${divider}`}>
                  {cat.subcategories.map((sub: any) => (
                    <div key={sub.id} className={`px-5 py-3 flex items-center justify-between transition-all ${subItem}`}>
                      <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
                        <span className={`text-sm ${subtext}`}>{sub.name}</span>
                      </div>
                      <button onClick={() => handleDeleteSubcategory(sub.id)} className={`text-xs transition-all ${subtext} hover:text-rose-500`}>Delete</button>
                    </div>
                  ))}
                </div>
              )}

              {expandedCategory === cat.id && (!cat.subcategories || cat.subcategories.length === 0) && (
                <div className={`border-t ${divider} px-5 py-3 text-sm ${subtext}`}>
                  No subcategories yet. Click + Subcategory to add one.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Categories