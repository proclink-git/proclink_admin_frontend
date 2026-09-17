import { gql } from '@apollo/client'

export const GET_POPUP_LIST = gql`
  query ListPopup($input: listPopupInput!) {
    listPopup(input: $input) {
      nTotal
      aResults {
        _id
        sPopupTitle
        bIsPermanent
        eStatus
        dStartDate
        dEndDate
      }
    }
  }
`

const eventPopup = `
  oEventPopup {
    sTitle
    sSupportingLine
    sHeading
    sCTAText
    sCTALink
    dEventDate
  }
`
const generalPopup = `
  oGeneralPopup {
    sHeading
    sSupportingLine
    sCTAText
  }
`
const surveyPopup = `
  oSurveyPopup {
    sCTAText
    aQuestion {
      sQuestion
      aOptions
    }
  }
`
const exitPopup = `
  oExitIntentPopup {
    sHeading
    sSupportingLine
    sCTAText
  }
`
const downloadPopup = `
  oDownloadableContentPopup {
    sBadge
    sCTAText
    oWhitePaper {
      _id
      sTitle
    }
  }
`
const contentPopup = `
  oContentRecommendationPopup {
    sBadge
    sCTAText
    oContentData {
      eType
      iId
    }
    oArticle {
      _id
      oSeo {
        sSlug
      }
    }
    oIndustry {
      _id
      oSeo {
        sSlug
      }
    }
    oService {
      _id
      oSeo {
        sSlug
      }
    }
  }
`
export const GET_POPUP_BY_ID = gql`
  query GetPopup($input: getPopupInput!) {
    getPopup(input: $input) {
      oData {
        ePopupType
        dStartDate
        dEndDate
        nDelay
        nFrequency
        aSeoId {
          _id
          sSlug
          eType
        }
        bIsPermanent
        bIsForAllPages
        sPopupTitle
        oBannerImage {
          sUrl
          sText
        }
        ${eventPopup}
        ${generalPopup}
        ${surveyPopup}
        ${exitPopup}
        ${downloadPopup}
        ${contentPopup}
      }
    }
  }
`
