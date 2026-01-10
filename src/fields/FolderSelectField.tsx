'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { TextFieldClientComponent } from 'payload'
import { useField, TextInput, FieldLabel } from '@payloadcms/ui'

/**
 * Custom folder field that reads the default value from localStorage
 */
export const FolderSelectField: TextFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  const hasApplied = useRef(false)
  const retryCount = useRef(0)

  // Get stored folder on first render
  const [targetFolder] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('payload-media-upload-folder')
    if (stored) {
      console.log('[FolderSelectField] Found stored folder:', stored)
      localStorage.removeItem('payload-media-upload-folder')
      return stored
    }
    return null
  })

  const [displayValue, setDisplayValue] = useState<string>(targetFolder || value || '/')

  // Apply the target folder with retries
  useEffect(() => {
    if (!targetFolder || hasApplied.current) return

    const applyFolder = () => {
      console.log(
        '[FolderSelectField] Applying folder (attempt',
        retryCount.current + 1,
        '):',
        targetFolder
      )
      setDisplayValue(targetFolder)
      setValue(targetFolder)
      retryCount.current++

      // Retry a few times to overcome any race conditions
      if (retryCount.current < 5) {
        setTimeout(applyFolder, 100)
      } else {
        hasApplied.current = true
      }
    }

    // Start applying after a short delay
    setTimeout(applyFolder, 50)
  }, [targetFolder, setValue])

  // Sync with external value changes
  useEffect(() => {
    if (hasApplied.current && value && value !== displayValue) {
      setDisplayValue(value)
    }
  }, [value, displayValue])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setDisplayValue(newValue)
      setValue(newValue)
    },
    [setValue]
  )

  const isCustomFolder = displayValue !== '/'

  return (
    <div className="field-type text" style={{ marginBottom: '24px' }}>
      <FieldLabel label="Folder" path={path} />
      <div style={{ marginTop: '8px' }}>
        <TextInput path={path} value={displayValue} onChange={handleChange} />
      </div>
      <div
        style={{
          fontSize: '12px',
          marginTop: '8px',
          color: isCustomFolder ? '#22c55e' : 'var(--theme-elevation-500)',
          fontWeight: isCustomFolder ? 600 : 400,
        }}
      >
        {isCustomFolder ? `✓ Will upload to: ${displayValue}` : 'Folder path (e.g., /photos/2024)'}
      </div>
    </div>
  )
}
