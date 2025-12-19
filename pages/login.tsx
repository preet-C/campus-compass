// pages/login.tsx
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import { Compass, AlertCircle, CheckCircle } from 'lucide-react'

export default function Auth() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false) // Toggle between Login and Sign Up
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [usn, setUsn] = useState('')
  const [dob, setDob] = useState('')

  // 🧠 USN VALIDATOR (Regex)
  function validateUSN(input: string) {
    // Regex explanation:
    // ^(1|4)SI -> Starts with 1SI or 4SI
    // \d{2}    -> 2 digits (Year)
    // [A-Z]{2,3} -> 2 or 3 letters (Branch)
    // \d{3}$   -> 3 digits (Roll No)
    const regex = /^(1|4)SI\d{2}[A-Z]{2,3}\d{3}$/
    return regex.test(input)
  }

  async function handleAuth(e: any) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        // --- SIGN UP LOGIC ---
        
        // 1. Validate USN
        const cleanUSN = usn.toUpperCase().trim()
        if (!validateUSN(cleanUSN)) {
          throw new Error("Invalid USN Format! (e.g., 4SI25CS090 or 1SI24AD017)")
        }

        // 2. Validate DOB (Simple check)
        if (!dob) throw new Error("Date of Birth is required.")

        // 3. Create User in Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { usn: cleanUSN, dob: dob } // Store these temporarily in metadata
          }
        })

        if (signUpError) throw signUpError

        // 4. Create Profile Entry manually to be safe
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            usn: cleanUSN,
            dob: dob,
            full_name: email.split('@')[0], // Default name from email
            year: '1st', // Default to 1st year
            branch: cleanUSN.substring(5, 7) // Extract branch from USN roughly
          })
          if (profileError) console.error("Profile creation warning:", profileError)
        }

        setMessage("Registration successful! Please check your email to verify your account.")
        setIsSignUp(false) // Switch back to login view

      } else {
        // --- LOGIN LOGIC ---
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) throw signInError
        router.push('/') // Redirect to Home
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-50 p-6 text-center border-b border-gray-100">
          <div className="inline-flex items-center justify-center bg-indigo-100 p-3 rounded-full mb-3">
            <Compass size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Campus Compass</h1>
          <p className="text-gray-500 text-sm mt-1">Siddaganga Institute of Technology</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setIsSignUp(false)} 
            className={`flex-1 py-3 text-sm font-bold transition ${!isSignUp ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Log In
          </button>
          <button 
            onClick={() => setIsSignUp(true)} 
            className={`flex-1 py-3 text-sm font-bold transition ${isSignUp ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Register (First Time)
          </button>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          
          {message && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4 border border-green-100">
              <CheckCircle size={16} /> {message}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* EXTRA FIELDS FOR SIGN UP */}
            {isSignUp && (
              <div className="space-y-4 animate-in slide-in-from-top-4 fade-in">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student USN</label>
                  <input
                    type="text"
                    placeholder="e.g. 4SI25CS090"
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Accepts 1SI... or 4SI... formats</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* STANDARD CREDENTIALS */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
              <input
                type="email"
                placeholder="student@sit.ac.in"
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? "Processing..." : isSignUp ? "Create Account" : "Log In"}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  )
}