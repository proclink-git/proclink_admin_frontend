import { gql } from '@apollo/client'

const cms = `
  _id
  sTitle
  sContent
  sDescription
  eStatus
  dUpdated
  dCreated
  oSeo {
    _id
    iId
    sDescription
    sTitle
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
  aComponents {
    iId
    eType
    instanceId
  }
  oCB {
    sTitle
    sDescription
    oImg {
      sText
      sCaption
      sAttribute
      sUrl
    }
    aCta {
      sLabel
      sUrl
    }
  }
`

export const LIST_CMS = gql`
  query ListCMSPage($input: oListCMSPageInput) {
    listCMSPage(input: $input) {
      aResults {
        dCreated
        dUpdated
        oSeo {
          sSlug
          __typename
        }
        sTitle
        eStatus
        _id
        __typename
      }
      nTotal
      __typename
    }
  }
`
export const GET_CMS_BY_ID = gql`
  query GetCMSPageById($input: oGetCmsById!) {
    getCMSPageById(input: $input) {
      ${cms}
    }
  }
`
export const ADD_CMS = gql`
  mutation AddCMSPage($input: oCmsInput) {
    addCMSPage(input: $input) {
      sMessage
    }
  }
`
export const EDIT_CMS = gql`
  mutation EditCMSPage($input: oEditCmsInput) {
    editCMSPage(input: $input) {
      sMessage
    }
  }
`

export const BULK_OPERATION = gql`
  mutation BulkUpdateCMSPage($input: oBulkUpdateCMSInput) {
    bulkUpdateCMSPage(input: $input) {
      sMessage
    }
  }
`
