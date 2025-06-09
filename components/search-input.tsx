"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Search, Clock, TrendingUp, X, Mic, MicOff } from "lucide-react"
import { useSearch } from "@/hooks/use-search"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  className?: string
  placeholder?: string
  showSuggestions?: boolean
  showHistory?: boolean
}

// Declare SpeechRecognition interface
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

export function SearchInput({
  className,
  placeholder = "Search products...",
  showSuggestions = true,
  showHistory = true,
}: SearchInputProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [localQuery, setLocalQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  const {
    query,
    suggestions,
    searchHistory,
    popularSearches,
    recentSearches,
    search,
    getSuggestions,
    removeFromHistory,
    getPopularSearches,
  } = useSearch()

  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  useEffect(() => {
    getPopularSearches()
  }, [getPopularSearches])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setLocalQuery(transcript)
        handleSearch(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognition)
    }
  }, [])

  const handleInputChange = (value: string) => {
    setLocalQuery(value)
    if (value.length >= 2) {
      getSuggestions(value)
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }

  const handleSearch = (searchQuery?: string) => {
    const queryToSearch = searchQuery || localQuery
    if (queryToSearch.trim()) {
      search(queryToSearch)
      router.push(`/search?q=${encodeURIComponent(queryToSearch)}`)
      setShowDropdown(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setLocalQuery(suggestion)
    handleSearch(suggestion)
  }

  const handleVoiceSearch = () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    } else if (e.key === "Escape") {
      setShowDropdown(false)
    }
  }

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={localQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {recognition && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleVoiceSearch}
              className={cn("h-8 w-8 p-0", isListening && "text-red-500")}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          <Button type="button" size="sm" onClick={() => handleSearch()} className="h-8">
            Search
          </Button>
        </div>
      </div>

      {/* Dropdown with suggestions and history */}
      {showDropdown && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Suggestions</h4>
                <div className="space-y-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="w-full text-left p-2 hover:bg-muted rounded-md flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span>{suggestion.text}</span>
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.type}
                        </Badge>
                      </div>
                      {suggestion.count && (
                        <span className="text-xs text-muted-foreground">{suggestion.count} results</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {showHistory && searchHistory.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Searches</h4>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                      <button
                        onClick={() => handleSuggestionClick(item.query)}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{item.query}</span>
                        <span className="text-xs text-muted-foreground">({item.resultsCount} results)</span>
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromHistory(item.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && localQuery.length === 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Popular Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.slice(0, 8).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="flex items-center gap-1 px-3 py-1 bg-muted hover:bg-muted/80 rounded-full text-sm"
                    >
                      <TrendingUp className="h-3 w-3" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Click outside to close */}
      {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />}
    </div>
  )
}
