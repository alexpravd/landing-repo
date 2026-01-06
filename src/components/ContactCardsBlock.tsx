import { Card, CardContent } from './ui/card'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { Mail, Phone, Linkedin, Twitter } from 'lucide-react'
import { Button } from './ui/button'

const contacts = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Chief Executive Officer',
    image:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjIwODc2NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    email: 's.johnson@techcorp.com',
    phone: '+1 (555) 123-4501',
    bio: 'Visionary leader with 20+ years in tech',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Chief Technology Officer',
    image:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MjE2OTE5MHww&ixlib=rb-4.1.0&q=80&w=1080',
    email: 'm.chen@techcorp.com',
    phone: '+1 (555) 123-4502',
    bio: 'Innovation architect and tech strategist',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'VP of Operations',
    image:
      'https://images.unsplash.com/photo-1549614614-dfc31601c389?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVtYmVyJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYyMTAxOTIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    email: 'e.rodriguez@techcorp.com',
    phone: '+1 (555) 123-4503',
    bio: 'Operations excellence and process optimizer',
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Head of Sales',
    image:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjIwODc2NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    email: 'd.kim@techcorp.com',
    phone: '+1 (555) 123-4504',
    bio: 'Strategic sales leader and growth expert',
  },
]

export function ContactCardsBlock() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-rose-600" />
            <span className="text-sm text-rose-700">Meet The Team</span>
          </div>
          <h2 className="mb-4 text-4xl">Our Leadership Team</h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            Experienced leaders driving innovation and excellence across the organization
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {contacts.map((contact) => (
            <Card
              key={contact.id}
              className="group overflow-hidden border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                  <ImageWithFallback
                    src={contact.image}
                    alt={contact.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                <div className="space-y-4 p-6">
                  <div>
                    <h3 className="mb-1 text-lg">{contact.name}</h3>
                    <p className="mb-2 text-sm text-indigo-600">{contact.role}</p>
                    <p className="text-xs text-gray-500">{contact.bio}</p>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 pt-2 text-sm">
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-gray-600 transition-colors hover:text-indigo-600"
                    >
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-xs">{contact.email}</span>
                    </a>
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2 text-gray-600 transition-colors hover:text-indigo-600"
                    >
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs">{contact.phone}</span>
                    </a>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 transition-all hover:border-indigo-600 hover:bg-indigo-600 hover:text-white"
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 transition-all hover:border-indigo-600 hover:bg-indigo-600 hover:text-white"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
