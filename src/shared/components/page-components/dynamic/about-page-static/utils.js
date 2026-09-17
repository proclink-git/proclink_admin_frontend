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

export function getDefaultAboutStatement() {
  return {
    sTitle: '',
    sDescription: ''
  }
}

export const ABOUT_HEADER_STATEMENT_COUNT = 3

export function getDefaultWhoWeAreItem() {
  return {
    oImg: getDefaultImage(),
    sDescription: ''
  }
}

export function getDefaultCredibilityCard() {
  return {
    sLabel: '',
    sDescription: ''
  }
}

export function getDefaultOperationalInsightItem() {
  return {
    oImg: getDefaultImage(),
    sTitle: '',
    sDescription: ''
  }
}

export function getDefaultBeliefItem() {
  return {
    sTitle: '',
    sDescription: ''
  }
}

export function getDefaultLeadershipCard() {
  return {
    oImg: getDefaultImage(),
    sName: '',
    sDesignation: '',
    sDescription: '',
    sRedirectUrl: '',
    eTarget: '_self'
  }
}

export function getDefaultMissionVisionItem() {
  return {
    oImg: getDefaultImage(),
    sTitle: '',
    sContent: ''
  }
}

export const PICTURE_FUTURE_LINE_COUNT = 3

export function getDefaultPictureFutureLines() {
  return Array(PICTURE_FUTURE_LINE_COUNT).fill('')
}
