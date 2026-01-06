import { MapPin, Phone, Clock } from 'lucide-react'

export function IframeBlock() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-indigo-50/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2">
            <MapPin className="h-4 w-4 text-blue-700" />
            <span className="text-sm text-blue-700">Visit Us</span>
          </div>
          <h2 className="mb-4 text-4xl">Find Our Headquarters</h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            Visit us in person or connect with us virtually from anywhere in the world
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="mb-8 grid gap-8 lg:grid-cols-3">
            {/* Contact Info Cards */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                <MapPin className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mb-2 text-lg">Address</h3>
              <p className="text-sm text-gray-600">
                123 Tech Street
                <br />
                Silicon Valley, CA 94025
                <br />
                United States
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <Phone className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg">Contact</h3>
              <p className="text-sm text-gray-600">
                Phone: +1 (555) 123-4567
                <br />
                Email: hello@techcorp.com
                <br />
                Fax: +1 (555) 123-4568
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg">Hours</h3>
              <p className="text-sm text-gray-600">
                Mon - Fri: 9:00 AM - 6:00 PM
                <br />
                Saturday: 10:00 AM - 4:00 PM
                <br />
                Sunday: Closed
              </p>
            </div>
          </div>

          {/* Map */}
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-gray-200 shadow-2xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3168.6395445555!2d-122.08424938469238!3d37.42199997982505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fba02425dad8f%3A0x6c296c66619367e0!2sGoogleplex!5e0!3m2!1sen!2sus!4v1635959820345!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location Map"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  )
}
