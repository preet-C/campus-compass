// components/QuestionCard.tsx
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, ArrowBigUp, ArrowBigDown, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

interface QuestionCardProps {
  question: any
  userVote: 'up' | 'down' | null
  isAdmin: boolean
  onVote: (questionId: string, type: 'up' | 'down') => void
  onDelete: (questionId: string) => void
}

export default function QuestionCard({ question, userVote, isAdmin, onVote, onDelete }: QuestionCardProps) {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return
    }

    try {
      // Delete related data first (votes and replies)
      await supabase.from('question_votes').delete().eq('question_id', question.id)
      await supabase.from('replies').delete().eq('question_id', question.id)
      
      // Delete the question
      const { error } = await supabase.from('questions').delete().eq('id', question.id)
      
      if (error) throw error
      
      // Call the parent's onDelete callback to update the UI
      onDelete(question.id)
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question. Please try again.')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex overflow-hidden hover:border-gray-300 transition group relative">
      {/* Admin Delete Button */}
      {isAdmin && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 z-10 p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete question (Admin only)"
        >
          <Trash2 size={16} />
        </button>
      )}

      {/* Vote Sidebar */}
      <div className="w-12 bg-gray-50 border-r border-gray-100 flex flex-col items-center py-3 gap-1">
        <button 
          onClick={() => onVote(question.id, 'up')} 
          className={`p-1 rounded hover:bg-gray-200 ${userVote === 'up' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <ArrowBigUp size={24} fill={userVote === 'up' ? "currentColor" : "none"} />
        </button>
        <span className={`text-sm font-bold ${userVote === 'up' ? 'text-orange-600' : userVote === 'down' ? 'text-blue-600' : 'text-gray-700'}`}>
          {question.upvotes || 0}
        </span>
        <button 
          onClick={() => onVote(question.id, 'down')} 
          className={`p-1 rounded hover:bg-gray-200 ${userVote === 'down' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <ArrowBigDown size={24} fill={userVote === 'down' ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex-1 p-4">
        <div className="flex items-center text-xs mb-2">
          <span className="font-bold text-gray-900 mr-2">{question.profiles?.full_name || 'Anonymous'}</span>
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded text-[10px] font-medium mr-2">
            {question.profiles?.branch || 'Student'} • {question.profiles?.year || '1st'} Year
          </span>
          <span className="text-gray-400">• {formatDistanceToNow(new Date(question.created_at))} ago</span>
          <span className="ml-auto bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
            {question.channel}
          </span>
        </div>

        <Link href={`/questions/${question.id}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-indigo-600 cursor-pointer">{question.title}</h3>
        </Link>
        <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-3">{question.details}</p>
        
        {question.image_url && (
          <img src={question.image_url} className="h-48 rounded-lg object-cover border border-gray-200 mb-3" alt="Question attachment" />
        )}

        <div className="flex items-center gap-4 text-gray-500 text-xs font-bold">
          <Link 
            href={`/questions/${question.id}`} 
            className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition"
          >
            <MessageSquare size={16} /> 
            <span>{question.replies && question.replies[0] ? question.replies[0].count : 0} Replies</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
