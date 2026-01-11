import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import Navbar from "../../components/Navbar";
import { BookOpen, ChevronRight, GraduationCap } from "lucide-react";

// Subject interface
interface Subject {
  code: string;
  name: string;
}

// 📚 DATA: 1st Year Syllabus
const SYLLABUS: { [key: string]: Subject[] } = {
  "Physics Cycle": [
    { code: "AMS1", name: "Applied Mathematics-I" },
    { code: "APS", name: "Quantum Physics and Applications" },
    { code: "PSC5", name: "Structured Programming in C" },
    { code: "PSC6", name: "Elements of Biotechnology and Biomimetics" },
    { code: "ESCO7", name: "Intro to Electronics & Communication Engg" },
    { code: "ESCO6", name: "Intro to Electrical Engg" },
    { code: "ETC13", name: "Intro to AI and Applications" },
    { code: "CC09", name: "Soft Skills" },
    { code: "PSCL5", name: "C Programming Lab" },
    { code: "SDCxx1", name: "Innovation and Design Thinking Lab" },
    { code: "CC04/03", name: "Samskruthika/Balake Kannada" },
  ],
  "Chemistry Cycle": [
    { code: "AMS2", name: "Applied Mathematics-II" },
    { code: "ACS", name: "Applied Chemistry for Smart Systems" },
    { code: "CAEDS", name: "Computer-Aided Engineering Drawing" },
    { code: "PLC6", name: "Python Programming" },
    { code: "CC08", name: "Communication Skills" },
    { code: "CC10", name: "Indian Constitution and Engineering Ethics" },
    { code: "SDC2", name: "Interdisciplinary Project-Based Learning" },
  ],
};

// 📚 DATA: Years 2-4 Subject Lists (Generic structure - can be expanded)
const BRANCH_SUBJECTS: any = {
  CSE: {
    2: [
      "Data Structures",
      "Discrete Mathematics",
      "Computer Organization",
      "Operating Systems",
      "Database Management",
    ],
    3: [
      "Algorithm Design",
      "Computer Networks",
      "Software Engineering",
      "Web Technologies",
      "Machine Learning",
    ],
    4: [
      "Cloud Computing",
      "Cybersecurity",
      "Big Data Analytics",
      "Project Management",
      "Capstone Project",
    ],
  },
  ISE: {
    2: [
      "Data Structures",
      "Discrete Mathematics",
      "Information Systems",
      "Database Management",
      "Web Development",
    ],
    3: [
      "Software Engineering",
      "Computer Networks",
      "Information Security",
      "Data Mining",
      "Enterprise Systems",
    ],
    4: [
      "Cloud Computing",
      "Cybersecurity",
      "Business Intelligence",
      "Project Management",
      "Capstone Project",
    ],
  },
  ECE: {
    2: [
      "Digital Electronics",
      "Signals & Systems",
      "Analog Circuits",
      "Microprocessors",
      "Communication Systems",
    ],
    3: [
      "VLSI Design",
      "Embedded Systems",
      "Digital Signal Processing",
      "Wireless Communication",
      "Control Systems",
    ],
    4: [
      "IoT Systems",
      "Advanced Communication",
      "RF Engineering",
      "Project Management",
      "Capstone Project",
    ],
  },
  EEE: {
    2: [
      "Electrical Machines",
      "Power Systems",
      "Control Systems",
      "Electronics",
      "Measurements",
    ],
    3: [
      "Power Electronics",
      "Renewable Energy",
      "High Voltage Engineering",
      "Industrial Automation",
      "Protection Systems",
    ],
    4: [
      "Smart Grid",
      "Energy Management",
      "Advanced Power Systems",
      "Project Management",
      "Capstone Project",
    ],
  },
  Mech: {
    2: [
      "Thermodynamics",
      "Mechanics of Materials",
      "Manufacturing Processes",
      "Machine Design",
      "Fluid Mechanics",
    ],
    3: [
      "Heat Transfer",
      "CAD/CAM",
      "Automotive Engineering",
      "Robotics",
      "Industrial Engineering",
    ],
    4: [
      "Advanced Manufacturing",
      "Mechatronics",
      "Project Management",
      "Capstone Project",
    ],
  },
  Civil: {
    2: [
      "Structural Analysis",
      "Concrete Technology",
      "Surveying",
      "Geotechnical Engineering",
      "Transportation",
    ],
    3: [
      "Steel Structures",
      "Foundation Engineering",
      "Environmental Engineering",
      "Construction Management",
      "Hydraulics",
    ],
    4: [
      "Advanced Structures",
      "Infrastructure Planning",
      "Project Management",
      "Capstone Project",
    ],
  },
};

