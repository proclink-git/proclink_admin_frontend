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

export function getDefaultTextItem() {
  return {
    sValue: ''
  }
}

export function getDefaultComparisonItem() {
  return {
    sTitle: '',
    sDescription: ''
  }
}

export function getDefaultTitleDescriptionItem() {
  return {
    sTitle: '',
    sDescription: ''
  }
}

export function getDefaultImageCard() {
  return {
    sTitle: '',
    sDescription: '',
    oImg: getDefaultImage()
  }
}

export function getDefaultMediaImageCard() {
  return {
    ...getDefaultImageCard(),
    eMediaType: 'i',
    sMediaUrl: ''
  }
}

export function getDefaultImageTitleItem() {
  return {
    sTitle: '',
    oImg: getDefaultImage()
  }
}

export function getDefaultProductInterfaceItem() {
  return {
    ...getDefaultImageTitleItem(),
    eMediaType: 'i',
    sMediaUrl: ''
  }
}

export function getDefaultBenefitItem() {
  return {
    sTitle: '',
    oImg: getDefaultImage()
  }
}

export function getDefaultDualMedia() {
  return {
    sMediaUrl: '',
    eMediaType: 'v',
    oMedia: getDefaultImage(),
    sThumbnailUrl: '',
    oThumbnail: getDefaultImage(),
    sTopLeftContent: '',
    sBottomRightContent: ''
  }
}

export function getDefaultRelevantServiceCard() {
  return {
    oImg: getDefaultImage(),
    sTitle: '',
    sRedirectUrl: '',
    eTarget: '_self',
    sSlug: ''
  }
}

export function getDefaultIndustrialSectorCard() {
  return {
    oIcon: getDefaultImage(),
    sTitle: '',
    sDescription: '',
    sUrl: ''
  }
}

export function getDefaultFaqItem() {
  return {
    sQuestion: '',
    sAnswer: ''
  }
}
