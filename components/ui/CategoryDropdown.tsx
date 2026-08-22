"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, X, Search } from "lucide-react"

interface SubCategory {
  id: number
  name: string
  description: string
  categoryId: number
  parentSubCategoryId: number | null
}

interface Category {
  id: number
  name: string
  description: string
}

interface CategoryOption {
  id: string // Keep as string for the value prop if needed, or change to string | number
  label: string
  breadcrumb: string
  level: number
  categoryId: number
}

function buildCategoryOptions(
  categories: Category[],
  subCategories: SubCategory[]
): CategoryOption[] {
  const options: CategoryOption[] = []

  categories.forEach((cat) => {
    options.push({
      id: `cat-${cat.id}`,
      label: cat.name,
      breadcrumb: cat.name,
      level: 0,
      categoryId: cat.id,
    })

    const topLevelSubs = subCategories.filter(
      (s) => s.categoryId === cat.id && !s.parentSubCategoryId
    )

    topLevelSubs.forEach((sub) => {
      options.push({
        id: `sub-${sub.id}`,
        label: sub.name,
        breadcrumb: `${cat.name} > ${sub.name}`,
        level: 1,
        categoryId: cat.id,
      })

      const nestedSubs = subCategories.filter(
        (s) => s.parentSubCategoryId === sub.id
      )

      nestedSubs.forEach((nested) => {
        options.push({
          id: `sub-${nested.id}`,
          label: nested.name,
          breadcrumb: `${cat.name} > ${sub.name} > ${nested.name}`,
          level: 2,
          categoryId: cat.id,
        })

        const deepSubs = subCategories.filter(
          (s) => s.parentSubCategoryId === nested.id
        )

        deepSubs.forEach((deep) => {
          options.push({
            id: `sub-${deep.id}`,
            label: deep.name,
            breadcrumb: `${cat.name} > ${sub.name} > ${nested.name} > ${deep.name}`,
            level: 3,
            categoryId: cat.id,
          })
        })
      })
    })
  })

  return options
}

interface CategoryDropdownProps {
  value: string | number
  onChange: (id: string) => void
  placeholder?: string
  className?: string
}

export function CategoryDropdown({
  value,
  onChange,
  placeholder = "Select Category",
  className = "",
}: CategoryDropdownProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [options, setOptions] = useState<CategoryOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/subcategories"),
        ])
        if (catRes.ok && subRes.ok) {
          const cats = await catRes.json()
          const subs = await subRes.json()
          setCategories(cats)
          setSubCategories(subs)
          setOptions(buildCategoryOptions(cats, subs))
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.id === value?.toString() || opt.id === `cat-${value}` || opt.id === `sub-${value}`)
  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.breadcrumb.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors text-left flex items-center justify-between ${className}`}
      >
        <span className={selectedOption ? "text-white" : "text-gray-500"}>
          {selectedOption ? selectedOption.breadcrumb : placeholder}
        </span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50 max-h-96 flex flex-col">
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-white placeholder-gray-500 flex-1"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                No categories found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => {
                    onChange(option.id)
                    setIsOpen(false)
                    setSearchTerm("")
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 flex items-center justify-between group ${value?.toString() === option.id ? "bg-orange-600/20" : ""
                    }`}
                  style={{ paddingLeft: `${12 + option.level * 12}px` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">
                      {option.label}
                    </div>
                    {option.level > 0 && (
                      <div className="text-gray-400 text-xs truncate">
                        {option.breadcrumb
                          .split(" > ")
                          .slice(0, -1)
                          .join(" > ")}
                      </div>
                    )}
                  </div>
                  {value?.toString() === option.id && (
                    <div className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0 ml-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
