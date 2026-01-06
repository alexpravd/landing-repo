'use client'

import React, { useState } from 'react'
import { useField } from '@payloadcms/ui'
import { gradientPresets, type GradientPreset } from '../lib/gradients'

export const GradientSelectField: React.FC = () => {
  const { value, setValue } = useField<string>()
  const [isOpen, setIsOpen] = useState(false)

  const selectedGradient = value ? gradientPresets[value as GradientPreset] : null

  return (
    <div className="field-type">
      <div className="relative">
        <div
          className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-300 bg-white p-3 transition-colors hover:border-blue-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedGradient && (
            <div className="flex flex-1 items-center gap-3">
              <div
                className="h-8 w-8 rounded-md border border-gray-200 shadow-sm"
                style={{ background: selectedGradient.preview }}
              />
              <span className="text-sm font-medium">{selectedGradient.label}</span>
            </div>
          )}
          {!selectedGradient && <span className="text-sm text-gray-500">Select a gradient...</span>}
        </div>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute z-50 mt-2 max-h-96 w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-xl">
              <div className="max-h-80 overflow-y-auto p-2">
                {Object.entries(gradientPresets).map(([key, gradient]) => {
                  const isSelected = value === key

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setValue(key)
                        setIsOpen(false)
                      }}
                      className={`mb-2 flex w-full items-center gap-3 rounded-md border-2 p-3 transition-all hover:bg-gray-50 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white'} `}
                    >
                      <div
                        className="h-10 w-10 flex-shrink-0 rounded-md border border-gray-200 shadow-sm"
                        style={{ background: gradient.preview }}
                      />
                      <span
                        className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}
                      >
                        {gradient.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
