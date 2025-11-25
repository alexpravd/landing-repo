import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { Button } from './ui/button';

const events = [
  {
    id: 1,
    title: 'Technical Workshop: AI & Machine Learning',
    date: 'November 10, 2025',
    time: '09:00 - 12:00',
    location: 'Virtual Event',
    description: 'Deep dive into the latest AI technologies and practical machine learning applications for business.',
    type: 'Workshop'
  },
  {
    id: 2,
    title: 'Cloud Infrastructure Seminar',
    date: 'November 12-13, 2025',
    time: null,
    location: 'San Francisco, CA',
    description: 'Two-day intensive seminar covering cloud architecture, security, and best practices.',
    type: 'Seminar'
  },
  {
    id: 3,
    title: 'Product Demo: New Platform Features',
    date: 'November 15, 2025',
    time: '14:00 - 15:30',
    location: 'Virtual Event',
    description: 'Live demonstration of our latest platform updates and feature releases.',
    type: 'Demo'
  },
  {
    id: 4,
    title: 'Developer Meetup',
    date: 'November 18, 2025',
    time: '18:00 - 21:00',
    location: 'New York, NY',
    description: 'Network with fellow developers, share experiences, and discuss emerging technologies.',
    type: 'Meetup'
  },
  {
    id: 5,
    title: 'Leadership Forum',
    date: 'November 20-21, 2025',
    time: null,
    location: 'London, UK',
    description: 'Executive leadership forum addressing digital transformation and strategic innovation.',
    type: 'Forum'
  },
  {
    id: 6,
    title: 'Customer Success Webinar',
    date: 'November 25, 2025',
    time: '10:00 - 11:00',
    location: 'Virtual Event',
    description: 'Learn how leading companies leverage our solutions to drive business outcomes.',
    type: 'Webinar'
  }
];

const typeColors: Record<string, string> = {
  'Workshop': 'bg-blue-100 text-blue-700',
  'Seminar': 'bg-purple-100 text-purple-700',
  'Demo': 'bg-green-100 text-green-700',
  'Meetup': 'bg-orange-100 text-orange-700',
  'Forum': 'bg-pink-100 text-pink-700',
  'Webinar': 'bg-indigo-100 text-indigo-700'
};

export function EventCardsBlock() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full mb-4">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
            <span className="text-sm text-green-700">Sessions & Events</span>
          </div>
          <h2 className="text-4xl mb-4">Join Our Events</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Expand your knowledge and network with industry experts through our curated events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card 
              key={event.id} 
              className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-gray-200 flex flex-col"
            >
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-4">
                  <Badge className={typeColors[event.type] || 'bg-gray-100 text-gray-700'}>
                    {event.type}
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{event.date.split(',')[0]}</div>
                    <div className="text-xs text-gray-400">{event.date.split(',')[1]}</div>
                  </div>
                </div>

                <h3 className="mb-4 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
                  {event.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0 text-indigo-600" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-indigo-600" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {event.description}
                </p>

                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all"
                >
                  Register
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
