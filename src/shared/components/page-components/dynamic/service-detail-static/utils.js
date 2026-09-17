import {
  getDefaultAnimatedFeatureCard,
  getDefaultContentShowcaseCard,
  getDefaultCta,
  getDefaultFaqItem,
  getDefaultFocusAreaCard,
  getDefaultImage,
  getDefaultIndustrialSectorCard,
  getDefaultLeadershipCard,
  getDefaultMarqueeLogo,
  getDefaultMetricCard,
  getDefaultRelevantServiceCard
} from '../industry-detail-static/utils'
import { getDefaultLogo } from '../home-page-static/utils'

export {
  getDefaultAnimatedFeatureCard,
  getDefaultContentShowcaseCard,
  getDefaultCta,
  getDefaultFaqItem,
  getDefaultFocusAreaCard,
  getDefaultImage,
  getDefaultIndustrialSectorCard,
  getDefaultLeadershipCard,
  getDefaultLogo,
  getDefaultMarqueeLogo,
  getDefaultMetricCard,
  getDefaultRelevantServiceCard
}

export function getDefaultServiceFeatureCard() {
  return {
    sTitle: '',
    sDescription: '',
    oIcon: getDefaultImage()
  }
}

export function getDefaultServiceImpactCard() {
  return {
    sValue: '',
    sLabel: ''
  }
}

export function getDefaultServiceAnimatedScrollCard() {
  return {
    sTitle: '',
    sDescription: '',
    oLogo: getDefaultImage(),
    oCta: getDefaultCta()
  }
}

export function getDefaultServiceSolutionCard() {
  return {
    oImg: getDefaultImage(),
    sTitle: '',
    sDescription: '',
    sLinkText: '',
    sSlug: ''
  }
}

export function getDefaultServiceGalleryPanel() {
  return {
    sTitle: '',
    sContent: '',
    oImgTopLeft: getDefaultImage(),
    oImgBottomLeft: getDefaultImage(),
    oImgTopRight: getDefaultImage(),
    oImgBottomRight: getDefaultImage()
  }
}

export function getDefaultServiceVisualCard() {
  return {
    sTag: '',
    sTitle: '',
    sDescription: '',
    oImgTop: getDefaultImage(),
    oImgBottomLeft: getDefaultImage(),
    oImgBottomRight: getDefaultImage()
  }
}

export function getDefaultServiceImpactLine() {
  return {
    sDescription: '',
    sValue: '',
    sLabel: ''
  }
}

export function getDefaultServiceUseCaseCard() {
  return {
    sTag: '',
    oImg: getDefaultImage(),
    sTitle: '',
    sDescription: '',
    sSlug: ''
  }
}

export function getDefaultServiceCapabilityCard() {
  return {
    oLogo: getDefaultImage(),
    sTitle: '',
    sDescription: '',
    sSlug: ''
  }
}
