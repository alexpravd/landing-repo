'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion'
import { HelpCircle, Sparkles } from 'lucide-react'

const faqItems = [
  {
    id: 'item-1',
    question: 'What services does TechCorp provide?',
    answer: `
TechCorp offers a comprehensive range of technology services including:

**Enterprise Software Solutions**: Custom-built applications tailored to your business needs with scalable architecture and modern tech stacks.

**Cloud Services**: Infrastructure, platform, and software as a service offerings including AWS, Azure, and Google Cloud integrations.

**Consulting**: Strategic technology consulting and digital transformation guidance to help you navigate complex business challenges.

**Analytics & AI**: Advanced data analytics and artificial intelligence solutions to unlock insights from your data.

**Support & Training**: 24/7 customer support and comprehensive training programs to ensure your team's success.

Our solutions are designed to scale with your business and adapt to changing market conditions.
    `
  },
  {
    id: 'item-2',
    question: 'How do I get started with your platform?',
    answer: `
Getting started with TechCorp is simple and straightforward:

**1. Initial Consultation**: Schedule a free consultation with our team to discuss your needs and objectives.

**2. Solution Design**: We'll work collaboratively with you to design a customized solution that fits your requirements.

**3. Implementation**: Our expert team handles the entire implementation process with minimal disruption to your operations.

**4. Training**: Comprehensive training sessions for your team members to ensure smooth adoption.

**5. Go Live**: Launch your solution with our full support and monitoring.

**6. Ongoing Support**: Access to our 24/7 support team and regular updates to keep your systems running smoothly.

The entire process typically takes 4-8 weeks depending on the complexity of your requirements.
    `
  },
  {
    id: 'item-3',
    question: 'What industries do you serve?',
    answer: `
TechCorp serves a diverse range of industries including:

**Financial Services**: Banking, insurance, and investment management solutions with enterprise-grade security.

**Healthcare**: Hospitals, clinics, and medical device manufacturers with HIPAA-compliant systems.

**Retail & E-commerce**: Online and brick-and-mortar retail operations with omnichannel capabilities.

**Manufacturing**: Industrial automation and supply chain optimization for modern factories.

**Education**: Universities, schools, and e-learning platforms with scalable learning management systems.

**Government**: Public sector and municipal organizations with secure, compliant solutions.

Our solutions are adaptable and can be customized for virtually any industry vertical.
    `
  },
  {
    id: 'item-4',
    question: 'What are your pricing models?',
    answer: `
We offer flexible pricing models to suit different business needs:

**Subscription-Based**: Monthly or annual subscriptions with tiered pricing based on usage and features.

**Usage-Based**: Pay only for what you use, ideal for variable workloads and seasonal businesses.

**Enterprise Licensing**: Custom enterprise agreements for large organizations with volume discounts.

**Project-Based**: Fixed-price projects for specific implementations and migrations.

**Hybrid Models**: Combinations of the above to match your unique requirements and budget.

Contact our sales team for a personalized quote based on your specific needs and scale.
    `
  },
  {
    id: 'item-5',
    question: 'How do you ensure data security and compliance?',
    answer: `
Security and compliance are at the core of everything we do:

**Encryption**: End-to-end encryption for data in transit and at rest using industry-standard protocols.

**Access Controls**: Multi-factor authentication and role-based access control to protect sensitive information.

**Compliance**: SOC 2, ISO 27001, GDPR, HIPAA, and other certifications maintained through regular audits.

**Regular Audits**: Third-party security audits and penetration testing to identify and address vulnerabilities.

**Monitoring**: 24/7 security monitoring and threat detection with automated response systems.

**Backup & Recovery**: Automated backups and disaster recovery plans to ensure business continuity.

We maintain the highest security standards to protect your sensitive information and meet regulatory requirements.
    `
  },
  {
    id: 'item-6',
    question: 'What is your support policy?',
    answer: `
We provide comprehensive support to ensure your success:

**24/7 Availability**: Round-the-clock support via phone, email, and chat for critical issues.

**Response Times**: Priority-based response times with critical issues addressed within 1 hour.

**Dedicated Account Manager**: Enterprise customers receive a dedicated account manager for personalized support.

**Knowledge Base**: Extensive documentation, tutorials, and resources available online.

**Community Forums**: Active community forums where users can share knowledge and best practices.

**Regular Updates**: Quarterly product updates and monthly security patches at no additional cost.
    `
  }
];

export function CollapsibleTextBlock() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-indigo-50/30 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-full mb-4">
            <HelpCircle className="h-4 w-4 text-teal-700" />
            <span className="text-sm text-teal-700">Help Center</span>
          </div>
          <h2 className="text-4xl mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our services, pricing, and support
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item) => (
              <AccordionItem 
                key={item.id} 
                value={item.id} 
                className="bg-white rounded-xl px-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 data-[state=open]:shadow-lg data-[state=open]:border-indigo-200"
              >
                <AccordionTrigger className="hover:no-underline text-left py-5">
                  <span className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>{item.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  <div className="prose prose-sm max-w-none text-gray-600 pl-8 whitespace-pre-line">
                    {item.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white">
            <h3 className="text-white text-2xl mb-3">Still have questions?</h3>
            <p className="text-indigo-100 mb-6">
              Our team is here to help. Contact us for personalized assistance.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                Contact Sales
              </button>
              <button className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
