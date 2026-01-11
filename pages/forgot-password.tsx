// pages/forgot-password.tsx
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Compass, AlertCircle, CheckCircle, Mail } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3000/update-password'
      })

      if (resetError) throw resetError

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gray-50 p-6 text-center border-b border-gray-100">
          <div className="inline-flex items-center justify-center bg-indigo-100 p-3 rounded-full mb-3">
            <Compass size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email to receive a reset link</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4 border border-green-100">
              <CheckCircle size={16} /> 
              <span>
                If an account exists for <strong>{email}</strong>, we have sent a password reset link. 
                Please check your email (including the <strong className="font-bold">Spam folder</strong>).
              </span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                  type="email" 
                  placeholder="student@sit.ac.in" 
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  disabled={success}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || success}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? "Sending..." : success ? "Link Sent!" : "Send Reset Link"}
            </button>

            <div className="text-center">
              <Link 
                href="/login"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
