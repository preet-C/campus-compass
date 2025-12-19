// pages/guides.tsx
import Navbar from '../components/Navbar'
import { Hammer, HardHat, Construction } from 'lucide-react'

export default function Guides() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        
        {/* 🚧 Construction Graphic */}
        <div className="bg-white p-8 rounded-full shadow-xl mb-8 relative">
           <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 p-3 rounded-full animate-bounce">
             <Hammer size={24} />
           </div>
           <Construction size={80} className="text-indigo-600" />
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Coming Soon</h1>
        <p className="text-xl text-gray-500 max-w-md mx-auto mb-8">
          We are currently working hard to bring you the best 
          <span className="font-bold text-indigo-600"> Study Guides & Notes</span>.
        </p>

        {/* "Under Construction" Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-bold text-sm border border-yellow-200">
           <HardHat size={16} />
           <span>Work in Progress</span>
        </div>

      </div>
    </div>
  )
}