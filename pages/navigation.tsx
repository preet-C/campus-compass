// pages/navigation.tsx
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import dynamic from 'next/dynamic'
import { Search, Navigation as NavIcon, ChevronLeft, MapPin } from 'lucide-react'
import Image from 'next/image'

// Dynamic imports
const RouteMap = dynamic(() => import('../components/RouteMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-900 animate-pulse flex items-center justify-center text-gray-500">Loading Map...</div>
})

const Map = dynamic(() => import('../components/Map'), { ssr: false })

export default function Navigation() {
  const [buildings, setBuildings] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null)

  const [isNavigating, setIsNavigating] = useState(false)
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null)
  const [loadingLoc, setLoadingLoc] = useState(false)

  useEffect(() => { fetchBuildings() }, [])

  async function fetchBuildings() {
    // Fetch all buildings, ordered alphabetically by name
    const { data } = await supabase.from('buildings').select('*').order('name', { ascending: true })
    if (data) setBuildings(data)
  }

  // 🧠 SMART LOGIC: Automatically find all unique categories from the database data
  const uniqueCategories = useMemo(() => {
    const cats = buildings.map(b => b.category).filter(Boolean) // Get all categories
    return ['All', ...Array.from(new Set(cats))].sort() // Remove duplicates and sort
  }, [buildings])

  const startNavigation = () => {
    setLoadingLoc(true)
    if (!navigator.geolocation) {
      alert('Geolocation is not supported')
      setLoadingLoc(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLoc({ lat: position.coords.latitude, lng: position.coords.longitude })
        setIsNavigating(true)
        setLoadingLoc(false)
      },
      () => { alert('Location access denied. Please enable GPS.'); setLoadingLoc(false); }
    )
  }

  const filtered = buildings.filter(b => {
    const term = search.toLowerCase()
    const matchesName = b.name.toLowerCase().includes(term)
    const matchesTags = b.tags ? b.tags.some((t: string) => t.toLowerCase().includes(term)) : false
    
    // Exact match for category filter
    const matchesCategory = filter === 'All' || b.category === filter
    
    return (matchesName || matchesTags) && matchesCategory
  })

  // 🔴 VIEW 1: ACTIVE NAVIGATION
  if (isNavigating && userLoc && selectedBuilding) {
    return (
      <div className="fixed inset-0 z-[2000] bg-black">
        <div className="absolute top-4 left-4 right-4 z-[2010] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-gray-200 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Navigating to</p>
              <h2 className="text-lg font-bold text-indigo-700 leading-tight">{selectedBuilding.name}</h2>
            </div>
            <button 
              onClick={() => setIsNavigating(false)} 
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-red-600 transition"
            >
              Exit
            </button>
        </div>
        <RouteMap 
          userLat={userLoc.lat} 
          userLng={userLoc.lng} 
          destLat={selectedBuilding.lat} 
          destLng={selectedBuilding.lng} 
          destinationName={selectedBuilding.name}
        />
      </div>
    )
  }

  // 🔴 VIEW 2: STANDARD UI
  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col">
      <Navbar />

      {selectedBuilding ? (
        /* DETAIL VIEW */
        <div className="flex-1 overflow-y-auto bg-[#111111] relative">
          
          <button 
             onClick={(e) => {
               e.stopPropagation()
               setSelectedBuilding(null)
             }} 
             className="absolute top-4 left-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-full font-bold shadow-xl border border-gray-700 flex items-center gap-1 hover:bg-black transition"
           >
             <ChevronLeft size={18} /> Back
           </button>

          <div className="relative h-64 md:h-80 w-full bg-gray-800">
             {selectedBuilding.image_url ? (
               <div className="relative w-full h-full">
  <Image 
    src={selectedBuilding.image_url} 
    alt={selectedBuilding.name}
    fill                           // Automatically fills the container
    className="object-cover opacity-80" 
    sizes="(max-width: 768px) 100vw, 80vw" // Helps browser pick the right size
    priority={false}               // Lazy loads the image
  />
</div>
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent pointer-events-none"></div>
          </div>

          <div className="max-w-3xl mx-auto px-6 -mt-10 relative z-10">
               <div className="mb-6">
                  <span className="inline-block bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3 shadow-lg">
                    {selectedBuilding.category}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-xl">{selectedBuilding.name}</h1>
               </div>

               <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 shadow-xl mb-6">
                 <div className="flex items-start gap-4">
                    <div className="text-4xl bg-[#252525] p-3 rounded-xl">{selectedBuilding.icon || '📍'}</div>
                    <div className="flex-1">
                        <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">About this location</h3>
                        <p className="text-gray-200 text-lg leading-relaxed">
                          {selectedBuilding.description || 'No description available.'}
                        </p>
                    </div>
                 </div>
               </div>

               {selectedBuilding.tags && (
                 <div className="flex flex-wrap gap-2 mb-8">
                   {selectedBuilding.tags.map((t: string) => (
                     <span key={t} className="bg-[#252525] text-gray-400 text-xs px-3 py-1.5 rounded-full font-medium border border-gray-700">#{t}</span>
                   ))}
                 </div>
               )}
               
               <button 
                 onClick={startNavigation}
                 disabled={loadingLoc}
                 className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-indigo-700 transition flex justify-center items-center gap-3 active:scale-[0.98]"
               >
                 {loadingLoc ? 'Locating GPS...' : (
                   <>
                     <NavIcon size={20} /> Start Walking Navigation
                   </>
                 )}
               </button>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="max-w-2xl mx-auto w-full py-8 px-4">
          <h1 className="text-2xl font-bold mb-6 text-white">Find a Location</h1>
          
          <div className="relative mb-6">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search 'Library', 'Food'..." 
              className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-gray-800 text-white rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition placeholder-gray-500" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          
          {/* 🔥 DYNAMIC FILTER BUTTONS */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {uniqueCategories.map(c => (
              <button 
                key={c} 
                onClick={() => setFilter(c)} 
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${filter === c ? 'bg-indigo-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:bg-[#252525]'}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map(b => (
              <div 
                key={b.id} 
                onClick={() => setSelectedBuilding(b)}
                className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 flex items-center gap-4 hover:border-gray-600 transition cursor-pointer active:scale-[0.99] group"
              >
                <div className="w-12 h-12 bg-[#252525] rounded-full flex items-center justify-center text-2xl group-hover:bg-indigo-900/30 transition">
                  {b.icon || '📍'}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-100 text-lg">{b.name}</h3>
                  <span className="inline-block mt-1 text-xs font-bold text-indigo-400 bg-indigo-900/20 px-2 py-0.5 rounded">
                    {b.category}
                  </span>
                </div>
                <div className="text-gray-600 group-hover:text-white transition">
                  <ChevronLeft size={20} className="rotate-180" />
                </div>
              </div>
            ))}
            
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                <p>No locations found matching "{search}"</p>
                <p className="text-xs text-gray-600 mt-2">Try selecting "All" categories</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}