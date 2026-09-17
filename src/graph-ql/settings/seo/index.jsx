import { gql } from '@apollo/client'

const seo = `
oData {
  _id
  aKeywords
  dCreated
  dUpdated
  eStatus
  eType
  iUpdatedBy
  oFB {
    sUrl
    sTitle
    sDescription
  }
  oTwitter {
    sUrl
    sTitle
    sDescription
  }
  sCUrl
  sDescription
  sRobots
  sSlug
  sTitle
}
`
export const LIST_SEO = gql`
  query Query($input: oListSeoInput) {
    listSeo(input: $input) {
      nTotal
      aResults {
        sSlug
        _id
        aKeywords
        dUpdated
        dCreated
        eStatus
        iUpdatedBy
        eType
        sTitle
        oSubAdmin {
          sFName
        }
      }
    }
  }
`
export const GET_SEO_BY_ID = gql`
  query GetSeoById($input: oGetSeoByIdInput) {
    getSeoById(input: $input) {
      _id
      aKeywords
      dCreated
      dUpdated
      eStatus
      eType
      iUpdatedBy
      oFB {
        sDescription
        sUrl
        sTitle
      }
      oTwitter {
        sUrl
        sTitle
        sDescription
      }
      sCUrl
      sDescription
      sRobots
      sSlug
      sTitle
    }
  }
`

export const GET_SEOS_BY_ID = gql`
  query GetSeosById($input: oSeoByIdInput!) {
    getSeosById(input: $input) {
      _id
      sSlug
      sTitle
      eType
      aKeywords
      eSubType
      sContent
      sDTitle
      oFB {
        sTitle
        sDescription
      }
      oTwitter {
        sTitle
        sDescription
      }
      sCUrl
      sDescription
      sRobots
    }
  }
`
export const ADD_SEO = gql`
  mutation AddSeo($input: oSeoInput) {
    addSeo(input: $input) {
      ${seo}
      sMessage
    }
  }
`
export const EDIT_SEO = gql`
mutation UpdateSeo($input: oSeoInput) {
  updateSeo(input: $input) {
    sMessage
    ${seo}
  }
}
`

export const BULK_OPERATION = gql`
  mutation Mutation($input: oBulkUpdateInput) {
    bulkSeoUpdate(input: $input) {
      sMessage
    }
  }
`
export const GET_SEO_BY_SLUG = gql`
  query GetSeoBySlug($input: oSlugInput) {
    getSeoBySlug(input: $input) {
      _id
      aKeywords
      dCreated
      dUpdated
      eStatus
      iId
      eType
      iUpdatedBy
      oFB {
        sUrl
        sTitle
        sDescription
      }
      oTwitter {
        sDescription
        sTitle
        sUrl
      }
      sCUrl
      sDescription
      sRobots
      sSlug
      sTitle
    }
  }
`

export const LIST_SEO_FOR_POPUP = gql`
  query AResults($input: listSeoForPopupInput!) {
  listSeoForPopup(input: $input) {
    aResults {
      iId
      sSlug
      eType
      _id
    }
  }
}
`
