export function getDefaultHeaderCategoryImage() {
  return {
    sText: '',
    sCaption: '',
    sAttribute: '',
    sUrl: ''
  }
}

export function getDefaultUpcomingWebinarCard() {
  return {
    oImg: getDefaultHeaderCategoryImage(),
    sTitle: '',
    sTag: '',
    sAuthorName: '',
    sAuthorDesignation: '',
    oAuthorImg: getDefaultHeaderCategoryImage(),
    sRedirectionUrl: '',
    eTarget: '_self',
    dDateTimeDisplay: ''
  }
}

export function getDefaultRecommendedEditorialCard() {
  return {
    sEyebrow: '',
    sTitle: '',
    sDescription: '',
    oImg: getDefaultHeaderCategoryImage()
  }
}
