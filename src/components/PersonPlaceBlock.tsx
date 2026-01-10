import Image from 'next/image'

interface CustomField {
  label: string
  value: string
  id?: string | null
}

interface ReadMoreLink {
  enabled?: boolean | null
  url?: string | null
  openInNewTab?: boolean | null
}

interface PersonPlaceItem {
  photo: string | { url?: string | null; alt?: string }
  name: string
  subtitle?: string | null
  description?: string | null
  customFields?: CustomField[] | null
  readMoreLink?: ReadMoreLink | null
  id?: string | null
}

export interface PersonPlaceBlockProps {
  displayMode: 'grid' | 'fullRow'
  itemsPerRow?: '3' | '4' | null
  items: PersonPlaceItem[]
}

export function PersonPlaceBlock({ displayMode, itemsPerRow = '3', items }: PersonPlaceBlockProps) {
  if (!items || items.length === 0) {
    return null
  }

  if (displayMode === 'fullRow') {
    return (
      <div className="my-12 space-y-8">
        {items.map((item, index) => {
          const imageUrl = typeof item.photo === 'object' ? item.photo?.url : null
          const imageAlt = typeof item.photo === 'object' ? item.photo?.alt || item.name : item.name

          return (
            <div
              key={item.id || index}
              className="flex flex-col gap-6 overflow-hidden rounded-2xl bg-white p-6 shadow-lg md:flex-row"
            >
              {/* Photo */}
              <div className="relative h-64 w-full shrink-0 overflow-hidden rounded-xl md:h-auto md:w-64">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    unoptimized={true}
                    className="object-cover"
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col">
                <h3 className="mb-1 text-2xl font-bold text-foreground">{item.name}</h3>
                {item.subtitle && (
                  <p className="mb-4 break-words text-lg text-muted-foreground">{item.subtitle}</p>
                )}
                {item.description && (
                  <div className="mb-4 whitespace-pre-line break-words leading-relaxed text-foreground/80">
                    {item.description}
                  </div>
                )}

                {/* Custom Fields */}
                {item.customFields && item.customFields.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {item.customFields.map((field, fieldIndex) => (
                      <div key={field.id || fieldIndex} className="flex gap-2">
                        <span className="font-medium text-foreground">{field.label}:</span>
                        <span className="text-muted-foreground">{field.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Read More Link */}
                {item.readMoreLink?.enabled && item.readMoreLink.url && (
                  <div className="mt-auto pt-4">
                    <a
                      href={item.readMoreLink.url}
                      target={item.readMoreLink.openInNewTab ? '_blank' : '_self'}
                      rel={item.readMoreLink.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-2 font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                    >
                      Read more
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Grid mode
  const gridCols = itemsPerRow === '4' ? 'md:grid-cols-4' : 'md:grid-cols-3'

  return (
    <div className={`my-12 grid grid-cols-1 gap-6 sm:grid-cols-2 ${gridCols}`}>
      {items.map((item, index) => {
        const imageUrl = typeof item.photo === 'object' ? item.photo?.url : null
        const imageAlt = typeof item.photo === 'object' ? item.photo?.alt || item.name : item.name

        return (
          <div
            key={item.id || index}
            className="group overflow-hidden rounded-xl bg-white shadow-lg transition-shadow hover:shadow-xl"
          >
            {/* Photo */}
            <div className="relative aspect-square overflow-hidden">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  unoptimized={true}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="mb-1 text-lg font-bold text-foreground">{item.name}</h3>
              {item.subtitle && (
                <p className="mb-2 text-sm text-muted-foreground">{item.subtitle}</p>
              )}
              {item.description && (
                <p className="mb-3 line-clamp-3 break-words text-sm leading-relaxed text-foreground/80">
                  {item.description}
                </p>
              )}

              {/* Read More Link */}
              {item.readMoreLink?.enabled && item.readMoreLink.url && (
                <div className="mt-auto pt-2">
                  <a
                    href={item.readMoreLink.url}
                    target={item.readMoreLink.openInNewTab ? '_blank' : '_self'}
                    rel={item.readMoreLink.openInNewTab ? 'noopener noreferrer' : undefined}
                    className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                  >
                    Read more &rarr;
                  </a>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
