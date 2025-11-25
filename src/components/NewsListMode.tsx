'use client'

import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Calendar, ArrowRight, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface NewsListModeProps {
  newsItems: any[]
  allTags: any[]
  enableSearch: boolean
  enableFilters: boolean
  enablePagination: boolean
  itemsPerPage: number
  locale?: string
}

export function NewsListMode({
  newsItems,
  allTags,
  enableSearch,
  enableFilters,
  enablePagination,
  itemsPerPage,
  locale = 'uk',
}: NewsListModeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter items based on search and tag
  const filteredItems = newsItems.filter((item) => {
    const matchesSearch =
      !enableSearch ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag =
      !selectedTag ||
      (Array.isArray(item.tags) && item.tags.some((tag: any) => {
        const tagId = typeof tag === 'object' ? tag.id : tag
        return tagId === selectedTag
      }))
    return matchesSearch && matchesTag
  })

  // Calculate pagination
  const totalItems = filteredItems.length
  const totalPages = enablePagination ? Math.ceil(totalItems / itemsPerPage) : 1
  const startIndex = enablePagination ? (currentPage - 1) * itemsPerPage : 0
  const endIndex = enablePagination ? startIndex + itemsPerPage : totalItems
  const currentItems = filteredItems.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleTagChange = (tagId: string | null) => {
    setSelectedTag(tagId)
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const getTagColor = (color?: string) => {
    const colorClasses: Record<string, string> = {
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      amber: 'bg-amber-100 text-amber-700 border-amber-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      pink: 'bg-pink-100 text-pink-700 border-pink-200',
      teal: 'bg-teal-100 text-teal-700 border-teal-200',
    }
    return colorClasses[color || 'indigo'] || colorClasses.indigo
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
      <div className="container mx-auto px-4">
        {/* Search and Filters */}
        {(enableSearch || enableFilters) && (
          <div className="mb-8 space-y-4">
            {/* Search */}
            {enableSearch && (
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 py-6 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                />
              </div>
            )}

            {/* Tag Filters */}
            {enableFilters && allTags.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant={selectedTag === null ? 'default' : 'outline'}
                  onClick={() => handleTagChange(null)}
                  className={
                    selectedTag === null
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'border-gray-200'
                  }
                  size="sm"
                >
                  All Tags
                </Button>
                {allTags.map((tag) => (
                  <Button
                    key={tag.id}
                    variant={selectedTag === tag.id ? 'default' : 'outline'}
                    onClick={() => handleTagChange(tag.id)}
                    className={
                      selectedTag === tag.id
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'border-gray-200'
                    }
                    size="sm"
                  >
                    {tag.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        {enablePagination && (
          <div className="text-center text-gray-600 mb-8">
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} articles
          </div>
        )}

        {/* Grid of Items */}
        {currentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-gray-200 h-full flex flex-col"
              >
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Featured Image */}
                  {item.featuredImage && typeof item.featuredImage === 'object' && (
                    <div className="aspect-video overflow-hidden bg-gray-100 relative">
                      <img
                        src={item.featuredImage.url}
                        alt={item.featuredImage.alt || item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Tags */}
                      {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className="absolute top-4 left-4">
                          {item.tags.slice(0, 1).map((tag: any) => {
                            const tagData = typeof tag === 'object' ? tag : null
                            if (!tagData) return null
                            return (
                              <Badge
                                key={tagData.id}
                                className={`${getTagColor(tagData.color)} border`}
                              >
                                {tagData.name}
                              </Badge>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Date */}
                    {item.publishedDate && (
                      <div className="flex items-center gap-2 text-gray-500 mb-3">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {new Date(item.publishedDate).toLocaleDateString('uk-UA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="mb-3 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>

                    {/* Excerpt */}
                    {item.excerpt && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                        {item.excerpt}
                      </p>
                    )}

                    {/* Read More Link */}
                    <Link href={`/${locale}/news/${item.slug}`}>
                      <Button
                        variant="ghost"
                        className="gap-2 -ml-4 text-indigo-600 group-hover:gap-3 transition-all w-fit"
                      >
                        Read More
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* No Results */
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl text-gray-600 mb-2">No articles found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
            {(searchQuery || selectedTag) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedTag(null)
                  setCurrentPage(1)
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {enablePagination && totalItems > 0 && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)

                const showEllipsis =
                  (page === currentPage - 2 && currentPage > 3) ||
                  (page === currentPage + 2 && currentPage < totalPages - 2)

                if (showEllipsis) {
                  return (
                    <span key={page} className="px-2 text-gray-400">
                      ...
                    </span>
                  )
                }

                if (!showPage) return null

                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className={
                      currentPage === page
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'border-gray-200'
                    }
                  >
                    {page}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
