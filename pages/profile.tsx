// pages/profile.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import { useRouter } from 'next/router'

export default function Profile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form Fields
  const [fullName, setFullName] = useState('')
  const [year, setYear] = useState('1st Year')
  const [branch, setBranch] = useState('CSE')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('full_name, year, branch, avatar_url')
      .eq('id', user.id)
      .single()

    if (data) {
      setFullName(data.full_name || '')
      setYear(data.year || '1st Year')
      setBranch(data.branch || 'CSE')
      setAvatarUrl(data.avatar_url || '')
    }
    setLoading(false)
  }

  async function updateProfile() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName, 
          year, 
          branch, 
          avatar_url: avatarUrl 
        })
        .eq('id', user.id)

      if (error) alert('Error: ' + error.message)
      else alert('✅ Profile Updated! You can now post as ' + fullName)
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-indigo-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Edit Your Profile</h1>
            <p className="text-indigo-100">This is how you will appear in the Community feed.</p>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Avatar Preview */}
            <div className="flex items-center space-x-6">
              <img 
                src={avatarUrl || `https://ui-avatars.com/api/?name=${fullName || 'User'}&background=random`} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-sm"
              />
              <div className="flex-1">
                 <label className="block text-sm font-bold text-gray-700 mb-1">Avatar Image URL</label>
                 <input
                  type="text"
                  placeholder="https://example.com/my-photo.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
                <p className="text-xs text-gray-500 mt-1">Paste any image link (or leave empty for auto-initials).</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Preetham C G"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Branch</label>
                <select 
                  value={branch} 
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option>CSE</option>
                  <option>ISE</option>
                  <option>ECE</option>
                  <option>MECH</option>
                  <option>CIVIL</option>
                  <option>EEE</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Year</label>
              <div className="flex space-x-4">
                {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((y) => (
                  <label key={y} className={`flex-1 border rounded-lg p-3 text-center cursor-pointer transition ${year === y ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'hover:bg-gray-50'}`}>
                    <input type="radio" name="year" value={y} checked={year === y} onChange={(e) => setYear(e.target.value)} className="hidden" />
                    {y}
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={updateProfile}
              disabled={saving}
              className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-indigo-700 transform active:scale-95 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}