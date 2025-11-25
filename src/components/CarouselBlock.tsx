'use client'

import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

const carouselItems = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1519662978799-2f05096d3636?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzYyMTYwMTcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Modern Architecture Innovation',
    date: 'November 1, 2025',
    category: 'Innovation'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1709715357520-5e1047a2b691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmd8ZW58MXx8fHwxNzYyMTYyNzU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Strategic Business Meeting',
    date: 'October 28, 2025',
    category: 'Business'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1623715537851-8bc15aa8c145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MjE5MjU4OXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Technology Workspace Excellence',
    date: 'October 25, 2025',
    category: 'Technology'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMG9mZmljZXxlbnwxfHx8fDE3NjIxNjM5NzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Creative Office Environment',
    date: 'October 22, 2025',
    category: 'Culture'
  }
];

export function CarouselBlock() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full mb-4">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
          <span className="text-sm text-indigo-700">Featured Content</span>
        </div>
        <h2 className="text-4xl mb-4">Latest Highlights</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our most recent innovations, partnerships, and achievements
        </p>
      </div>
      
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {carouselItems.map((item) => (
            <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
              <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-gray-200">
                <CardContent className="p-0">
                  <div className="aspect-video overflow-hidden bg-gray-100 relative">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-indigo-700 hover:bg-white">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-gray-500 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{item.date}</span>
                    </div>
                    <h3 className="mb-3 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                    <Button variant="ghost" className="gap-2 -ml-4 text-indigo-600 group-hover:gap-3 transition-all">
                      Read More
                      <ArrowRight className="h-4 w-4" />
                    </Button>
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
  );
}
