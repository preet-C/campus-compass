import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import Navbar from "../../components/Navbar";
import {
  FileText,
  Download,
  Search,
  Plus,
  X,
  Trash2,
  ChevronRight,
  BookOpen,
  FileQuestion,
  BookMarked,
  Upload,
  Loader2,
  ArrowLeft,
} from "lucide-react";

type ResourceType = "Notes" | "Question Papers" | "Reference";

interface Resource {
  id: string;
  title: string;
  link: string;
  type: string;
  year: number;
  cycle?: string;
  branch?: string;
  subject: string;
}

export default function SubjectDetail() {
  const router = useRouter();
  const { subject, year, cycle, branch } = router.query;
  const decodedSubject = subject ? decodeURIComponent(subject as string) : "";

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Add resource form state
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceType, setNewResourceType] = useState<ResourceType>("Notes");
  const [newResourceFile, setNewResourceFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (router.isReady) {
      checkAdmin();
      fetchResources();
    }
  }, [router.isReady, year, cycle, branch, decodedSubject]);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      setIsAdmin(profile?.is_admin === true);
    }
  }

  async function fetchResources() {
    if (!decodedSubject || !year) return;

    setLoading(true);
    let query = supabase
      .from("resources")
      .select("*")
      .eq("year", parseInt(year as string))
      .eq("subject", decodedSubject);

    if (parseInt(year as string) === 1 && cycle) {
      query = query.eq("cycle", cycle);
    } else if (branch) {
      query = query.eq("branch", branch);
    }

    const { data } = await query.order("created_at", { ascending: false });

    if (data) {
      setResources(data);
    }
    setLoading(false);
  }

  function filterResourcesByType(type: ResourceType): Resource[] {
    const typeMap: { [key in ResourceType]: string[] } = {
      Notes: ["notes", "study notes", "note", "study note"],
      "Question Papers": [
        "question paper",
        "question papers",
        "pyq",
        "pyqs",
        "qp",
        "previous year",
        "previous years",
      ],
      Reference: [
        "reference",
        "reference materials",
        "reference material",
        "ref",
        "references",
      ],
    };

    const searchTerms = typeMap[type];
    return resources.filter((r) => {
      const resourceType = (r.type || "").toLowerCase().trim();
      // Check if resource type matches any of the search terms
      const matchesType = searchTerms.some(
        (term) =>
          resourceType === term ||
          resourceType.includes(term) ||
          term.includes(resourceType)
      );
      // Also check if the type exactly matches the tab name (case-insensitive)
      const exactMatch = resourceType === type.toLowerCase();
      const matchesSearch =
        !search || r.title.toLowerCase().includes(search.toLowerCase());
      return (matchesType || exactMatch) && matchesSearch;
    });
  }

  function sanitizeFilename(filename: string): string {
    // Replace any character that is NOT a letter, number, dot, or hyphen with an underscore
    return filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setNewResourceFile(file);

    // Auto-fill title from filename (remove extension)
    if (file) {
      const fileName = file.name;
      // Remove file extension (everything after the last dot)
      const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
      setNewResourceTitle(fileNameWithoutExt);
    }
  }

  async function handleAddResource(e: React.FormEvent) {
    e.preventDefault();
    if (!newResourceFile || !newResourceTitle || !decodedSubject || !year)
      return;

    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login first");
        return;
      }

      // Upload file to Supabase Storage
      const sanitizedFileName = sanitizeFilename(newResourceFile.name);
      const fileName = `${Date.now()}-${sanitizedFileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(fileName, newResourceFile);

      if (uploadError) {
        alert("Upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("course-materials").getPublicUrl(fileName);

      // Insert into database
      const resourceData: any = {
        title: newResourceTitle,
        link: publicUrl,
        type: newResourceType,
        year: parseInt(year as string),
        subject: decodedSubject,
      };

      if (parseInt(year as string) === 1 && cycle) {
        resourceData.cycle = cycle;
      } else if (branch) {
        resourceData.branch = branch;
      }

      const { error: insertError } = await supabase
        .from("resources")
        .insert(resourceData);

      if (insertError) {
        alert("Failed to add resource: " + insertError.message);
      } else {
        // Reset form and refresh
        setNewResourceTitle("");
        setNewResourceType("Notes");
        setNewResourceFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setShowAddModal(false);
        fetchResources();
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    }

    setUploading(false);
  }

  async function handleDeleteResource(resourceId: string, fileLink: string) {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      // Extract file path from URL
      const urlParts = fileLink.split("/course-materials/");
      const fileName = urlParts[urlParts.length - 1]?.split("?")[0]; // Remove query params if any

      // Delete from storage
      if (fileName) {
        await supabase.storage.from("course-materials").remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", resourceId);

      if (error) {
        alert("Failed to delete: " + error.message);
      } else {
        fetchResources();
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  }

  const notes = filterResourcesByType("Notes");
  const questionPapers = filterResourcesByType("Question Papers");
  const reference = filterResourcesByType("Reference");

  const backToSubjectsHref = {
    pathname: "/resources",
    query: {
      ...(year ? { year: String(year) } : {}),
      ...(parseInt(year as string) === 1 && cycle
        ? { cycle: String(cycle) }
        : {}),
      ...(parseInt(year as string) > 1 && branch
        ? { branch: String(branch) }
        : {}),
      ...(year ? { step: "3" } : {}),
    },
  };

  const breadcrumbs = [
    { label: "Resources", href: "/resources" },
    {
      label: `Year ${year}`,
      href: year
        ? `/resources?year=${encodeURIComponent(String(year))}&step=2`
        : null,
    },
    ...(parseInt(year as string) === 1 && cycle
      ? [
          {
            label: cycle,
            href: `/resources?year=1&cycle=${encodeURIComponent(
              String(cycle)
            )}&step=3`,
          },
        ]
      : []),
    ...(parseInt(year as string) > 1 && branch
      ? [
          {
            label: branch,
            href: `/resources?year=${encodeURIComponent(
              String(year)
            )}&branch=${encodeURIComponent(String(branch))}&step=3`,
          },
        ]
      : []),
    { label: decodedSubject, href: null },
  ].filter((crumb) => crumb.label); // Filter out any undefined/null labels

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {/* Back Button */}
        <Link
          href={backToSubjectsHref}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition mb-4 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition"
          />
          Back to Subjects
        </Link>

        {/* Breadcrumbs */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 text-sm text-gray-500 mb-4 overflow-x-auto md:overflow-visible whitespace-nowrap md:whitespace-normal flex-nowrap md:flex-wrap pb-1">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-indigo-600 transition"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={
                    idx === breadcrumbs.length - 1
                      ? "text-gray-900 font-medium"
                      : ""
                  }
                >
                  {crumb.label}
                </span>
              )}
              {idx < breadcrumbs.length - 1 && <ChevronRight size={16} />}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-3xl font-black text-gray-900 mb-1">
              {decodedSubject}
            </h1>
            <p className="text-gray-500 text-sm">
              Year {year} {cycle || branch ? `• ${cycle || branch}` : ""}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-md w-full md:w-auto"
            >
              <Plus size={18} /> Add Resource
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search resources by title..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-10">
              <section>
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen size={18} /> Notes
                </h2>
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        isAdmin={isAdmin}
                        onDelete={() =>
                          handleDeleteResource(resource.id, resource.link)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No notes available yet" />
                )}
              </section>

              <section>
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileQuestion size={18} /> Question Papers
                </h2>
                {questionPapers.length > 0 ? (
                  <div className="space-y-3">
                    {questionPapers.map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        isAdmin={isAdmin}
                        onDelete={() =>
                          handleDeleteResource(resource.id, resource.link)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No question papers available yet" />
                )}
              </section>

              <section>
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookMarked size={18} /> Reference
                </h2>
                {reference.length > 0 ? (
                  <div className="space-y-3">
                    {reference.map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        isAdmin={isAdmin}
                        onDelete={() =>
                          handleDeleteResource(resource.id, resource.link)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No reference materials available yet" />
                )}
              </section>
            </div>
          </>
        )}

        {/* Add Resource Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">
                  Add Resource
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddResource} className="space-y-4">
                {/* Auto-filled info */}
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p>
                    <span className="font-bold">Year:</span> {year}
                  </p>
                  {cycle && (
                    <p>
                      <span className="font-bold">Cycle:</span> {cycle}
                    </p>
                  )}
                  {branch && (
                    <p>
                      <span className="font-bold">Branch:</span> {branch}
                    </p>
                  )}
                  <p>
                    <span className="font-bold">Subject:</span> {decodedSubject}
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newResourceTitle}
                    onChange={(e) => setNewResourceTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g., Unit 1 Notes, 2023 Question Paper"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={newResourceType}
                    onChange={(e) =>
                      setNewResourceType(e.target.value as ResourceType)
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Notes">Study Notes</option>
                    <option value="Question Papers">
                      Question Papers (PYQs)
                    </option>
                    <option value="Reference">Reference Materials</option>
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    File (PDF) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      required
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="text-gray-400" size={32} />
                      <span className="text-sm text-gray-600">
                        {newResourceFile
                          ? newResourceFile.name
                          : "Click to upload PDF"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Add Resource"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Credits & Gratitude Section */}
        {resources.length > 0 && (
          <div className="mt-12 mb-8">
            <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Image */}
                <div className="flex justify-center">
                  <img
                    src="/musashi-pray.png"
                    alt="Gratitude"
                    className="h-32 object-contain opacity-90"
                  />
                </div>

                {/* Header */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">
                    Special Thanks
                  </h2>

                  {/* Credits List */}
                  <div className="space-y-3 text-gray-700 max-w-md mx-auto">
                    <div className="flex items-start gap-3">
                      <span className="text-indigo-600 mt-1">✓</span>
                      <p className="text-sm leading-relaxed">
                        <span className="font-semibold">
                          'ASK YOUR SENIORS' Community
                        </span>{" "}
                        — for the material archive
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-indigo-600 mt-1">✓</span>
                      <p className="text-sm leading-relaxed">
                        <span className="font-semibold">Faculties</span> — for
                        notes and question banks
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-indigo-600 mt-1">✓</span>
                      <p className="text-sm leading-relaxed">
                        <span className="font-semibold">
                          Friends & Classmates
                        </span>{" "}
                        — for shared class notes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Resource Card Component
function ResourceCard({
  resource,
  isAdmin,
  onDelete,
}: {
  resource: Resource;
  isAdmin: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white p-5 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group relative">
      {isAdmin && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
          title="Delete resource"
        >
          <Trash2 size={16} />
        </button>
      )}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="text-indigo-600" size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 break-words">
            {resource.title}
          </h3>
          <a
            href={resource.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 mt-2 max-w-full"
          >
            <Download size={14} />
            <span className="truncate">View/Download</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
      <div className="text-4xl mb-3">📭</div>
      <p className="text-gray-500 text-sm font-medium">{message}</p>
    </div>
  );
}
