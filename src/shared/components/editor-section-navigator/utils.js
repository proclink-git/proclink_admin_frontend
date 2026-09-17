function sanitizeSectionToken(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section'
}

export function getEditorStaticSectionId(anchorPrefix, sectionKey) {
  return `editor-section-${sanitizeSectionToken(anchorPrefix)}-${sanitizeSectionToken(sectionKey)}`
}

function getComponentInstanceId(component = {}) {
  return component?.instanceId || component?.iId?.instanceId || component?.__componentInstanceId || ''
}

export function getEditorComponentSectionId(anchorPrefix, component = {}, index = 0) {
  const componentType = component?.eType || component?.iId?.eType || 'component'
  const componentId = component?._id || component?.iId?._id || component?.iId || componentType
  const componentInstanceId = getComponentInstanceId(component) || `${componentId}-${index}`

  return `editor-section-${sanitizeSectionToken(anchorPrefix)}-${sanitizeSectionToken(componentInstanceId)}-${sanitizeSectionToken(componentType)}`
}

export function getEditorComponentSectionLabel(component = {}, index = 0) {
  return component?.iId?.sComponentTitle || component?.sComponentTitle || `Section ${index + 1}`
}

export function buildEditorSections({
  basicsLabel = 'Page basics',
  seoLabel = 'SEO',
  components = [],
  anchorPrefix,
  includeBasics = true,
  includeSeo = true
}) {
  const sectionPrefix = anchorPrefix || 'editor'
  const dynamicSections = (Array.isArray(components) ? components : []).map((component, index) => ({
    id: getEditorComponentSectionId(sectionPrefix, component, index),
    label: getEditorComponentSectionLabel(component, index),
    eType: component?.eType || component?.iId?.eType || '',
    kind: 'component'
  }))
  const staticSections = []

  if (includeBasics) {
    staticSections.push({
      id: getEditorStaticSectionId(sectionPrefix, 'basics'),
      label: basicsLabel,
      kind: 'static'
    })
  }

  if (includeSeo) {
    staticSections.push({
      id: getEditorStaticSectionId(sectionPrefix, 'seo'),
      label: seoLabel,
      kind: 'static'
    })
  }

  return [
    ...staticSections.slice(0, includeBasics ? 1 : 0),
    ...dynamicSections,
    ...staticSections.slice(includeBasics ? 1 : 0)
  ]
}
