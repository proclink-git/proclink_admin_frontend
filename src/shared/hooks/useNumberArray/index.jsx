import { useFormContext } from 'react-hook-form'

function useNumberArray(key) {
  const { setValue, getValues, watch } = useFormContext()

  function append(data) {
    const values = getValues(key) || []
    values.push(data)
    setValue(key, values)
  }

  function remove(i) {
    const values = getValues(key) || []
    values.splice(i, 1)
    setValue(key, values)
  }

  return {
    append,
    remove,
    value: watch(key) || []
  }
}
export default useNumberArray
