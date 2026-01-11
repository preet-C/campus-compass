// pages/index.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import NewQuestion from '../components/NewQuestion'
import QuestionCard from '../components/QuestionCard'
import { useRouter } from 'next/router'
import { Trophy, Clock, Search } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChannel, setActiveChannel] = useState('All')
  const [sortBy, setSortBy] = useState<'new' | 'top'>('new')
  const [search, setSearch] = useState('')
  const [userVotes, setUserVotes] = useState<any>({})
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const channels = [
    'All', 'General', 'CS Related', 'Electronics Related', 'Mechanical', 
    'Civil', 'Biotech', 'Industrial Management', 'Chemical'
  ]

  // 1. Unified Load Logic: Get User FIRST, then Questions
  const loadData = async () => {
    // A. Get User and Admin Status
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    // Check if user is admin
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      
      setIsAdmin(profile?.is_admin === true)
    } else {
      setIsAdmin(false)
    }

    // B. Get Questions
    let query = supabase
      .from('questions')
      .select(`
        *,
        profiles:author_id (full_name, year, branch, avatar_url),
        question_votes!left(user_id, vote_type),
        replies(count)
      `)
    
    if (activeChannel !== 'All') query = query.eq('channel', activeChannel)
    if (sortBy === 'new') query = query.order('created_at', { ascending: false })
    else query = query.order('upvotes', { ascending: false })

    const { data } = await query
    
    if (data) {
      setQuestions(data)
      
      // C. Sync Votes (Only if we have a user)
      if (user) {
        const votesMap: any = {}
        data.forEach((q: any) => {
          // Find the vote that belongs to THIS user
          const myVote = q.question_votes.find((v: any) => v.user_id === user.id)
          if (myVote) votesMap[q.id] = myVote.vote_type
        })
        setUserVotes(votesMap)
      }
    }
    setLoading(false)
  }

  // Reload when filters change or user navigates back
  useEffect(() => {
    loadData()
  }, [activeChannel, sortBy])

  useEffect(() => {
    const onFocus = () => loadData()
    window.addEventListener('focus', onFocus)
    router.events.on('routeChangeComplete', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      router.events.off('routeChangeComplete', onFocus)
    }
  }, [router, activeChannel, sortBy])

  async function handleVote(questionId: string, type: 'up' | 'down') {
    if (!currentUser) return alert('Please login to vote')

    const currentVote = userVotes[questionId]
    let change = 0
    let newType: 'up' | 'down' | null = type

    if (currentVote === type) {
      // Toggle OFF
      change = type === 'up' ? -1 : 1
      newType = null
    } else if (!currentVote) {
      // New Vote
      change = type === 'up' ? 1 : -1
    } else {
      // Switch Vote
      change = type === 'up' ? 2 : -2
    }
    
    // Optimistic Update
    setQuestions(qs => qs.map(q => q.id === questionId ? {...q, upvotes: q.upvotes + change} : q))
    setUserVotes((prev: any) => ({...prev, [questionId]: newType}))

    // Database Update
    if (newType) {
      await supabase.from('question_votes').upsert({
        user_id: currentUser.id,
        question_id: questionId,
        vote_type: newType
      }, { onConflict: 'user_id, question_id' })
    } else {
      await supabase.from('question_votes').delete().match({ user_id: currentUser.id, question_id: questionId })
    }
    await supabase.rpc('increment_vote', { q_id: questionId, value: change })
  }

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(search.toLowerCase()) || 
    q.details.toLowerCase().includes(search.toLowerCase())
  )

  // Handle question deletion (optimistic update)
  const handleDelete = (questionId: string) => {
    setQuestions(qs => qs.filter(q => q.id !== questionId))
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-6xl mx-auto w-full p-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* SIDEBAR */}
        <div className="hidden md:block col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 px-2">Channels</h3>
            <div className="space-y-1">
              {channels.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveChannel(c)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeChannel === c ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  # {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FEED */}
        <div className="col-span-1 md:col-span-3">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
             <div>
               <h1 className="text-2xl font-bold text-gray-900">{activeChannel} Discussions</h1>
               <p className="text-sm text-gray-500">Ask doubts, share notes, and connect.</p>
             </div>
             
             <div className="relative w-full md:w-64">
               <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
               <input 
                 className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                 placeholder="Search questions..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
          </div>
          
          <div className="flex bg-white w-fit rounded-lg border border-gray-200 p-1 mb-4">
            <button onClick={() => setSortBy('new')} className={`px-3 py-1 text-sm font-bold rounded flex items-center gap-1 ${sortBy === 'new' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}><Clock size={14} /> New</button>
            <button onClick={() => setSortBy('top')} className={`px-3 py-1 text-sm font-bold rounded flex items-center gap-1 ${sortBy === 'top' ? 'bg-orange-50 text-orange-600' : 'text-gray-500'}`}><Trophy size={14} /> Top</button>
          </div>

          <NewQuestion onPost={loadData} />

          {loading ? <p className="text-center py-10 text-gray-400">Loading...</p> : (
            <div className="space-y-4">
              {filteredQuestions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  userVote={userVotes[q.id] || null}
                  isAdmin={isAdmin}
                  onVote={handleVote}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}