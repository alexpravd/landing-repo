'use client'

import Image from 'next/image'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SlateRichText } from './SlateRichText'

interface LinkItem {
  linkText: string
  linkUrl: string
  openInNewTab?: boolean | null
  id?: string | null
}

interface ContentItem {
  contentType: 'text' | 'richText' | 'image' | 'linkList'
  text?: string | null
  richText?: Record<string, unknown> | null
  image?:
    | string
    | { url?: string | null; alt?: string; width?: number | null; height?: number | null }
    | null
  imageCaption?: string | null
  links?: LinkItem[] | null
  id?: string | null
}

interface AccordionItemData {
  itemTitle: string
  contentItems?: ContentItem[] | null
  id?: string | null
}

export interface AccordionBlockProps {
  title?: string | null
  description?: string | null
  allowMultiple?: boolean | null
  accordionItems: AccordionItemData[]
}

function renderContentItem(item: ContentItem, index: number) {
  const key = item.id || `content-${index}`

  switch (item.contentType) {
    case 'text':
      if (!item.text) return null
      return (
        <p key={key} className="whitespace-pre-line text-muted-foreground">
          {item.text}
        </p>
      )

    case 'richText':
      if (!item.richText) return null
      return <SlateRichText key={key} content={item.richText} className="text-muted-foreground" />

    case 'image': {
      if (!item.image) return null
      const imageUrl = typeof item.image === 'string' ? item.image : item.image?.url
      const imageAlt = typeof item.image === 'object' ? item.image?.alt : undefined
      const imageWidth = typeof item.image === 'object' ? item.image?.width : undefined
      const imageHeight = typeof item.image === 'object' ? item.image?.height : undefined

      if (!imageUrl) return null

      return (
        <figure key={key} className="my-4">
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src={imageUrl}
              alt={imageAlt || item.imageCaption || ''}
              width={imageWidth || 800}
              height={imageHeight || 450}
              className="h-auto w-full object-cover"
            />
          </div>
          {item.imageCaption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {item.imageCaption}
            </figcaption>
          )}
        </figure>
      )
    }

    case 'linkList': {
      if (!item.links || item.links.length === 0) return null
      return (
        <ul key={key} className="space-y-2">
          {item.links.map((link, linkIndex) => (
            <li key={link.id || `link-${linkIndex}`}>
              <a
                href={link.linkUrl}
                target={link.openInNewTab ? '_blank' : '_self'}
                rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                className="text-indigo-600 underline-offset-2 hover:underline"
              >
                {link.linkText}
              </a>
            </li>
          ))}
        </ul>
      )
    }

    default:
      return null
  }
}

export function AccordionBlock({
  title,
  description,
  allowMultiple = false,
  accordionItems,
}: AccordionBlockProps) {
  if (!accordionItems || accordionItems.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      {(title || description) && (
        <div className="mb-8">
          {title && <h2 className="mb-4 text-3xl font-bold">{title}</h2>}
          {description && <p className="max-w-2xl text-muted-foreground">{description}</p>}
        </div>
      )}

      {allowMultiple ? (
        <Accordion type="multiple" className="space-y-4">
          {accordionItems.map((item, index) => (
            <AccordionItem
              key={item.id || `accordion-${index}`}
              value={item.id || `accordion-${index}`}
              className="rounded-xl border border-border bg-white px-6 shadow-sm transition-all duration-300 hover:shadow-lg data-[state=open]:border-indigo-200 data-[state=open]:shadow-lg"
            >
              <AccordionTrigger className="py-5 text-left hover:no-underline">
                <span className="font-medium">{item.itemTitle}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="space-y-4">
                  {Array.isArray(item.contentItems) &&
                    item.contentItems.map((contentItem, contentIndex) =>
                      renderContentItem(contentItem, contentIndex)
                    )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {accordionItems.map((item, index) => (
            <AccordionItem
              key={item.id || `accordion-${index}`}
              value={item.id || `accordion-${index}`}
              className="rounded-xl border border-border bg-white px-6 shadow-sm transition-all duration-300 hover:shadow-lg data-[state=open]:border-indigo-200 data-[state=open]:shadow-lg"
            >
              <AccordionTrigger className="py-5 text-left hover:no-underline">
                <span className="font-medium">{item.itemTitle}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="space-y-4">
                  {Array.isArray(item.contentItems) &&
                    item.contentItems.map((contentItem, contentIndex) =>
                      renderContentItem(contentItem, contentIndex)
                    )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </section>
  )
}
