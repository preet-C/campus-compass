// pages/login.tsx
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Compass, AlertCircle, CheckCircle, User, Calendar, Hash, Mail, Lock } from 'lucide-react'
// Import our new helpers
import { getBranchFromUSN, calculateYearFromUSN } from '../lib/usnHelper'

export default function Auth() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Add Name Field field
  const [fullName, setFullName] = useState('') 
  const [usn, setUsn] = useState('')
  const [dob, setDob] = useState('')

  // USN VALIDATOR Regex
  function validateUSN(input: string) {
    // Accepts 1SI or 4SI followed by 2 digits, 2-3 letters, 3 digits
    const regex = /^(1|4)SI\d{2}[A-Z]{2,3}\d{3}$/
    return regex.test(input)
  }

  // Email validation helper
  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  // Password validation helper
  function validatePassword(password: string): { valid: boolean; error?: string } {
    if (password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters long.' }
    }
    return { valid: true }
  }

  // Sanitize error messages to prevent information leakage
  function sanitizeError(error: any): string {
    const errorMessage = error?.message || 'An unexpected error occurred. Please try again.'
    
    // Map known Supabase errors to user-friendly messages
    const errorMap: { [key: string]: string } = {
      'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
      'Email not confirmed': 'Please verify your email address before logging in.',
      'User already registered': 'An account with this email already exists. Please log in instead.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
      'Invalid email': 'Please enter a valid email address.',
      'Email rate limit exceeded': 'Too many requests. Please wait a moment before trying again.',
    }

    // Check for partial matches in error messages
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value
      }
    }

    // For unknown errors, return a generic message to avoid leaking system info
    // Log the actual error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth error:', errorMessage)
    }

    // Generic user-friendly error
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Network error. Please check your connection and try again.'
    }

    return 'An error occurred. Please try again or contact support if the problem persists.'
  }

  async function handleAuth(e: any) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Common validations for both login and signup
      if (!email.trim()) {
        throw new Error('Email address is required.')
      }

      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address.')
      }

      if (!password) {
        throw new Error('Password is required.')
      }

      // Password validation
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.error || 'Invalid password.')
      }

      if (isSignUp) {
        // --- SIGN UP LOGIC ---
        const cleanUSN = usn.toUpperCase().trim()
        
        // Additional signup validations
        if (!fullName.trim()) {
          throw new Error('Full Name is required.')
        }
        if (!validateUSN(cleanUSN)) {
          throw new Error('Invalid USN Format! (e.g., 4SI25CS090 or 1SI24AD017)')
        }
        if (!dob) {
          throw new Error('Date of Birth is required.')
        }

        // CALCULATE Branch and Year automatically
        const calculatedBranch = getBranchFromUSN(cleanUSN);
        const calculatedYear = calculateYearFromUSN(cleanUSN);

        // Create User
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })

        if (signUpError) throw signUpError

        // Create Profile Entry manually
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            usn: cleanUSN,
            dob: dob,
            full_name: fullName.trim(), // Use the entered name
            year: calculatedYear, // Use calculated year
            branch: calculatedBranch // Use decoded branch name
          })
          if (profileError) {
             console.error("Profile creation error:", profileError)
             // Optional: Delete the auth user if profile creation fails to maintain consistency
             throw new Error("Failed to create profile data. Please try again.")
          }
        }

        setMessage("Registration successful! Logging you in...")
        // Auto login after successful signup since email verification is off
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        })
        if (!signInError) router.push('/')
        setIsSignUp(false)

      } else {
        // --- LOGIN LOGIC ---
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        })

        if (signInError) throw signInError
        router.push('/') 
      }
    } catch (err: any) {
      // Use sanitized error messages to prevent information leakage
      setError(sanitizeError(err))
    } finally {
      setLoading(false)
    }
  }

  // TODO: Rate Limiting
  // Currently, there is no rate limiting implemented. This means users could potentially
  // spam login/signup requests. Consider implementing:
  // 1. Client-side: Disable button for X seconds after failed attempts
  // 2. Server-side: Use Supabase rate limiting policies or implement middleware
  // 3. IP-based rate limiting via API routes or Supabase Edge Functions

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden my-8">
        
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
            Register
          </button>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100"><AlertCircle size={16} /> {error}</div>}
          {message && <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4 border border-green-100"><CheckCircle size={16} /> {message}</div>}

          <form onSubmit={handleAuth} className="space-y-4">
            
            {isSignUp && (
              <div className="space-y-4 animate-in slide-in-from-top-4 fade-in">
                {/* NEW NAME FIELD */}
                 <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input type="text" placeholder="John Doe" className="w-full pl-10 p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student USN</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input type="text" placeholder="e.g. 4SI25CS090" className="w-full pl-10 p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                      value={usn} onChange={(e) => setUsn(e.target.value)} required />
                  </div>
                   <p className="text-[10px] text-gray-400 mt-1 ml-1">We'll detect your Branch & Year automatically.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
                   <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input type="date" className="w-full pl-10 p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={dob} onChange={(e) => setDob(e.target.value)} required />
                  </div>
                </div>
              </div>
            )}

            {/* STANDARD CREDENTIALS */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
              <div className="relative">
                 <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                 <input type="email" placeholder="student@sit.ac.in" className="w-full pl-10 p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input type="password" placeholder="••••••••" className="w-full pl-10 p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
               </div>
            </div>

            {!isSignUp && (
              <div className="text-right">
                <Link 
                  href="/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
              {loading ? "Processing..." : isSignUp ? "Create Account" : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}