// pages/profile.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { User, Mail, BookOpen, LogOut, Hash, Calendar, Edit2, Check, X } from 'lucide-react'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // States for editing name
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
         setProfile(data)
         setEditNameValue(data.full_name || '') // Initialize edit field
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveName() {
    if (!user || !editNameValue.trim()) return;
    setIsSaving(true);
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: editNameValue.trim() })
            .eq('id', user.id);

        if (error) throw error;
        
        // Update local state on success
        setProfile({ ...profile, full_name: editNameValue.trim() });
        setIsEditingName(false);
    } catch (error) {
        alert("Failed to update name. Please try again.");
        console.error(error);
    } finally {
        setIsSaving(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

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
      
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32"></div>
          
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6 flex justify-between items-end">
              <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg inline-block">
                 <img 
                   src={`https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=random&size=128`} 
                   className="w-full h-full rounded-full object-cover"
                 />
              </div>
               <div className="mb-2">
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                  {profile?.year || 'Unknown'} Year Student
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {/* EDITABLE NAME SECTION */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                <div className="flex items-center gap-3 mt-1 text-gray-900 text-2xl font-bold">
                  <User className="text-indigo-500 flex-shrink-0" size={24} />
                  
                  {isEditingName ? (
                    // EDIT MODE
                    <div className="flex items-center gap-2 w-full">
                        <input 
                           type="text" 
                           value={editNameValue}
                           onChange={(e) => setEditNameValue(e.target.value)}
                           className="border border-indigo-300 rounded px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                        />
                        <button onClick={saveName} disabled={isSaving} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition">
                            {isSaving ? <div className="animate-spin h-5 w-5 border-2 border-green-700 rounded-full border-t-transparent"></div> : <Check size={20}/>}
                        </button>
                        <button onClick={() => { setIsEditingName(false); setEditNameValue(profile?.full_name); }} disabled={isSaving} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition">
                            <X size={20} />
                        </button>
                    </div>
                  ) : (
                    // VIEW MODE
                    <div className="flex items-center gap-3 group w-full">
                        <span>{profile?.full_name || 'Student'}</span>
                        <button 
                           onClick={() => setIsEditingName(true)}
                           className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-indigo-600 p-1"
                           title="Edit Name"
                        >
                            <Edit2 size={18} />
                        </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">USN</label>
                  <div className="flex items-center gap-3 mt-1 text-gray-900 text-lg">
                    <Hash className="text-indigo-500 flex-shrink-0" size={20} />
                    <span className="font-mono font-bold">{profile?.usn || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                  <div className="flex items-center gap-3 mt-1 text-gray-900 text-lg truncate">
                    <Mail className="text-indigo-500 flex-shrink-0" size={20} />
                    <span className="truncate">{user?.email}</span>
                  </div>
                </div>
                
                 <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Department Branch</label>
                  <div className="flex items-center gap-3 mt-1 text-gray-900 text-lg font-medium leading-tight">
                    <BookOpen className="text-indigo-500 flex-shrink-0" size={20} />
                    {profile?.branch || 'Not Set'}
                  </div>
                </div>

                 <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date of Birth</label>
                  <div className="flex items-center gap-3 mt-1 text-gray-900 text-lg">
                    <Calendar className="text-indigo-500 flex-shrink-0" size={20} />
                    {profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}
                  </div>
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