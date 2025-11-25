'use client'

import { Card, CardContent } from './ui/card'
import { Calendar, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'

interface NewsGridModeProps {
  newsItems: any[]
  locale?: string
}

export function NewsGridMode({ newsItems, locale = 'uk' }: NewsGridModeProps) {
  // Split items: first item is featured, rest are in small cards
  const [mainItem, ...sideItems] = newsItems

  if (!mainItem) {
    return (
      <section className="bg-gradient-to-br from-gray-50 to-indigo-50/30 py-20">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600">No news articles available</p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gradient-to-br from-gray-50 to-indigo-50/30 py-20">
      <div className="container mx-auto px-4">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Main Featured Card */}
          <Link href={`/${locale}/news/${mainItem.slug}`}>
            <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-gray-200 h-full">
              <CardContent className="p-0">
                {/* Featured Image */}
                {mainItem.featuredImage && typeof mainItem.featuredImage === 'object' && (
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                    <img
                      src={mainItem.featuredImage.url}
                      alt={mainItem.featuredImage.alt || mainItem.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      {/* Date */}
                      {mainItem.publishedDate && (
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {new Date(mainItem.publishedDate).toLocaleDateString('uk-UA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                      {/* Title */}
                      <h3 className="text-white text-2xl mb-2">{mainItem.title}</h3>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Excerpt */}
                  {mainItem.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">{mainItem.excerpt}</p>
                  )}

                  {/* Read More Button */}
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2 shadow-lg shadow-indigo-500/30">
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Right Side - Minimal Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            {sideItems.slice(0, 4).map((item) => (
              <Link key={item.id} href={`/${locale}/news/${item.slug}`}>
                <Card className="group hover:shadow-xl hover:border-indigo-300 transition-all duration-300 border-gray-200 cursor-pointer h-full">
                  <CardContent className="p-6">
                    {/* Date */}
                    {item.publishedDate && (
                      <div className="flex items-center gap-2 text-gray-500 mb-3">
                        <Calendar className="h-4 w-4 text-indigo-600" />
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
                    <h4 className="group-hover:text-indigo-600 transition-colors mb-2">
                      {item.title}
                    </h4>

                    {/* Arrow Icon */}
                    <ArrowRight className="h-4 w-4 text-indigo-600 mt-3 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
