import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => setMobileMenuOpen(false);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router.events]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="bg-indigo-600 px-4 py-3 sm:px-6 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl">
          🧭 Campus Compass
        </Link>

        <div className="hidden md:flex items-center space-x-4 text-sm font-medium">
          <Link href="/" className="hover:text-indigo-200">
            Community
          </Link>
          <Link href="/resources" className="hover:text-indigo-200">
            Resources
          </Link>
          <Link href="/guides" className="hover:text-indigo-200">
            Guides
          </Link>
          <Link href="/navigation" className="hover:text-indigo-200">
            Navigation
          </Link>
          <Link href="/profile" className="hover:text-indigo-200">
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="bg-indigo-800 px-3 py-1 rounded hover:bg-indigo-900"
          >
            Logout
          </button>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white/80"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu backdrop"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-indigo-700 text-white shadow-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="font-bold">Menu</span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-white/80"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-sm font-medium">
              <Link
                href="/"
                className="rounded-lg px-3 py-3 hover:bg-indigo-600"
              >
                Community
              </Link>
              <Link
                href="/resources"
                className="rounded-lg px-3 py-3 hover:bg-indigo-600"
              >
                Resources
              </Link>
              <Link
                href="/guides"
                className="rounded-lg px-3 py-3 hover:bg-indigo-600"
              >
                Guides
              </Link>
              <Link
                href="/navigation"
                className="rounded-lg px-3 py-3 hover:bg-indigo-600"
              >
                Navigation
              </Link>
              <Link
                href="/profile"
                className="rounded-lg px-3 py-3 hover:bg-indigo-600"
              >
                Profile
              </Link>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await handleLogout();
                }}
                className="mt-2 bg-indigo-900 px-3 py-3 rounded-lg hover:bg-indigo-950 text-left"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
