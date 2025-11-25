import { Quote, Target, Users, Lightbulb, Shield } from 'lucide-react';

export function RichTextBlock() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full mb-4">
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
              <span className="text-sm text-amber-700">Our Story</span>
            </div>
            <h2 className="text-4xl mb-4">About Our Mission</h2>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              At TechCorp, we are dedicated to transforming the digital landscape through innovative 
              solutions and cutting-edge technology. Our mission is to empower businesses and individuals 
              with the tools they need to thrive in an increasingly connected world.
            </p>

            <div className="my-12 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
              <Quote className="h-8 w-8 text-indigo-600 mb-4" />
              <blockquote className="text-xl text-gray-800 italic mb-4">
                "Technology is best when it brings people together and creates opportunities for growth 
                and innovation. This philosophy guides everything we do at TechCorp."
              </blockquote>
              <p className="text-sm text-gray-600">— Sarah Johnson, CEO & Founder</p>
            </div>

            <h3 className="text-2xl mt-12 mb-6 flex items-center gap-3">
              <Target className="h-6 w-6 text-indigo-600" />
              Our Core Values
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <Lightbulb className="h-6 w-6 text-blue-600 mb-3" />
                <h4 className="mb-2">Innovation</h4>
                <p className="text-sm text-gray-600 m-0">
                  We constantly push the boundaries of what's possible, embracing new technologies 
                  and creative approaches to problem-solving.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <Target className="h-6 w-6 text-purple-600 mb-3" />
                <h4 className="mb-2">Excellence</h4>
                <p className="text-sm text-gray-600 m-0">
                  We maintain the highest standards in everything we do, from product development 
                  to customer service.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <Users className="h-6 w-6 text-green-600 mb-3" />
                <h4 className="mb-2">Collaboration</h4>
                <p className="text-sm text-gray-600 m-0">
                  We believe in the power of teamwork and partnerships to achieve extraordinary results.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <Shield className="h-6 w-6 text-orange-600 mb-3" />
                <h4 className="mb-2">Integrity</h4>
                <p className="text-sm text-gray-600 m-0">
                  We conduct our business with honesty, transparency, and ethical responsibility.
                </p>
              </div>
            </div>

            <h3 className="text-2xl mt-12 mb-6">What We Offer</h3>
            
            <p className="text-gray-700">
              Our comprehensive suite of solutions includes enterprise software, cloud services, 
              and consulting expertise. We work with organizations of all sizes, from startups to 
              Fortune 500 companies, helping them navigate digital transformation and achieve their 
              strategic objectives.
            </p>

            <div className="my-8 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl mb-2">15+</div>
                  <div className="text-sm text-indigo-100">Years Experience</div>
                </div>
                <div>
                  <div className="text-4xl mb-2">500+</div>
                  <div className="text-sm text-indigo-100">Global Clients</div>
                </div>
                <div>
                  <div className="text-4xl mb-2">1000+</div>
                  <div className="text-sm text-indigo-100">Projects Delivered</div>
                </div>
              </div>
            </div>

            <p className="text-gray-700">
              With over <strong>15 years of industry experience</strong> and a global team of experts, 
              we have successfully delivered thousands of projects across various industries. Our 
              commitment to excellence and customer satisfaction has made us a trusted partner for 
              businesses worldwide.
            </p>

            <h3 className="text-2xl mt-12 mb-6">Looking Forward</h3>
            
            <p className="text-gray-700 mb-0">
              As we continue to grow and evolve, we remain focused on our mission to deliver exceptional 
              value to our clients. We are excited about the future and the opportunities it brings to 
              innovate, collaborate, and make a positive impact on the world through technology.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
