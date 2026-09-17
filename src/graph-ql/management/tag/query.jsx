import { gql } from '@apollo/client'

export const tag = `
  _id
  dCreated
  dUpdated
  eStatus
  sContent
  sName
  sSubTitle
  oImg {
    sUrl
    sText
    sCaption
    sAttribute
  }
  oSeo {
    _id
    aKeywords
    eType
    iId
    oFB {
      sDescription
      sTitle
      sUrl
    }
    oTwitter {
      sDescription
      sTitle
      sUrl
    }
    sCUrl
    sDescription
    sSlug
    sRobots
    sTitle
  }      
`

export const GET_TAG_BY_ID = gql`
  query GetTagById($input: getTagById) {
    getTagById(input: $input) {
      ${tag}
    }
  }
`

export const GET_TAG_LIST = gql`
  query Query($input: getTagsInput) {
    getTags(input: $input) {
      aResults {
        oSubAdmin {
          sFName
        }
        oSeo {
          sSlug
        }
        _id
        eStatus
        sName
        dCreated
        dUpdated
      }
      nTotal
    }
  }
`
export const GET_SEO_DATA_BY_ID = gql`
  query GetSeoByIdAdmin($input: oGetSeoByIdAdminInput!) {
    getSeoByIdAdmin(input: $input) {
      sTitle
      sSlug
      sRobots
      sDescription
      sCUrl
      oTwitter {
        sUrl
        sTitle
        sDescription
      }
      oFB {
        sUrl
        sTitle
        sDescription
      }
      iId
      eType
      eStatus
      aKeywords
      _id
    }
  }
`