export default function ResourcesIndex() {
  const router = useRouter();

  const years = [1, 2, 3, 4];
  const cycles = ["Physics Cycle", "Chemistry Cycle"];
  const branches = ["CSE", "ISE", "ECE", "EEE", "Mech", "Civil"];

  const yearFromQuery = (() => {
    if (typeof router.query.year !== "string") return null;
    const parsed = parseInt(router.query.year, 10);
    return Number.isFinite(parsed) ? parsed : null;
  })();
  const cycleFromQuery =
    typeof router.query.cycle === "string" ? router.query.cycle : null;
  const branchFromQuery =
    typeof router.query.branch === "string" ? router.query.branch : null;

  const stepFromQuery = (() => {
    if (typeof router.query.step !== "string") return null;
    const parsed = parseInt(router.query.step, 10);
    return parsed === 1 || parsed === 2 || parsed === 3 ? parsed : null;
  })();

  const currentStep: 1 | 2 | 3 = (() => {
    if (stepFromQuery && yearFromQuery) return stepFromQuery;

    if (
      yearFromQuery &&
      ((yearFromQuery === 1 && cycleFromQuery) ||
        (yearFromQuery > 1 && branchFromQuery))
    ) {
      return 3;
    }
    if (yearFromQuery) return 2;
    return 1;
  })();

  const subjects: Subject[] = (() => {
    if (currentStep !== 3) return [];
    if (!yearFromQuery) return [];

    if (yearFromQuery === 1 && cycleFromQuery) {
      return SYLLABUS[cycleFromQuery] || [];
    }

    if (yearFromQuery > 1 && branchFromQuery) {
      const branchSubjects =
        BRANCH_SUBJECTS[branchFromQuery]?.[yearFromQuery] || [];
      return branchSubjects.map((subjectName: string) => ({
        code: "",
        name: subjectName,
      }));
    }

    return [];
  })();

  const navigateResources = (query?: Record<string, string>) => {
    if (!query || Object.keys(query).length === 0) {
      router.push("/resources", undefined, { shallow: true });
      return;
    }

    router.push({ pathname: "/resources", query }, undefined, {
      shallow: true,
    });
  };

  const handleSubjectClick = (subject: Subject) => {
    if (!yearFromQuery) return;

    const params = new URLSearchParams();
    params.set("year", yearFromQuery.toString());
    if (yearFromQuery === 1) {
      if (!cycleFromQuery) return;
      params.set("cycle", cycleFromQuery);
    } else {
      if (!branchFromQuery) return;
      params.set("branch", branchFromQuery);
    }
    // Use the full display format for the subject parameter
    const subjectDisplay = subject.code
      ? `${subject.code} - ${subject.name}`
      : subject.name;
    params.set("subject", subjectDisplay);
    router.push(
      `/resources/${encodeURIComponent(subjectDisplay)}?${params.toString()}`
    );
  };

  const handleBack = () => {
    if (currentStep === 3 && yearFromQuery) {
      navigateResources({ year: String(yearFromQuery), step: "2" });
      return;
    }

    if (currentStep === 2) {
      navigateResources();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-1">Resources</h1>
          <p className="text-gray-500 text-sm">
            Study Notes, Question Papers & Reference Materials
          </p>
        </div>

        {/* Breadcrumbs */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto md:overflow-visible whitespace-nowrap md:whitespace-normal flex-nowrap md:flex-wrap pb-1">
          <Link
            href="/resources"
            className="text-gray-900 font-medium hover:text-indigo-600 transition"
          >
            Resources
          </Link>
          {yearFromQuery && (
            <>
              <ChevronRight size={16} />
              <Link
                href={{
                  pathname: "/resources",
                  query: { year: String(yearFromQuery), step: "2" },
                }}
                className="text-gray-900 font-medium hover:text-indigo-600 transition"
              >
                Year {yearFromQuery}
              </Link>
            </>
          )}
          {yearFromQuery === 1 && cycleFromQuery && (
            <>
              <ChevronRight size={16} />
              <Link
                href={{
                  pathname: "/resources",
                  query: { year: "1", cycle: cycleFromQuery, step: "3" },
                }}
                className="text-gray-900 font-medium hover:text-indigo-600 transition"
              >
                {cycleFromQuery}
              </Link>
            </>
          )}
          {yearFromQuery && yearFromQuery > 1 && branchFromQuery && (
            <>
              <ChevronRight size={16} />
              <Link
                href={{
                  pathname: "/resources",
                  query: {
                    year: String(yearFromQuery),
                    branch: branchFromQuery,
                    step: "3",
                  },
                }}
                className="text-gray-900 font-medium hover:text-indigo-600 transition"
              >
                {branchFromQuery}
              </Link>
            </>
          )}
        </div>

        {!router.isReady ? (
          <div className="space-y-4">
            <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Year Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Select Year
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() =>
                        navigateResources({ year: String(year), step: "2" })
                      }
                      className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-center group"
                    >
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-100 transition">
                        <GraduationCap className="text-indigo-600" size={32} />
                      </div>
                      <h3 className="text-2xl font-black text-gray-900">
                        {year}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Year</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Cycle (Year 1) or Branch (Year 2-4) Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <button
                  onClick={handleBack}
                  className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 mb-4"
                >
                  <ChevronRight size={16} className="rotate-180" />
                  Back to Year Selection
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {yearFromQuery === 1 ? "Select Cycle" : "Select Branch"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {yearFromQuery === 1
                    ? cycles.map((cycle) => (
                        <button
                          key={cycle}
                          onClick={() =>
                            navigateResources({ year: "1", cycle, step: "3" })
                          }
                          className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-center sm:text-left group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition mx-auto sm:mx-0">
                              <BookOpen className="text-indigo-600" size={24} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {cycle}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {SYLLABUS[cycle]?.length || 0}{" "}
                                {SYLLABUS[cycle]?.length === 1
                                  ? "subject"
                                  : "subjects"}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    : branches.map((branch) => (
                        <button
                          key={branch}
                          onClick={() =>
                            navigateResources({
                              year: String(yearFromQuery),
                              branch,
                              step: "3",
                            })
                          }
                          className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-center sm:text-left group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition mx-auto sm:mx-0">
                              <BookOpen className="text-indigo-600" size={24} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {branch}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {BRANCH_SUBJECTS[branch]?.[yearFromQuery!]
                                  ?.length || 0}{" "}
                                subjects
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                </div>
              </div>
            )}

            {/* Step 3: Subject Selection */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <button
                  onClick={handleBack}
                  className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 mb-4"
                >
                  <ChevronRight size={16} className="rotate-180" />
                  Back
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Select Subject
                </h2>
                {subjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {subjects.map((subject, index) => (
                      <button
                        key={`${subject.code}-${index}`}
                        onClick={() => handleSubjectClick(subject)}
                        className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-center md:text-left group"
                      >
                        <div className="flex flex-col items-center md:items-start">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">
                            {subject.name}
                          </h3>
                          {subject.code && (
                            <span className="text-sm text-gray-500 mt-1 inline-flex items-center">
                              {subject.code}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                    <p className="text-gray-500">
                      No subjects available for this selection.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
