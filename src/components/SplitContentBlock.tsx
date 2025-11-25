import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

const mainCard = {
  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBldmVudHxlbnwxfHx8fDE3NjIxMjkxOTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  title: 'Annual Corporate Summit 2025',
  date: 'November 15-17, 2025',
  description: 'Join us for our flagship annual event bringing together industry leaders, innovators, and professionals from around the globe. Experience three days of keynotes, workshops, and networking.'
};

const sideCards = [
  {
    id: 1,
    title: 'Q4 Product Launch',
    date: 'December 5, 2025'
  },
  {
    id: 2,
    title: 'Innovation Workshop',
    date: 'November 20, 2025'
  },
  {
    id: 3,
    title: 'Team Building Event',
    date: 'November 12, 2025'
  },
  {
    id: 4,
    title: 'Industry Conference',
    date: 'October 30, 2025'
  }
];

export function SplitContentBlock() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-indigo-50/30 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full mb-4">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
            <span className="text-sm text-purple-700">What's Coming</span>
          </div>
          <h2 className="text-4xl mb-4">Upcoming Events</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Mark your calendar for these exciting opportunities to connect and learn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Main Featured Card */}
          <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-gray-200">
            <CardContent className="p-0">
              <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                <ImageWithFallback
                  src={mainCard.image}
                  alt={mainCard.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{mainCard.date}</span>
                  </div>
                  <h3 className="text-white text-2xl mb-2">{mainCard.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  {mainCard.description}
                </p>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2 shadow-lg shadow-indigo-500/30">
                  Register Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Minimal Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            {sideCards.map((card) => (
              <Card 
                key={card.id} 
                className="group hover:shadow-xl hover:border-indigo-300 transition-all duration-300 border-gray-200 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-gray-500 mb-3">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm">{card.date}</span>
                  </div>
                  <h4 className="group-hover:text-indigo-600 transition-colors">{card.title}</h4>
                  <ArrowRight className="h-4 w-4 text-indigo-600 mt-3 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
