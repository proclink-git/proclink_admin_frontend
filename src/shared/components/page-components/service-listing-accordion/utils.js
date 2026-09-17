export function getDefaultServiceListingImage() {
  return {
    sUrl: '',
    sText: '',
    sCaption: '',
    sAttribute: ''
  }
}

export function getDefaultServiceListingCta() {
  return {
    sLabel: '',
    sUrl: ''
  }
}

export function normalizeServiceListingTags(tags = []) {
  const nextTags = (Array.isArray(tags) ? tags : []).map((tag) => (typeof tag === 'string' ? tag : ''))
  return nextTags.length ? nextTags : ['']
}

export function cleanServiceListingTags(tags = []) {
  return (Array.isArray(tags) ? tags : []).map((tag) => (typeof tag === 'string' ? tag.trim() : '')).filter(Boolean)
}

export function getDefaultServiceListingCard() {
  return {
    oImgPrimary: getDefaultServiceListingImage(),
    oImgSecondary: getDefaultServiceListingImage(),
    sTitle: '',
    sDescription: '',
    oCta: getDefaultServiceListingCta(),
    aTag: ['']
  }
}

export function getDefaultServiceListingSection() {
  return {
    sTitle: '',
    sDescription: '',
    aCard: [getDefaultServiceListingCard()]
  }
}

export function normalizeServiceListingCard(card = {}, normalizeImage = (value = {}) => ({ ...getDefaultServiceListingImage(), ...(value || {}) })) {
  return {
    ...getDefaultServiceListingCard(),
    ...card,
    oImgPrimary: normalizeImage(card?.oImgPrimary),
    oImgSecondary: normalizeImage(card?.oImgSecondary),
    oCta: {
      ...getDefaultServiceListingCta(),
      ...(card?.oCta || {})
    },
    aTag: normalizeServiceListingTags(card?.aTag)
  }
}

export function normalizeServiceListingSection(section = {}, normalizeImage = (value = {}) => ({ ...getDefaultServiceListingImage(), ...(value || {}) })) {
  const data = section || {}
  const cards = (Array.isArray(data?.aCard) ? data.aCard : []).map((card) => normalizeServiceListingCard(card, normalizeImage))

  return {
    ...getDefaultServiceListingSection(),
    ...data,
    sTitle: data?.sTitle || '',
    sDescription: data?.sDescription || '',
    aCard: cards.length ? cards : [getDefaultServiceListingCard()]
  }
}

export function buildServiceListingSectionForSubmit(section = {}, normalizeImage = (value = {}) => value || getDefaultServiceListingImage()) {
  const data = section || {}
  const cards = (Array.isArray(data?.aCard) ? data.aCard : [])
    .map((card) => normalizeServiceListingCard(card, normalizeImage))
    .map((card) => ({
      oImgPrimary: normalizeImage(card?.oImgPrimary),
      oImgSecondary: normalizeImage(card?.oImgSecondary),
      sTitle: card?.sTitle || '',
      sDescription: card?.sDescription || '',
      oCta: {
        sLabel: card?.oCta?.sLabel || '',
        sUrl: card?.oCta?.sUrl || ''
      },
      aTag: cleanServiceListingTags(card?.aTag)
    }))
    .filter((card) => card?.sTitle || card?.sDescription || card?.oCta?.sLabel || card?.oCta?.sUrl || card?.oImgPrimary?.sUrl || card?.oImgSecondary?.sUrl || card?.aTag?.length)

  return {
    ...data,
    sTitle: data?.sTitle || '',
    sDescription: data?.sDescription || '',
    aCard: cards
  }
}
