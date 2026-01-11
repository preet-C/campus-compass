import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import { BookOpen, ChevronRight, GraduationCap } from 'lucide-react'

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

// 📚 DATA: Years 2-4 Subject Lists (Generic structure - can be expanded)
const BRANCH_SUBJECTS: any = {
  'CSE': {
    2: ['Data Structures', 'Discrete Mathematics', 'Computer Organization', 'Operating Systems', 'Database Management'],
    3: ['Algorithm Design', 'Computer Networks', 'Software Engineering', 'Web Technologies', 'Machine Learning'],
    4: ['Cloud Computing', 'Cybersecurity', 'Big Data Analytics', 'Project Management', 'Capstone Project']
  },
  'ISE': {
    2: ['Data Structures', 'Discrete Mathematics', 'Information Systems', 'Database Management', 'Web Development'],
    3: ['Software Engineering', 'Computer Networks', 'Information Security', 'Data Mining', 'Enterprise Systems'],
    4: ['Cloud Computing', 'Cybersecurity', 'Business Intelligence', 'Project Management', 'Capstone Project']
  },
  'ECE': {
    2: ['Digital Electronics', 'Signals & Systems', 'Analog Circuits', 'Microprocessors', 'Communication Systems'],
    3: ['VLSI Design', 'Embedded Systems', 'Digital Signal Processing', 'Wireless Communication', 'Control Systems'],
    4: ['IoT Systems', 'Advanced Communication', 'RF Engineering', 'Project Management', 'Capstone Project']
  },
  'EEE': {
    2: ['Electrical Machines', 'Power Systems', 'Control Systems', 'Electronics', 'Measurements'],
    3: ['Power Electronics', 'Renewable Energy', 'High Voltage Engineering', 'Industrial Automation', 'Protection Systems'],
    4: ['Smart Grid', 'Energy Management', 'Advanced Power Systems', 'Project Management', 'Capstone Project']
  },
  'Mech': {
    2: ['Thermodynamics', 'Mechanics of Materials', 'Manufacturing Processes', 'Machine Design', 'Fluid Mechanics'],
    3: ['Heat Transfer', 'CAD/CAM', 'Automotive Engineering', 'Robotics', 'Industrial Engineering'],
    4: ['Advanced Manufacturing', 'Mechatronics', 'Project Management', 'Capstone Project']
  },
  'Civil': {
    2: ['Structural Analysis', 'Concrete Technology', 'Surveying', 'Geotechnical Engineering', 'Transportation'],
    3: ['Steel Structures', 'Foundation Engineering', 'Environmental Engineering', 'Construction Management', 'Hydraulics'],
    4: ['Advanced Structures', 'Infrastructure Planning', 'Project Management', 'Capstone Project']
  }
}

export default function ResourcesIndex() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<string[]>([])

  const years = [1, 2, 3, 4]
  const cycles = ['Physics Cycle', 'Chemistry Cycle']
  const branches = ['CSE', 'ISE', 'ECE', 'EEE', 'Mech', 'Civil']

  // When year is selected, move to step 2
  useEffect(() => {
    if (selectedYear) {
      setStep(2)
    }
  }, [selectedYear])

  // When cycle/branch is selected, move to step 3 and set subjects
  useEffect(() => {
    if (selectedYear === 1 && selectedCycle) {
      setSubjects(SYLLABUS[selectedCycle] || [])
      setStep(3)
    } else if (selectedYear && selectedYear > 1 && selectedBranch) {
      setSubjects(BRANCH_SUBJECTS[selectedBranch]?.[selectedYear] || [])
      setStep(3)
    }
  }, [selectedYear, selectedCycle, selectedBranch])

  const handleSubjectClick = (subject: string) => {
    const params = new URLSearchParams()
    params.set('year', selectedYear!.toString())
    if (selectedYear === 1) {
      params.set('cycle', selectedCycle!)
    } else {
      params.set('branch', selectedBranch!)
    }
    params.set('subject', subject)
    router.push(`/resources/${encodeURIComponent(subject)}?${params.toString()}`)
  }

  const handleBack = () => {
    if (step === 3) {
      setStep(2)
      setSubjects([])
      if (selectedYear === 1) {
        setSelectedCycle(null)
      } else {
        setSelectedBranch(null)
      }
    } else if (step === 2) {
      setStep(1)
      setSelectedYear(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-1">Resources</h1>
          <p className="text-gray-500 text-sm">Study Notes, Question Papers & Reference Materials</p>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => router.push('/')} className="hover:text-indigo-600 transition">
            Home
          </button>
          <ChevronRight size={16} />
          <span className="text-gray-900 font-medium">Resources</span>
          {selectedYear && (
            <>
              <ChevronRight size={16} />
              <span className="text-gray-900 font-medium">Year {selectedYear}</span>
            </>
          )}
          {selectedCycle && (
            <>
              <ChevronRight size={16} />
              <span className="text-gray-900 font-medium">{selectedCycle}</span>
            </>
          )}
          {selectedBranch && (
            <>
              <ChevronRight size={16} />
              <span className="text-gray-900 font-medium">{selectedBranch}</span>
            </>
          )}
        </div>

        {/* Step 1: Year Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Year</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-center group"
                >
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-100 transition">
                    <GraduationCap className="text-indigo-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">{year}</h3>
                  <p className="text-xs text-gray-500 mt-1">Year</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Cycle (Year 1) or Branch (Year 2-4) Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <button
              onClick={handleBack}
              className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 mb-4"
            >
              <ChevronRight size={16} className="rotate-180" />
              Back to Year Selection
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedYear === 1 ? 'Select Cycle' : 'Select Branch'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedYear === 1 ? (
                cycles.map(cycle => (
                  <button
                    key={cycle}
                    onClick={() => setSelectedCycle(cycle)}
                    className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition">
                        <BookOpen className="text-indigo-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{cycle}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {SYLLABUS[cycle]?.length || 0} subjects
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                branches.map(branch => (
                  <button
                    key={branch}
                    onClick={() => setSelectedBranch(branch)}
                    className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition">
                        <BookOpen className="text-indigo-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{branch}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {BRANCH_SUBJECTS[branch]?.[selectedYear!]?.length || 0} subjects
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 3: Subject Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <button
              onClick={handleBack}
              className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 mb-4"
            >
              <ChevronRight size={16} className="rotate-180" />
              Back
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Subject</h2>
            {subjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => handleSubjectClick(subject)}
                    className="bg-white p-5 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">
                          {subject}
                        </h3>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition"
                      />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-500">No subjects available for this selection.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
