import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import { BookOpen, FileText, Download, Heart, Search, PenTool, FolderOpen } from 'lucide-react'
import Link from 'next/link'

// 📚 DATA: 1st Year Syllabus
const SYLLABUS: any = {
  'Physics Cycle': [
    'Applied Mathematics-I', 'Quantum Physics', 'Structured Programming in C',
    'Intro to Electrical Engg', 'Intro to Electronics & Comm', 'Intro to AI & Applications', 'Soft Skills'
  ],
  'Chemistry Cycle': [
    'Applied Mathematics-II', 'Applied Chemistry', 'Computer-Aided Engg Drawing',
    'Python Programming', 'Communication Skills', 'Indian Constitution & Ethics', 'Project-Based Learning'
  ]
}

export default function Guides() {
  const [activeTab, setActiveTab] = useState<'guides' | 'resources'>('guides')
  const [guides, setGuides] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // FILTERS
  const [selectedYear, setSelectedYear] = useState(1)
  const [selectedCycle, setSelectedCycle] = useState('Physics Cycle') 
  const [selectedBranch, setSelectedBranch] = useState('CSE') 

  const years = [1, 2, 3, 4]
  const branches = ['CSE', 'ISE', 'ECE', 'EEE', 'Mech', 'Civil'] 

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data: guidesData } = await supabase
      .from('guides').select('*').eq('is_verified', true).order('likes', { ascending: false })
    const { data: resData } = await supabase
      .from('resources').select('*').order('created_at', { ascending: false })

    if (guidesData) setGuides(guidesData)
    if (resData) setResources(resData)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-6">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-1">Student Hub</h1>
                <p className="text-gray-500 text-sm">Notes, PYQs & Senior Advice.</p>
            </div>
            {activeTab === 'guides' && (
                <Link href="/write-guide" className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition">
                    <PenTool size={14} /> Write Guide
                </Link>
            )}
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <button onClick={() => setActiveTab('guides')} className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${activeTab === 'guides' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
            <BookOpen size={18} /> Wiki
          </button>
          <button onClick={() => setActiveTab('resources')} className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${activeTab === 'resources' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
            <FileText size={18} /> Resources
          </button>
        </div>

        {/* --- RESOURCES FILTERS --- */}
        {activeTab === 'resources' && (
            <div className="mb-6 space-y-4">
                {/* Year Selector */}
                <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Year</span>
                    <div className="flex gap-2 mt-1 overflow-x-auto pb-1 scrollbar-hide">
                        {years.map(y => (
                            <button key={y} onClick={() => setSelectedYear(y)} className={`w-12 h-10 rounded-lg font-bold text-sm flex-shrink-0 transition border ${selectedYear === y ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                                {y}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Cycle / Branch Selector */}
                {selectedYear === 1 ? (
                   <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Cycle</span>
                      <div className="flex p-1 bg-gray-200 rounded-lg mt-1 w-full md:w-auto inline-flex">
                        {['Physics Cycle', 'Chemistry Cycle'].map(c => (
                          <button key={c} onClick={() => setSelectedCycle(c)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${selectedCycle === c ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                   </div>
                ) : (
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Branch</span>
                    <div className="flex gap-2 mt-1 overflow-x-auto pb-1 scrollbar-hide">
                        {branches.map(b => (
                            <button key={b} onClick={() => setSelectedBranch(b)} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap flex-shrink-0 transition border ${selectedBranch === b ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                                {b}
                            </button>
                        ))}
                    </div>
                  </div>
                )}
            </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
           <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
           <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition placeholder-gray-400"
             value={search} onChange={(e) => setSearch(e.target.value)}
           />
        </div>

        {/* CONTENT AREA */}
        {loading ? (
          <div className="grid gap-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse"/>)}</div>
        ) : (
          <div className="grid gap-4">
            
            {/* 🟢 TAB 1: GUIDES */}
            {activeTab === 'guides' && guides.filter(g => g.title.toLowerCase().includes(search.toLowerCase())).map(guide => (
              <Link href={`/guide/${guide.id}`} key={guide.id}>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-md">{guide.category}</span>
                    <div className="flex items-center gap-1 text-gray-400 text-xs font-bold"><Heart size={14} /> {guide.likes}</div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition">{guide.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{guide.content}</p>
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                        {guide.author[0]}
                    </div>
                    <span className="text-xs font-medium text-gray-500">{guide.author}</span>
                  </div>
                </div>
              </Link>
            ))}

            {/* 🟢 TAB 2: RESOURCES */}
            {activeTab === 'resources' && (
                selectedYear === 1 ? (
                  <div className="space-y-6">
                    {SYLLABUS[selectedCycle].map((subject: string) => {
                      const subjectResources = resources.filter(r => 
                        r.year === 1 && (r.subject?.toLowerCase() === subject.toLowerCase() || r.title.toLowerCase().includes(subject.toLowerCase()))
                      );

                      if (search && !subject.toLowerCase().includes(search.toLowerCase()) && subjectResources.length === 0) return null;

                      return (
                        <div key={subject} className="animate-in fade-in slide-in-from-bottom-2">
                          <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                             <FolderOpen size={14}/> {subject}
                          </h3>
                          {subjectResources.length > 0 ? (
                            <div className="grid gap-3">
                              {subjectResources.map(res => (
                                <div key={res.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${res.type === 'Notes' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
                                          {res.type === 'Notes' ? '📝' : '📄'}
                                        </div>
                                        <div>
                                          <h3 className="font-bold text-gray-900 text-sm">{res.title}</h3>
                                          <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{res.type}</span>
                                        </div>
                                    </div>
                                    <a href={res.link} target="_blank" rel="noreferrer" className="p-2.5 bg-gray-50 rounded-lg text-gray-400 hover:bg-indigo-600 hover:text-white transition">
                                      <Download size={18} />
                                    </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* --- EMPTY STATE FOR SUBJECT --- */
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                              <p className="text-gray-500 text-sm font-medium mb-1">No notes for {subject} yet.</p>
                              <p className="text-xs text-gray-400 mb-2">Please contribute if materials are available.</p>
                              <div className="inline-block bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 select-all">
                                <span className="font-bold">Email:</span> campuscompassqueries@gmail.com
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  /* --- HIGHER YEAR COMING SOON --- */
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🏗️</div>
                      <h3 className="text-lg font-bold text-gray-900">Work in Progress</h3>
                      <p className="text-gray-500 text-sm mt-1 mb-4">
                          Collecting resources for {selectedYear}nd Year {selectedBranch}.
                      </p>
                      <p className="text-xs text-gray-400 mb-2">Please contribute materials if available to:</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 inline-block">
                          <p className="text-sm font-mono text-indigo-600 font-bold select-all">campuscompassqueries@gmail.com</p>
                      </div>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </div>
  )
}