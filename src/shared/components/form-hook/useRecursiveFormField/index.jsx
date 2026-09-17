import { useFieldArray } from 'react-hook-form'

function useCategoryFormField(prefix, control) {
  const CategoryArrayInputPath = prefix?.length ? `${prefix}aChildren` : 'category'

  const { fields, insert, remove } = useFieldArray({
    control,
    name: CategoryArrayInputPath
  })

  return {
    fields,
    insert,
    remove,
    passPrefix: prefix,
    CategoryArrayInputPath
  }
}

export default useCategoryFormField
