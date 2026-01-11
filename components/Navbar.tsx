import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Navbar() {
  const router = useRouter()
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-indigo-600 p-4 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl">🧭 Campus Compass</Link>
        <div className="flex space-x-4 text-sm font-medium">
          <Link href="/" className="hover:text-indigo-200">Community</Link>
          <Link href="/resources" className="hover:text-indigo-200">Resources</Link>
          <Link href="/guides" className="hover:text-indigo-200">Guides</Link>
          <Link href="/navigation" className="hover:text-indigo-200">Navigation</Link>
          <Link href="/profile" className="hover:text-indigo-200">Profile</Link>
          <button onClick={handleLogout} className="bg-indigo-800 px-3 py-1 rounded hover:bg-indigo-900">Logout</button>
        </div>
      </div>
    </nav>
  )
}