import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import { Send, CheckCircle, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function WriteGuide() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [userProfile, setUserProfile] = useState<any>(null)

  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic', 
    content: ''
  })

  // Fetch User Profile
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (profile) setUserProfile(profile)
      } else {
        router.push('/login')
      }
    }
    getUser()
  }, [router])

  async function handleSubmit(e: any) {
    e.preventDefault()
    if (!userProfile) return
    setLoading(true)
    setStatus('idle')

    const authorSignature = userProfile.full_name 
      ? `${userProfile.full_name} ${userProfile.branch ? `(${userProfile.branch})` : ''}`
      : 'Anonymous Senior';

    try {
      const { error } = await supabase.from('guides').insert([
        {
          title: formData.title,
          category: formData.category,
          content: formData.content,
          author: authorSignature,
          is_verified: false 
        }
      ])

      if (error) throw error
      setStatus('success')
      setFormData({ title: '', category: 'Academic', content: '' })

    } catch (error) {
      console.error('Error submitting guide:', error)
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <Link href="/guides" className="inline-flex items-center gap-1 text-gray-500 hover:text-indigo-600 font-bold mb-6 transition">
          <ChevronLeft size={20} /> Back to Guides
        </Link>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Write a Guide ✍️</h1>
            <p className="text-gray-500">Share your wisdom. We'll attach your name automatically.</p>
          </div>

          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in zoom-in">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Submission Received!</h3>
              <p className="text-gray-600 mb-6">Your guide has been sent for approval.</p>

              {/* Email Box */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block text-left mb-2 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Questions regarding approval?</p>
                  <p className="text-sm font-medium text-gray-700">
                      Email us at: <span className="font-bold select-all text-indigo-600">campuscompassqueries@gmail.com</span>
                  </p>
              </div>

              {/* Button (Fixed Alignment) */}
              <div className="mt-8">
                <button onClick={() => setStatus('idle')} className="text-indigo-600 font-bold hover:underline">
                  Write another guide
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-3">
                 <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                    {userProfile?.full_name?.[0] || 'U'}
                 </div>
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Posting as</p>
                    <p className="text-sm font-bold text-gray-900">
                        {userProfile?.full_name || 'Loading...'} 
                        <span className="text-gray-500 font-normal"> {userProfile?.branch ? `(${userProfile.branch})` : ''}</span>
                    </p>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                <input 
                  required type="text" placeholder="e.g., Best food spots near campus..."
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select 
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Academic">Academic</option>
                  <option value="Survival">Survival</option>
                  <option value="Food">Food</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Clubs">Clubs</option>
                  <option value="Career">Career</option>
                  <option value="Internships">Internships</option>
                  <option value="Tech">Tech</option>
                  <option value="Sports">Sports</option>
                  <option value="Projects">Projects</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Advice</label>
                <textarea 
                  required rows={6} placeholder="Share your experience..."
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                ></textarea>
              </div>

              <button disabled={loading || !userProfile} type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 transition flex justify-center items-center gap-2 disabled:opacity-50">
                {loading ? 'Sending...' : <><Send size={20} /> Submit Guide</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}