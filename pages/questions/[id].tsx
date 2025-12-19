// pages/questions/[id].tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, ArrowBigUp, ArrowBigDown, Send } from 'lucide-react'

export default function QuestionDetail() {
  const router = useRouter()
  const { id } = router.query
  const [question, setQuestion] = useState<any>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [newReply, setNewReply] = useState('')
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  const [loading, setLoading] = useState(true)

  // Load data whenever ID is available
  useEffect(() => {
    if (id) fetchData()
  }, [id])

  async function fetchData() {
    setLoading(true)
    
    // 1. Fetch Question
    const { data: qData, error: qError } = await supabase
      .from('questions')
      .select('*, profiles:author_id(full_name, year, branch, avatar_url)')
      .eq('id', id)
      .single()

    if (qError) console.error("Error loading question:", qError)

    // 2. Fetch Replies (Now that SQL is fixed, this will work!)
    const { data: rData, error: rError } = await supabase
      .from('replies')
      .select('*, profiles!left(full_name, year, branch, avatar_url)')
      .eq('question_id', id)
      .order('created_at', { ascending: true })

    if (rError) console.error("Error loading replies:", rError)

    if (qData) {
      setQuestion(qData)
      // 3. Fetch User Vote
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
         const { data: vData } = await supabase
           .from('question_votes')
           .select('vote_type')
           .eq('question_id', id)
           .eq('user_id', user.id)
           .maybeSingle()
         
         if (vData) setVote(vData.vote_type)
      }
    }
    
    if (rData) setReplies(rData)
    setLoading(false)
  }

  async function handleVote(type: 'up' | 'down') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('Please login to vote')
    
    let change = 0
    let newType: 'up' | 'down' | null = type

    if (vote === type) {
      change = type === 'up' ? -1 : 1
      newType = null
    } else if (!vote) {
      change = type === 'up' ? 1 : -1
    } else {
      change = type === 'up' ? 2 : -2
    }

    setQuestion((prev: any) => ({ ...prev, upvotes: prev.upvotes + change }))
    setVote(newType)

    if (newType) {
      await supabase.from('question_votes').upsert({
        user_id: user.id,
        question_id: id,
        vote_type: newType
      }, { onConflict: 'user_id, question_id' })
    } else {
      await supabase.from('question_votes').delete().match({ user_id: user.id, question_id: id })
    }
    await supabase.rpc('increment_vote', { q_id: id, value: change })
  }

  // 🧠 FIXED: Check login status INSIDE the function
  async function postReply(e: any) {
    e.preventDefault()
    if (!newReply.trim()) return

    // Get fresh user data immediately
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('You are not logged in! Please go to Profile and Login.')
      return
    }

    // Optimistic UI Update
    const optimisticReply = {
      id: Math.random(),
      content: newReply,
      created_at: new Date().toISOString(),
      profiles: {
         full_name: 'You',
         year: '...',
         branch: '...'
      }
    }
    setReplies([...replies, optimisticReply])
    setNewReply('')

    const { error } = await supabase.from('replies').insert({
      question_id: id,
      user_id: user.id,
      content: newReply
    })

    if (!error) {
      fetchData() // Refresh list to confirm save
    } else {
      console.error(error)
      alert('Error: ' + error.message)
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-100 p-10 text-center">Loading...</div>
  if (!question) return <div className="min-h-screen bg-gray-100 p-10 text-center">Question not found</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-4 text-sm font-bold">
          <ArrowLeft size={16} className="mr-1" /> Back to Feed
        </Link>

        {/* QUESTION CARD */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex mb-6">
          <div className="w-14 bg-gray-50 border-r border-gray-100 flex flex-col items-center py-4 gap-2">
             <button onClick={() => handleVote('up')} className={`p-1 rounded hover:bg-gray-200 ${vote === 'up' ? 'text-orange-600' : 'text-gray-400'}`}>
                <ArrowBigUp size={32} fill={vote === 'up' ? "currentColor" : "none"} />
             </button>
             <span className={`text-lg font-bold ${vote === 'up' ? 'text-orange-600' : vote === 'down' ? 'text-blue-600' : 'text-gray-800'}`}>
                {question.upvotes}
             </span>
             <button onClick={() => handleVote('down')} className={`p-1 rounded hover:bg-gray-200 ${vote === 'down' ? 'text-blue-600' : 'text-gray-400'}`}>
                <ArrowBigDown size={32} fill={vote === 'down' ? "currentColor" : "none"} />
             </button>
          </div>

          <div className="p-6 flex-1">
             <div className="flex items-center text-sm mb-3">
                <span className="font-bold text-gray-900 mr-2">{question.profiles?.full_name || 'Anonymous'}</span>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-xs font-bold mr-2">
                  {question.profiles?.branch || 'General'} • {question.profiles?.year || '1st'} Year
                </span>
                <span className="text-gray-400 text-xs">• {formatDistanceToNow(new Date(question.created_at))} ago</span>
             </div>

             <h1 className="text-2xl font-extrabold text-gray-900 mb-4">{question.title}</h1>
             <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap mb-6">{question.details}</p>
             {question.image_url && (
               <img src={question.image_url} className="rounded-xl border border-gray-200 max-h-96 object-cover mb-4" />
             )}
          </div>
        </div>

        {/* REPLIES LIST */}
        <div className="mb-6">
           <h3 className="text-gray-500 font-bold uppercase text-xs mb-4 px-2">{replies.length} Answers</h3>
           
           <div className="space-y-4">
             {replies.length === 0 && <p className="text-gray-400 italic px-2">No replies yet. Be the first!</p>}
             
             {replies.map((r, i) => (
               <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-in fade-in">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="font-bold text-gray-900 text-sm">
                        {r.profiles ? r.profiles.full_name : 'Anonymous Student'}
                     </span>
                     {r.profiles && (
                       <span className="bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                         {r.profiles.branch || 'Student'} • {r.profiles.year || '1st'} Year
                       </span>
                     )}
                     <span className="text-xs text-gray-400 ml-auto">
                        {r.created_at ? formatDistanceToNow(new Date(r.created_at)) : 'Just now'} ago
                     </span>
                  </div>
                  <p className="text-gray-800">{r.content}</p>
               </div>
             ))}
           </div>
        </div>

        {/* INPUT FORM */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 sticky bottom-4 shadow-lg">
          <form onSubmit={postReply} className="flex gap-2">
             <input 
               className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition"
               placeholder="Add a comment..."
               value={newReply}
               onChange={e => setNewReply(e.target.value)}
             />
             <button type="submit" className="bg-indigo-600 text-white px-6 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center gap-2">
                <Send size={18} /> Post
             </button>
          </form>
        </div>
      </div>
    </div>
  )
}