'use client'

import React, { useState } from 'react'
import Image from 'next/image'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, width, height } = props

  return didError ? (
    <div
      className={`inline-block bg-muted text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex h-full w-full items-center justify-center">
        <Image
          src={ERROR_IMG_SRC}
          alt="Error loading image"
          width={88}
          height={88}
          data-original-url={typeof src === 'string' ? src : undefined}
          unoptimized // Keep unoptimized for data URIs only
        />
      </div>
    </div>
  ) : (
    <Image
      src={typeof src === 'string' ? src : ''}
      alt={alt || ''}
      width={typeof width === 'number' ? width : 800}
      height={typeof height === 'number' ? height : 600}
      className={className}
      style={style}
      onError={handleError}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
