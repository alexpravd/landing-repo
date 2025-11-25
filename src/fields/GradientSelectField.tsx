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
          className="flex items-center gap-3 p-3 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors bg-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedGradient && (
            <div className="flex items-center gap-3 flex-1">
              <div
                className="h-8 w-8 rounded-md shadow-sm border border-gray-200"
                style={{ background: selectedGradient.preview }}
              />
              <span className="text-sm font-medium">{selectedGradient.label}</span>
            </div>
          )}
          {!selectedGradient && (
            <span className="text-sm text-gray-500">Select a gradient...</span>
          )}
        </div>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-xl max-h-96 overflow-hidden">
              <div className="p-2 overflow-y-auto max-h-80">
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
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-md transition-all mb-2
                        hover:bg-gray-50 border-2
                        ${isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-transparent'}
                      `}
                    >
                      <div
                        className="h-10 w-10 rounded-md shadow-sm border border-gray-200 flex-shrink-0"
                        style={{ background: gradient.preview }}
                      />
                      <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
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
