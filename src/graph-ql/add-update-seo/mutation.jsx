import gql from 'graphql-tag'

const seo = `
  oData {
    aKeywords
    eType
    iId
    _id
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
    sDTitle
    sContent
    sRobots
    sSlug
    sTitle
    eStatus
  }
`

export const ADD_SEO = gql`
  mutation InsertSeoMutation($input: oSeo) {
    insertSeo(input: $input) {
      sMessage
      ${seo}
    }
  }
`
export const UPDATE_SEO = gql`
  mutation EditSeoMutation($input: oSeo) {
    editSeo(input: $input) {
      sMessage
      ${seo}
    }
  }
`
export const DELETE_SOCIAL_IMG = gql`
  mutation DeleteSocialImage($input: deleteSocialImageInput) {
    deleteSocialImage(input: $input) {
      sMessage
    }
  }
`
