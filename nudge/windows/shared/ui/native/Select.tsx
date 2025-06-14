import { cva } from 'class-variance-authority'
import React, { ComponentProps } from 'react'

interface Option {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props extends ComponentProps<'select'> {
  options: Option[]
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  placeholder?: string
  disabled?: boolean
}

const selectStyles = cva(
  'border border-transparent dark:border-gray-700 rounded-md py-0 font-display-3p text-[13px] bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 shadow-sm',
  {
    variants: {
      size: {
        sm: 'text-sm px-2',
        md: 'text-base h-[32px] px-3',
        lg: 'text-lg px-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className,
  ...props
}: Props) {
  return (
    <select
      className={selectStyles({ className })}
      value={value === undefined ? '' : value}
      onChange={onChange}
      disabled={disabled}
      {...props}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
