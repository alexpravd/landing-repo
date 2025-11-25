'use client'

import React, { useState } from 'react'
import { useField } from '@payloadcms/ui'
import * as Icons from 'lucide-react'
import { iconMap, type IconName } from '../lib/icons'

export const IconSelectField: React.FC = () => {
  const { value, setValue } = useField<string>()
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredIcons = Object.keys(iconMap).filter((iconName) =>
    iconName.toLowerCase().includes(search.toLowerCase())
  )

  const SelectedIcon = value ? iconMap[value as IconName] : null

  return (
    <div className="field-type">
      <div className="relative">
        <div
          className="flex items-center gap-3 p-3 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors bg-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {SelectedIcon && (
            <div className="flex items-center gap-2">
              <SelectedIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">{value}</span>
            </div>
          )}
          {!SelectedIcon && (
            <span className="text-sm text-gray-500">Select an icon...</span>
          )}
        </div>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-xl max-h-96 overflow-hidden">
              <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-5 gap-2 p-3 overflow-y-auto max-h-80">
                {filteredIcons.map((iconName) => {
                  const IconComponent = iconMap[iconName as IconName]
                  const isSelected = value === iconName

                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => {
                        setValue(iconName)
                        setIsOpen(false)
                      }}
                      className={`
                        flex flex-col items-center justify-center p-3 rounded-md transition-all
                        hover:bg-blue-50 hover:border-blue-300 border-2
                        ${isSelected ? 'bg-blue-100 border-blue-500' : 'bg-white border-transparent'}
                      `}
                      title={iconName}
                    >
                      <IconComponent className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-gray-700'}`} />
                      <span className="text-[10px] mt-1 truncate w-full text-center leading-tight">
                        {iconName}
                      </span>
                    </button>
                  )
                })}
              </div>

              {filteredIcons.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Icons.Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No icons found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
