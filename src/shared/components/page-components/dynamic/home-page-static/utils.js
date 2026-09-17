export function getDefaultImage() {
  return {
    sUrl: '',
    sText: '',
    sCaption: '',
    sAttribute: ''
  }
}

export function getDefaultCta() {
  return {
    sLabel: '',
    sUrl: ''
  }
}

export function getDefaultImpactCard() {
  return {
    sTitle: '',
    sDescription: '',
    sNumber: ''
  }
}

export function getDefaultImpactCards(count = 4) {
  return Array.from({ length: count }, () => getDefaultImpactCard())
}

export function getDefaultSector() {
  return {
    sTitle: '',
    sSlug: '',
    sDescription: '',
    sMediaUrl: '',
    eMediaType: 'i',
    oMedia: getDefaultImage()
  }
}

export function getDefaultLinkCard() {
  return {
    sTitle: '',
    sDescription: '',
    sRedirectUrl: '',
    eTarget: '_self',
    oImg: getDefaultImage()
  }
}

export function getDefaultWhyProclinkCard() {
  return {
    ...getDefaultLinkCard(),
    eMediaType: 'i',
    sMediaUrl: ''
  }
}

export function getDefaultProductCard() {
  return {
    sProductName: '',
    sTitle: '',
    sDescription: '',
    sRedirectUrl: '',
    eTarget: '_self',
    eMediaType: 'i',
    sMediaUrl: '',
    oImg: getDefaultImage()
  }
}

export function getDefaultLogo() {
  return {
    oImg: getDefaultImage()
  }
}

export function getDefaultInsightCard() {
  return {
    sBadge: '',
    sTitle: '',
    sRedirectUrl: '',
    oImg: getDefaultImage()
  }
}

export function getDefaultTestimonial() {
  return {
    sName: '',
    sRole: '',
    sQuote: '',
    oImg: getDefaultImage()
  }
}

export function getDefaultCareerBanner() {
  return {
    sTitle: '',
    sDescription: '',
    aCta: [getDefaultCta()],
    oImg: getDefaultImage()
  }
}
