// components/ui/form.jsx
import * as React from "react"
import { useFormContext, Controller } from "react-hook-form"

export function Form({ children, ...props }) {
  return (
    <form {...props}>
      {children}
    </form>
  )
}

export function FormField({ name, control, render, ...props }) {
  return (
    <Controller
      name={name}
      control={control}
      render={render}
      {...props}
    />
  )
}

export function FormItem({ children, ...props }) {
  return <div {...props}>{children}</div>
}

export function FormLabel({ children, ...props }) {
  return <label {...props}>{children}</label>
}

export function FormControl({ children, ...props }) {
  return <div {...props}>{children}</div>
}

export function FormDescription({ children, ...props }) {
  return <p {...props}>{children}</p>
}

export function FormMessage({ children, ...props }) {
  return <span {...props}>{children}</span>
}
