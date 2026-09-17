import { gql } from '@apollo/client'

export const LIST_AUTHORS_PAGE = gql`
  query ListAuthors($input: listAuthorInput) {
    listAuthors(input: $input) {
      nTotal
      aResults {
        _id
        sFName
        sEmail
        dCreated
        dUpdated
        eStatus
      }
    }
  }
`
export const LIST_AUTHORS_WITHOUT_PERMISSION = gql`
  query ListAuthorsFront($input: listAuthorInputFront) {
    listAuthorsFront(input: $input) {
      aResults {
        sFName
        _id
      }
      nTotal
    }
  }
`

export const GET_AUTHOR_BY_ID = gql`
  query GetAuthor($input: getAuthorInput) {
    getAuthor(input: $input) {
      _id
      aSLinks {
        sLink
        eSocialNetworkType
      }
      oSeo {
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
      }
      eDesignation
      eGender
      sEmail
      sFName
      sNumber
      sBio
      sUrl
    }
  }
`
