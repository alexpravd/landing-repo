export type GradientPreset = keyof typeof gradientPresets

export const gradientPresets = {
  'indigo-purple': {
    label: 'Indigo to Purple',
    value: 'indigo-purple',
    classes: 'from-indigo-500 to-purple-500',
    preview: 'linear-gradient(to right, rgb(99, 102, 241), rgb(168, 85, 247))',
  },
  'indigo-pink': {
    label: 'Indigo to Pink',
    value: 'indigo-pink',
    classes: 'from-indigo-600 via-purple-600 to-pink-600',
    preview: 'linear-gradient(to right, rgb(79, 70, 229), rgb(147, 51, 234), rgb(219, 39, 119))',
  },
  'blue-cyan': {
    label: 'Blue to Cyan',
    value: 'blue-cyan',
    classes: 'from-blue-500 to-cyan-500',
    preview: 'linear-gradient(to right, rgb(59, 130, 246), rgb(6, 182, 212))',
  },
  'purple-pink': {
    label: 'Purple to Pink',
    value: 'purple-pink',
    classes: 'from-purple-500 to-pink-500',
    preview: 'linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153))',
  },
  'green-emerald': {
    label: 'Green to Emerald',
    value: 'green-emerald',
    classes: 'from-green-500 to-emerald-500',
    preview: 'linear-gradient(to right, rgb(34, 197, 94), rgb(16, 185, 129))',
  },
  'orange-red': {
    label: 'Orange to Red',
    value: 'orange-red',
    classes: 'from-orange-500 to-red-500',
    preview: 'linear-gradient(to right, rgb(249, 115, 22), rgb(239, 68, 68))',
  },
  'yellow-orange': {
    label: 'Yellow to Orange',
    value: 'yellow-orange',
    classes: 'from-yellow-400 to-orange-500',
    preview: 'linear-gradient(to right, rgb(250, 204, 21), rgb(249, 115, 22))',
  },
  'teal-blue': {
    label: 'Teal to Blue',
    value: 'teal-blue',
    classes: 'from-teal-500 to-blue-500',
    preview: 'linear-gradient(to right, rgb(20, 184, 166), rgb(59, 130, 246))',
  },
  'rose-orange': {
    label: 'Rose to Orange',
    value: 'rose-orange',
    classes: 'from-rose-500 to-orange-500',
    preview: 'linear-gradient(to right, rgb(244, 63, 94), rgb(249, 115, 22))',
  },
  'violet-fuchsia': {
    label: 'Violet to Fuchsia',
    value: 'violet-fuchsia',
    classes: 'from-violet-500 to-fuchsia-500',
    preview: 'linear-gradient(to right, rgb(139, 92, 246), rgb(217, 70, 239))',
  },
  'slate-gray': {
    label: 'Slate to Gray',
    value: 'slate-gray',
    classes: 'from-slate-600 to-gray-600',
    preview: 'linear-gradient(to right, rgb(71, 85, 105), rgb(75, 85, 99))',
  },
  'amber-yellow': {
    label: 'Amber to Yellow',
    value: 'amber-yellow',
    classes: 'from-amber-500 to-yellow-400',
    preview: 'linear-gradient(to right, rgb(245, 158, 11), rgb(250, 204, 21))',
  },
} as const

export const gradientOptions = Object.values(gradientPresets).map((preset) => ({
  label: preset.label,
  value: preset.value,
}))

export const getGradientClasses = (gradient: GradientPreset | string) => {
  return (
    gradientPresets[gradient as GradientPreset]?.classes || gradientPresets['indigo-purple'].classes
  )
}
