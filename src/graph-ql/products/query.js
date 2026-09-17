import { gql } from '@apollo/client'

export const LIST_PRODUCTS = gql`
  query ListProduct($input: oProductPaginationInput) {
    listProduct(input: $input) {
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

export const GET_PRODUCT = gql`
  query GetProduct($input: oGetProductInput!) {
    getProduct(input: $input) {
      _id
      sTitle
      sDescription
      eStatus
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
      aComponent {
        iId {
          sComponentTitle
          _id
        }
        eType
        instanceId
      }
      oComponents
      dCreated
      dUpdated
    }
  }
`
