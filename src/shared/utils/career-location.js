import { CAREER_LOCATION_LABEL } from 'shared/constants'

export const CAREER_LOCATION_LIST_LIMIT = 1000

export function getCareerLocationOptions(locations = [], { includeInactive = false, includeDeleted = false } = {}) {
  if (!Array.isArray(locations)) return []

  return locations
    .filter((location) => location?._id && location?.sName)
    .filter((location) => {
      if (location.eStatus === 'd') return includeDeleted
      if (location.eStatus === 'i') return includeInactive
      return true
    })
    .map((location) => ({
      label: location.sName,
      value: location._id,
      eStatus: location.eStatus,
      sName: location.sName
    }))
}

export function getCareerLocationLabel(value, options = []) {
  if (!value) return '-'

  const option = options.find((item) => item.value === value || item.label === value)
  if (option) return option.label

  return CAREER_LOCATION_LABEL[value] || value
}

export function getCareerLocationOption(value, options = []) {
  if (!value) return null

  const option = options.find((item) => item.value === value || item.label === value)
  if (option) return option

  return {
    label: getCareerLocationLabel(value, options),
    value
  }
}
