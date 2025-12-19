// components/NewQuestion.tsx
import { useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

export default function NewQuestion({ onPost }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [channel, setChannel] = useState('General')
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const channels = [
    'General', 'CS Related', 'Electronics Related', 'Mechanical', 
    'Civil', 'Biotech', 'Industrial Management', 'Chemical'
  ]

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('Please login first')

    let imageUrl = null

    // 1. Upload Image if selected
    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`
      const { data, error } = await supabase.storage
        .from('questions')
        .upload(fileName, imageFile)
      
      if (data) {
        imageUrl = supabase.storage.from('questions').getPublicUrl(fileName).data.publicUrl
      }
    }

    // 2. Insert Question
    const { error } = await supabase.from('questions').insert({
      title,
      details,
      channel, // Save the selected channel
      image_url: imageUrl,
      author_id: user.id,
      upvotes: 0
    })

    if (!error) {
      setIsOpen(false)
      setTitle('')
      setDetails('')
      setImageFile(null)
      onPost() // Refresh feed
    } else {
      alert(error.message)
    }
    setLoading(false)
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-left text-gray-400 hover:bg-gray-50 transition flex items-center gap-3"
      >
        <span className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 font-bold">+</span>
        Ask a doubt or share something...
      </button>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-6 relative animate-in fade-in slide-in-from-top-4">
      <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
        <X size={20} />
      </button>
      
      <h2 className="font-bold text-xl mb-4 text-gray-800">Create Post</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Channel Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Channel</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            {channels.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <input 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-800"
          placeholder="Title (e.g., How to prepare for C-Cycle exams?)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        
        <textarea 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32"
          placeholder="Describe your doubt in detail..."
          value={details}
          onChange={e => setDetails(e.target.value)}
          required
        />

        {/* Image Upload Preview */}
        {imageFile && (
          <div className="relative w-fit">
            <img src={URL.createObjectURL(imageFile)} className="h-24 rounded-lg border border-gray-200" />
            <button 
              type="button" 
              onClick={() => setImageFile(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-indigo-600 flex items-center gap-2 text-sm font-medium"
          >
            <ImageIcon size={18} /> Add Image
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
          />

          <button 
            type="submit" 
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Question'}
          </button>
        </div>
      </form>
    </div>
  )
}