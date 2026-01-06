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
          className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-300 bg-white p-3 transition-colors hover:border-blue-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          {SelectedIcon && (
            <div className="flex items-center gap-2">
              <SelectedIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">{value}</span>
            </div>
          )}
          {!SelectedIcon && <span className="text-sm text-gray-500">Select an icon...</span>}
        </div>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute z-50 mt-2 max-h-96 w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-xl">
              <div className="sticky top-0 border-b border-gray-200 bg-white p-3">
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid max-h-80 grid-cols-5 gap-2 overflow-y-auto p-3">
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
                      className={`flex flex-col items-center justify-center rounded-md border-2 p-3 transition-all hover:border-blue-300 hover:bg-blue-50 ${isSelected ? 'border-blue-500 bg-blue-100' : 'border-transparent bg-white'} `}
                      title={iconName}
                    >
                      <IconComponent
                        className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}
                      />
                      <span className="mt-1 w-full truncate text-center text-[10px] leading-tight">
                        {iconName}
                      </span>
                    </button>
                  )
                })}
              </div>

              {filteredIcons.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Icons.Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
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
