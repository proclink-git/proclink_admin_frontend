import { E_HEADER_CATEGORY_TYPE, HEADER_CATEGORY_SLUG_ADMIN } from 'shared/constants'

const validHeaderCategoryTypes = new Set(E_HEADER_CATEGORY_TYPE.value)

function getFirstStaticPathSegment(path) {
  return path?.split('/').filter(Boolean).find((segment) => !segment.startsWith(':'))
}

function getCategoryTypesBySlug(slug) {
  return Object.entries(HEADER_CATEGORY_SLUG_ADMIN)
    .filter(([type, categorySlug]) => validHeaderCategoryTypes.has(type) && categorySlug === slug)
    .map(([type]) => type)
}

export function isValidPrivateRouteParams(params = {}, path = '', allowedCategoryTypes) {
  const { categorySlug, categoryType } = params
  const allowedTypes = Array.isArray(allowedCategoryTypes) ? allowedCategoryTypes : []

  if (!categoryType) return true
  if (!validHeaderCategoryTypes.has(categoryType)) return false
  if (allowedTypes.length && !allowedTypes.includes(categoryType)) return false

  if (categorySlug) {
    return HEADER_CATEGORY_SLUG_ADMIN[categoryType] === categorySlug
  }

  const firstStaticPathSegment = getFirstStaticPathSegment(path)
  if (!firstStaticPathSegment) return true

  const slugAllowedTypes = getCategoryTypesBySlug(firstStaticPathSegment)
  if (!slugAllowedTypes.length) return true

  return slugAllowedTypes.includes(categoryType)
}
