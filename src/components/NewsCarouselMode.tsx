'use client'

import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Calendar, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel'

interface NewsCarouselModeProps {
  newsItems: any[]
  locale?: string
}

export function NewsCarouselMode({ newsItems, locale = 'uk' }: NewsCarouselModeProps) {
  const getTagColor = (color?: string) => {
    const colorClasses: Record<string, string> = {
      indigo: 'bg-white/90 text-indigo-700 hover:bg-white',
      blue: 'bg-white/90 text-blue-700 hover:bg-white',
      purple: 'bg-white/90 text-purple-700 hover:bg-white',
      green: 'bg-white/90 text-green-700 hover:bg-white',
      amber: 'bg-white/90 text-amber-700 hover:bg-white',
      red: 'bg-white/90 text-red-700 hover:bg-white',
      pink: 'bg-white/90 text-pink-700 hover:bg-white',
      teal: 'bg-white/90 text-teal-700 hover:bg-white',
    }
    return colorClasses[color || 'indigo'] || colorClasses.indigo
  }

  return (
    <section className="container mx-auto px-4 py-20">
      {/* Carousel */}
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {newsItems.map((item) => (
            <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
              <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-gray-200">
                <CardContent className="p-0">
                  {/* Featured Image */}
                  {item.featuredImage && typeof item.featuredImage === 'object' && (
                    <div className="aspect-video overflow-hidden bg-gray-100 relative">
                      <img
                        src={item.featuredImage.url}
                        alt={item.featuredImage.alt || item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Tag Badge */}
                      {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className="absolute top-4 left-4">
                          {item.tags.slice(0, 1).map((tag: any) => {
                            const tagData = typeof tag === 'object' ? tag : null
                            if (!tagData) return null
                            return (
                              <Badge key={tagData.id} className={getTagColor(tagData.color)}>
                                {tagData.name}
                              </Badge>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
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

                    {/* Read More Link */}
                    <Link href={`/${locale}/news/${item.slug}`}>
                      <Button
                        variant="ghost"
                        className="gap-2 -ml-4 text-indigo-600 group-hover:gap-3 transition-all"
                      >
                        Read More
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 -translate-x-12" />
        <CarouselNext className="right-0 translate-x-12" />
      </Carousel>
    </section>
  )
}
