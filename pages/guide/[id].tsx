import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import { useRouter } from 'next/router'
import { ChevronLeft, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function GuideDetail() {
  const router = useRouter()
  const { id } = router.query
  const [guide, setGuide] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchGuide()
  }, [id])

  async function fetchGuide() {
    const { data } = await supabase
      .from('guides')
      .select('*')
      .eq('id', id)
      .single()
    
    if (data) setGuide(data)
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>
  if (!guide) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Guide not found.</div>

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-6">
        {/* Back Button */}
        <Link href="/guides" className="inline-flex items-center gap-1 text-gray-500 hover:text-indigo-600 font-bold mb-6 transition">
          <ChevronLeft size={20} /> Back to Hub
        </Link>

        {/* Article Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-10">
            
            {/* Header Section */}
            <div className="p-6 md:p-10 border-b border-gray-100 bg-gray-50/50">
                <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase rounded-full">
                        {guide.category}
                    </span>
                    {guide.cycle && (
                        <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold uppercase rounded-full">
                            {guide.cycle}
                        </span>
                    )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">
                    {guide.title}
                </h1>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                            {guide.author[0]}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{guide.author}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar size={12} /> {new Date(guide.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-10 text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                {guide.content}
            </div>
            
            {/* Footer removed as per request */}
        </div>
      </div>
    </div>
  )
}