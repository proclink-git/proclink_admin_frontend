import { gql } from '@apollo/client'

export const LIST_SERVICES = gql`
  query ListService($input: oServicePaginationInput) {
    listService(input: $input) {
    nTotal
    aResults {
        sTitle
        _id
        sDescription
        oSeo {
        sSlug
        }
      }
    }
  }
`
export const GET_SERVICE = gql`
query GetService($input: oGetServiceInput!) {
  getService(input: $input) {
    _id
    sTitle
    sDescription
    eStatus
   
    aComponent {
      iId {
        sComponentTitle
        _id
      }
      eType
      instanceId
    }
    dCreated
    dUpdated
    oComponents
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
  }
}
`

export const LIST_SERVICE_WITHOUT_PERMISSION = gql`
query ListServiceFront($input: listServiceFrontInput) {
  listServiceFront(input: $input) {
    nTotal
    aResults {
      _id
      sTitle
      sShortTitle
    }
  }
}`
