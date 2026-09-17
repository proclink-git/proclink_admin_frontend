import { useEffect } from 'react'

export default function useEnsureFieldArrayDefault({
  fields,
  append,
  getValues,
  name,
  getDefaultValue,
  minLength = 1
}) {
  useEffect(() => {
    const currentItems = typeof getValues === 'function' ? getValues(name) : undefined
    const fromValues = Array.isArray(currentItems) ? currentItems.length : 0
    const count = Math.max(fields.length, fromValues)
    const missing = Math.max(0, minLength - count)
    if (!missing) return

    const items = Array.from({ length: missing }, () =>
      typeof getDefaultValue === 'function' ? getDefaultValue() : getDefaultValue
    )
    append(items.length === 1 ? items[0] : items)
  }, [append, fields.length, getDefaultValue, getValues, name, minLength])
}
