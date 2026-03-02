'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import type { Page, PageBlock, FAQBlock as FAQBlockType } from '@/payload-types'
import { SectionHeaderBlock } from '@/components/SectionHeaderBlock'
import { HeroBlock } from '@/components/HeroBlock'
import { FAQBlock } from '@/components/FAQBlock'
import { ServiceCardsBlock } from '@/components/ServiceCardsBlock'
import { AboutBlock } from '@/components/AboutBlock'
import { ValueCardsBlock } from '@/components/ValueCardsBlock'
import { CaseCardsBlock } from '@/components/CaseCardsBlock'

interface LivePreviewPageProps {
  initialData: Page
  locale?: string
}

export function LivePreviewPage({ initialData, locale }: LivePreviewPageProps) {
  const { data } = useLivePreview<Page>({
    initialData,
    serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
    depth: 2,
  })

  return <PageContent key={data.id} page={data} locale={locale} />
}

function PageContent({ page, locale }: { page: Page; locale?: string }) {
  const { content, blocks } = page

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Content */}
      <main>
        {/* Render rich text content if available */}
        {content && (
          <div className="prose prose-lg mb-8 max-w-none">
            <div dangerouslySetInnerHTML={{ __html: JSON.stringify(content) }} />
          </div>
        )}

        {/* Render blocks if available */}
        {blocks && blocks.length > 0 && (
          <div className="space-y-8">
            {blocks.map((block, index) => (
              <BlockRenderer key={block.id || index} block={block} locale={locale} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!content && (!blocks || blocks.length === 0) && (
          <div className="py-12 text-center text-muted-foreground">
            <p>This page has no content yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}

function BlockRenderer({ block, locale }: { block: PageBlock; locale?: string }) {
  const anchorId =
    'anchorId' in block ? (block as { anchorId?: string | null }).anchorId : undefined
  const content = (() => {
    switch (block.blockType) {
      case 'heroBlock':
        return (
          <HeroBlock
            headline={block.headline || ''}
            subheadline={block.subheadline ?? undefined}
            primaryCTA={block.primaryCTA ?? undefined}
            secondaryCTA={block.secondaryCTA ?? undefined}
            enableAnimation={block.enableAnimation !== false}
            locale={locale}
          />
        )

      case 'faqBlock':
        return (
          <FAQBlock
            title={block.title ?? undefined}
            questions={block.questions as FAQBlockType['questions']}
            allowMultiple={block.allowMultiple ?? false}
            enableAnimation={block.enableAnimation !== false}
          />
        )

      case 'sectionHeader':
        return (
          <SectionHeaderBlock
            layout={block.layout ?? undefined}
            title={block.title ?? undefined}
            subtitle={block.subtitle ?? undefined}
            description={block.description ?? undefined}
            primaryCTA={block.primaryCTA ?? undefined}
            secondaryCTA={block.secondaryCTA ?? undefined}
            enableAnimation={block.enableAnimation !== false}
            locale={locale}
          />
        )

      case 'serviceCardsBlock':
        return (
          <ServiceCardsBlock
            title={block.title ?? undefined}
            cards={block.cards}
            tags={block.tags ?? undefined}
            enableAnimation={block.enableAnimation ?? true}
            locale={locale}
          />
        )

      case 'aboutBlock':
        return (
          <AboutBlock
            title={block.title ?? undefined}
            image={block.image}
            badges={block.badges}
            description={block.description ?? undefined}
            ctaLabel={block.ctaLabel ?? undefined}
            ctaLinkType={block.ctaLinkType ?? undefined}
            ctaPage={block.ctaPage ?? undefined}
            ctaUrl={block.ctaUrl ?? undefined}
            ctaAnchor={block.ctaAnchor ?? undefined}
            ctaOpenInNewTab={block.ctaOpenInNewTab ?? undefined}
            enableAnimation={block.enableAnimation ?? true}
            locale={locale}
          />
        )

      case 'valueCardsBlock':
        return (
          <ValueCardsBlock
            title={block.title ?? undefined}
            description={block.description ?? undefined}
            tags={block.tags ?? undefined}
            cards={block.cards}
            enableAnimation={block.enableAnimation ?? true}
          />
        )

      case 'caseCardsBlock':
        return (
          <CaseCardsBlock
            title={block.title ?? undefined}
            displayMode={block.displayMode}
            cases={block.cases}
            reviews={block.reviews}
            enableAnimation={block.enableAnimation ?? true}
          />
        )

      default: {
        return (
          <div className="rounded border border-dashed border-muted p-4">
            <p className="text-sm text-muted-foreground">
              Unknown block type: {(block as PageBlock).blockType}
            </p>
          </div>
        )
      }
    }
  })()

  return anchorId ? (
    <div id={anchorId} className="scroll-mt-20">
      {content}
    </div>
  ) : (
    content
  )
}
