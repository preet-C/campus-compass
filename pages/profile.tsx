// pages/profile.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { User, Mail, BookOpen, LogOut } from 'lucide-react'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  // 1. ADD LOADING STATE (Start as true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    try {
      setLoading(true)
      // 2. Get the current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Only redirect if we are SURE there is no user
        router.push('/login')
        return
      }

      setUser(user)

      // 3. Get extra profile details (Year, Branch)
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      // 4. STOP LOADING (Reveal the page)
      setLoading(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // 5. SHOW SPINNER WHILE CHECKING (Instead of kicking user out)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-indigo-600 h-32"></div>
          
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg inline-block">
                 <img 
                   src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=random`} 
                   className="w-full h-full rounded-full object-cover"
                 />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                <div className="flex items-center gap-3 mt-1 text-gray-900 text-lg font-bold">
                  <User className="text-indigo-500" size={20} />
                  {profile?.full_name || 'Student'}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                <div className="flex items-center gap-3 mt-1 text-gray-900 text-lg">
                  <Mail className="text-indigo-500" size={20} />
                  {user?.email}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Branch</label>
                  <div className="flex items-center gap-3 mt-1 text-gray-900 text-lg font-bold">
                    <BookOpen className="text-indigo-500" size={20} />
                    {profile?.branch || 'Not Set'}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Year</label>
                  <p className="mt-1 text-gray-900 text-lg font-bold">{profile?.year || '1st'} Year</p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={signOut}
                className="flex items-center gap-2 text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}