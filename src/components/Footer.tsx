import { Send, Phone, Shield, MessageCircle } from 'lucide-react'
import { ContactForm } from './ContactForm'
import { GlassTag } from './GlassTag'

interface FooterMessengerLink {
  id?: string | null
  platform: 'telegram' | 'viber' | 'whatsapp' | 'signal'
  label: string
  url: string
}

interface FooterData {
  title?: string
  sectionTitle?: string
  sectionSubtitle?: string
  messengerLinks?: FooterMessengerLink[]
  phoneLabel?: string
  phoneNumber?: string
  phoneHref?: string
  emailLabel?: string
  emailAddress?: string
  emailHref?: string
  disclaimer?: string
  formHeading?: string
  formNamePlaceholder?: string
  formPhonePlaceholder?: string
  formEmailPlaceholder?: string
  formOrganizationPlaceholder?: string
  formMessagePlaceholder?: string
  consentText?: string
  submitButtonText?: string
  successMessage?: string
  errorMessage?: string
  sendAnotherButtonText?: string
  loadingText?: string
  nameRequiredError?: string
  emailRequiredError?: string
  consentRequiredError?: string
  copyrightText?: string
}

interface FooterProps {
  footerData?: FooterData
  locale?: string
}

function getMessengerIcon(platform: string) {
  switch (platform) {
    case 'telegram':
      return Send
    case 'viber':
      return Phone
    case 'whatsapp':
      return MessageCircle
    case 'signal':
      return Shield
    default:
      return Send
  }
}

export function Footer({ footerData, locale = 'uk' }: FooterProps) {
  const sectionTitle = footerData?.sectionTitle
  const sectionSubtitle = footerData?.sectionSubtitle
  const messengerLinks = footerData?.messengerLinks || []
  const phoneLabel = footerData?.phoneLabel
  const phoneNumber = footerData?.phoneNumber
  const phoneHref = footerData?.phoneHref
  const emailLabel = footerData?.emailLabel
  const emailAddress = footerData?.emailAddress
  const emailHref = footerData?.emailHref
  const disclaimer = footerData?.disclaimer
  const copyrightText = footerData?.copyrightText

  return (
    <footer className="relative overflow-hidden bg-[#060b09] text-white">
      {/* Green gradient accent at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-teal-500/[0.07] to-transparent" />

      <div className="container relative mx-auto px-4 py-16 md:py-20">
        {footerData?.title && (
          <h2 className="mb-12 text-3xl font-bold tracking-tight md:text-4xl">
            {footerData.title}
          </h2>
        )}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column — Contact Info */}
          <div className="flex flex-col justify-between">
            <div>
              {sectionTitle && (
                <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                  {sectionTitle}
                </h2>
              )}
              {sectionSubtitle && (
                <p className="mb-8 max-w-md text-base leading-relaxed text-white/60">
                  {sectionSubtitle}
                </p>
              )}

              {/* Messenger Pills */}
              {messengerLinks.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-3">
                  {messengerLinks.map((link, index) => {
                    const Icon = getMessengerIcon(link.platform)
                    return (
                      <GlassTag
                        key={link.id || index}
                        as="a"
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 text-sm font-medium text-white transition-colors hover:brightness-125"
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </GlassTag>
                    )
                  })}
                </div>
              )}

              {/* Divider */}
              <div className="mb-8 h-px bg-white/10" />

              {/* Phone & Email */}
              <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {phoneNumber && (
                  <div>
                    {phoneLabel && (
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/40">
                        {phoneLabel}
                      </p>
                    )}
                    {phoneHref ? (
                      <a
                        href={phoneHref}
                        className="text-lg font-medium text-white transition-colors hover:text-teal-400"
                      >
                        {phoneNumber}
                      </a>
                    ) : (
                      <p className="text-lg font-medium text-white">{phoneNumber}</p>
                    )}
                  </div>
                )}
                {emailAddress && (
                  <div>
                    {emailLabel && (
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/40">
                        {emailLabel}
                      </p>
                    )}
                    {emailHref ? (
                      <a
                        href={emailHref}
                        className="text-lg font-medium text-white transition-colors hover:text-teal-400"
                      >
                        {emailAddress}
                      </a>
                    ) : (
                      <p className="text-lg font-medium text-white">{emailAddress}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            {disclaimer && (
              <p className="max-w-md text-xs leading-relaxed text-white/30">{disclaimer}</p>
            )}
          </div>

          {/* Right Column — Contact Form */}
          <div id="contact-form">
            <ContactForm
              locale={locale}
              formHeading={footerData?.formHeading}
              formNamePlaceholder={footerData?.formNamePlaceholder}
              formPhonePlaceholder={footerData?.formPhonePlaceholder}
              formEmailPlaceholder={footerData?.formEmailPlaceholder}
              formOrganizationPlaceholder={footerData?.formOrganizationPlaceholder}
              formMessagePlaceholder={footerData?.formMessagePlaceholder}
              consentText={footerData?.consentText}
              submitButtonText={footerData?.submitButtonText}
              successMessage={footerData?.successMessage}
              errorMessage={footerData?.errorMessage}
              sendAnotherButtonText={footerData?.sendAnotherButtonText}
              loadingText={footerData?.loadingText}
              nameRequiredError={footerData?.nameRequiredError}
              emailRequiredError={footerData?.emailRequiredError}
              consentRequiredError={footerData?.consentRequiredError}
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      {copyrightText && (
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-sm text-white/40">{copyrightText}</p>
          </div>
        </div>
      )}
    </footer>
  )
}
