/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw, ChevronDown, Clock, TrendingUp } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="4" width="16" height="4" fill="currentColor" />
      <rect x="4" y="10" width="4" height="10" fill="currentColor" />
      <rect x="16" y="10" width="4" height="10" fill="currentColor" />
    </svg>
  );
}

interface NewsHeadline {
  title: string;
  source: string;
  url: string;
  category: string;
  time: string;
}

export default function App() {
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [limit, setLimit] = useState(10);
  const [sportsSubcategory, setSportsSubcategory] = useState("All");
  const [sportsDropdownOpen, setSportsDropdownOpen] = useState(false);

  const categories = ["All", "Politics", "Tech", "Business", "Science", "Entertainment", "Sports", "Health"];
  const limits = [5, 10, 20, 50];
  const sportsSubcategories = [
    { key: "All", label: "All" },
    { key: "Soccer", label: "Soccer" },
    { key: "Basketball", label: "Basketball" },
    { key: "Football", label: "Football (NFL)" }
  ];

  const apiBaseUrl =
    (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

  const fetchHeadlines = async (
    category: string = selectedCategory, 
    currentLimit: number = limit,
    sport: string = sportsSubcategory
  ) => {
    setLoading(true);
    setError(null);
    try {
      const sportQuery = category === "Sports" ? `&sport=${encodeURIComponent(sport)}` : "";
      const response = await fetch(
        `${apiBaseUrl}/api/headlines?category=${encodeURIComponent(category)}&limit=${currentLimit}${sportQuery}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setHeadlines(data);
    } catch (err) {
      console.error("Error fetching headlines:", err);
      setError("Failed to fetch the latest headlines. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeadlines();
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "Sports") {
      setSportsDropdownOpen((prev) => (selectedCategory === "Sports" ? !prev : true));
    } else {
      setSportsDropdownOpen(false);
      setSportsSubcategory("All");
    }
    fetchHeadlines(category, limit, category === "Sports" ? sportsSubcategory : "All");
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    fetchHeadlines(selectedCategory, newLimit, sportsSubcategory);
  };

  const handleSportsSubcategoryChange = (next: string) => {
    setSportsSubcategory(next);
    fetchHeadlines("Sports", limit, next);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm">
              <Logo className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-medium tracking-tight uppercase">Headlines</h1>
          </div>
          
          <button 
            onClick={() => fetchHeadlines()}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 flex flex-col w-full">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-white/40 text-xs font-medium uppercase tracking-widest mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Live Feed</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-light tracking-tighter leading-none mb-6">
            The world, <br />
            <span className="text-white/40 italic serif">recently.</span>
          </h2>
          <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent" />
          
          {/* Categories + Headline Count */}
          <div className="mt-8 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex flex-col relative">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={cn(
                      "text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 relative py-2",
                      selectedCategory === cat ? "text-white" : "text-white/30 hover:text-white/60"
                    )}
                  >
                    {cat}
                    {selectedCategory === cat && (
                      <motion.div
                        layoutId="activeCategory"
                        className="absolute -bottom-1 left-0 right-0 h-px bg-white"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {selectedCategory === "Sports" && sportsDropdownOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute left-0 top-full mt-4 z-20 overflow-hidden w-max"
                  >
                    <div className="flex flex-wrap gap-3 items-center">
                      {sportsSubcategories.map((s) => (
                        <button
                          key={s.key}
                          onClick={() => handleSportsSubcategoryChange(s.key)}
                          className={cn(
                            "text-[10px] font-mono transition-colors uppercase tracking-wide",
                            sportsSubcategory === s.key
                              ? "text-white"
                              : "text-white/20 hover:text-white/40"
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4 lg:border-l lg:border-white/10 lg:pl-8 lg:pt-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Count</span>
              <div className="flex gap-3">
                {limits.map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLimitChange(l)}
                    className={cn(
                      "text-[10px] font-mono transition-colors",
                      limit === l ? "text-white" : "text-white/20 hover:text-white/40"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Headlines List */}
        <div className="space-y-0">
          {loading && headlines.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-white/40 gap-4">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="text-sm font-mono uppercase tracking-widest">Parsing the internet...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <p className="text-white/60 mb-4">{error}</p>
              <button 
                onClick={() => fetchHeadlines()}
                className="px-6 py-2 border border-white/20 hover:bg-white hover:text-black transition-all text-sm uppercase tracking-widest"
              >
                Retry
              </button>
            </div>
          ) : (
            headlines.map((item, index) => (
              <HeadlineItem 
                key={index} 
                item={item} 
                index={index}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-12 border-t border-white/10 text-white/30 flex flex-col md:flex-row justify-between gap-8 pb-12 w-full">
          <div className="max-w-xs">
            <p className="text-xs leading-relaxed">
              Headline aggregates and verifies news from across the global web in real-time.
            </p>
          </div>
          <div className="flex gap-12 text-[10px] uppercase tracking-[0.2em] font-bold">
            <div className="flex flex-col gap-3">
              <span className="text-white/60">System</span>
              <span className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-500 rounded-full" />
                Operational
              </span>
              <span>v1.0.4</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function HeadlineItem({ 
  item, 
  index, 
}: { 
  item: NewsHeadline; 
  index: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <div 
        role="link"
        tabIndex={0}
        onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            window.open(item.url, "_blank", "noopener,noreferrer");
          }
        }}
        className="py-8 border-b border-white/10 cursor-pointer transition-all duration-500 hover:bg-white/[0.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0"
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="h-px w-4 bg-white/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                {item.source}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-white/30">
                <Clock className="w-3 h-3" />
                {item.time}
              </span>
            </div>
            <h3 className={cn(
              "text-xl md:text-2xl font-light leading-snug transition-all duration-500",
              "text-white/80 group-hover:text-white"
            )}>
              {item.title}
            </h3>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
