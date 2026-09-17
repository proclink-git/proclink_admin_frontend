import { gql } from '@apollo/client'

export const LIST_INDUSTRY_WITHOUT_PERMISSION = gql`
  query ListIndustryFront($input: oListIndustryInput) {
    listIndustryFront(input: $input) {
      aResults {
        sTitle
        sShortTitle
        _id
      }
    }
  }
`

export const LIST_INDUSTRY = gql`
  query ListIndustry($input: oListIndustryInput) {
    listIndustry(input: $input) {
      nTotal
      aResults {
        _id
        sTitle
        sDescription
        oSeo {
          sSlug
        }
      }
    }
  }
`

export const GET_INDUSTRY = gql`
query GetIndustry($input: getIndustryInput!) {
  getIndustry(input: $input) {
    oData {
      _id
      sTitle
      sDescription
      oSeo {
        _id
        iId
        sTitle
        sDescription
        sSlug
        aKeywords
        oFB {
          sTitle
          sDescription
          sUrl
        }
        oTwitter {
          sTitle
          sDescription
          sUrl
        }
        sCUrl
        sRobots
        eType
        eSubType
        eStatus
        bIsDeletable
        eCode
        eTabType
        sContent
        sAmpContent
        sDTitle
      }
      eStatus
      dCreated
      dUpdated
      aComponent {
        iId {
          sComponentTitle
          _id
        }
        eType
        instanceId
      }
      oComponents
    }
    sMessage
  }
}
`
