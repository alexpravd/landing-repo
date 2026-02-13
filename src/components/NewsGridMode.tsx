'use client'

import Image from 'next/image'
import type { News } from '@/payload-types'
import { Card, CardContent } from './ui/card'
import { Calendar, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'

interface NewsGridModeProps {
  newsItems: News[]
  locale?: string
}

export function NewsGridMode({ newsItems, locale = 'uk' }: NewsGridModeProps) {
  // Split items: first item is featured, rest are in small cards
  const [mainItem, ...sideItems] = newsItems

  if (!mainItem) {
    return (
      <section className="relative py-20 before:absolute before:inset-0 before:-left-[50vw] before:-right-[50vw] before:ml-[calc(50%-50vw)] before:mr-[calc(50%-50vw)] before:w-screen before:bg-gradient-to-br before:from-muted before:to-indigo-50/30">
        <div className="container relative mx-auto px-4">
          <p className="text-center text-muted-foreground">No news articles available</p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative py-20 before:absolute before:inset-0 before:left-1/2 before:w-screen before:-translate-x-1/2 before:bg-gradient-to-br before:from-muted before:to-indigo-50/30">
      <div className="container relative mx-auto px-4">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Side - Main Featured Card */}
          <Link href={`/${locale}/news/${mainItem.slug}`}>
            <Card className="group h-full overflow-hidden border-border transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-0">
                {/* Featured Image */}
                {mainItem.featuredImage && typeof mainItem.featuredImage === 'object' && (
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={mainItem.featuredImage.url || ''}
                      alt={mainItem.featuredImage.alt || mainItem.title || ''}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      {/* Date */}
                      {mainItem.publishedDate && (
                        <div className="mb-2 flex items-center gap-2">
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
                      <h3 className="mb-2 text-2xl text-white">{mainItem.title}</h3>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Excerpt */}
                  {mainItem.excerpt && (
                    <p className="mb-4 line-clamp-3 text-muted-foreground">{mainItem.excerpt}</p>
                  )}

                  {/* Read More Button */}
                  <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700">
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Right Side - Minimal Cards Grid */}
          <div className="grid grid-cols-1 content-start gap-4 sm:grid-cols-2">
            {sideItems.slice(0, 4).map((item) => (
              <Link key={item.id} href={`/${locale}/news/${item.slug}`}>
                <Card className="group h-full cursor-pointer border-border transition-all duration-300 hover:border-indigo-300 hover:shadow-xl">
                  <CardContent className="p-6">
                    {/* Date */}
                    {item.publishedDate && (
                      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
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
                    <h4 className="mb-2 transition-colors group-hover:text-indigo-600">
                      {item.title}
                    </h4>

                    {/* Arrow Icon */}
                    <ArrowRight className="mt-3 h-4 w-4 text-indigo-600 transition-transform group-hover:translate-x-1" />
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
