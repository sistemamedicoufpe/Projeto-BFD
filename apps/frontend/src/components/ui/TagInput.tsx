import { useState, useRef, KeyboardEvent } from 'react'
import { cn } from '@/utils/cn'

interface TagInputProps {
  label?: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  suggestions?: string[]
  helperText?: string
  error?: string
  disabled?: boolean
  maxTags?: number
}

export function TagInput({
  label,
  tags,
  onChange,
  placeholder = 'Digite e pressione Enter',
  suggestions = [],
  helperText,
  error,
  disabled = false,
  maxTags,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  )

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      if (maxTags && tags.length >= maxTags) {
        return
      }
      onChange([...tags, trimmedTag])
    }
    setInputValue('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const removeTag = (tagToRemove: string) => {
    if (disabled) return
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setShowSuggestions(e.target.value.length > 0 && filteredSuggestions.length > 0)
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <div
        className={cn(
          'min-h-[42px] px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 transition-colors',
          'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
          disabled && 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300',
                'transition-all hover:bg-primary-200 dark:hover:bg-primary-800/50'
              )}
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeTag(tag)
                  }}
                  className="ml-1 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label={`Remover ${tag}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </span>
          ))}

          {!disabled && (!maxTags || tags.length < maxTags) && (
            <div className="relative flex-1 min-w-[150px]">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(inputValue.length > 0 && filteredSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={tags.length === 0 ? placeholder : ''}
                disabled={disabled}
                className={cn(
                  'w-full py-1 bg-transparent border-none outline-none',
                  'text-gray-900 dark:text-gray-100',
                  'placeholder:text-gray-400 dark:placeholder:text-gray-500'
                )}
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion}-${index}`}
                      type="button"
                      onClick={() => addTag(suggestion)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-1 flex items-center justify-between">
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Digite e pressione Enter para adicionar
          </p>
        )}
        {maxTags && (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {tags.length}/{maxTags}
          </p>
        )}
      </div>
    </div>
  )
}
