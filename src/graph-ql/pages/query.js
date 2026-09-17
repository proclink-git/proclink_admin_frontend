import gql from 'graphql-tag'

export const GET_PAGES_LIST = gql`
  query ListPage($input: listPageInput!) {
    listPage(input: $input) {
      nTotal
      aResults {
        _id
        ePageType
        oSeo {
          sSlug
        }
        sTitle
      }
    }
  }
`

export const GET_PAGE_BY_ID = gql`
query GetPage($input: getPageInput!) {
  getPage(input: $input) {
    oData {
      _id
      sTitle
      sPageTitle
      sPageDescription
      oImg {
        sText
        sCaption
        sAttribute
        sUrl
      }
      ePageType
      eStatus
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
        eSubType
        eStatus
        bIsDeletable
        sContent
        sDTitle
      }
      oContactUsPage {
        aComponent {
          iId
          eType
          instanceId
          sComponentTitle
          bIsStatic
          sPreviewUrl
        }
        oComponents
      }
      oHomePage {
        aComponent {
          iId
          eType
          sComponentTitle
          bIsStatic
          sPreviewUrl
          instanceId
        }
        oComponents
      }
      oIndustryPage {
        aComponent {
          iId
          eType
          sComponentTitle
          bIsStatic
          sPreviewUrl
          instanceId
        }
        oComponents
      }
      oServicePage {
        aComponent {
          iId
          eType
          instanceId
          sComponentTitle
          bIsStatic
          sPreviewUrl
        }
        oComponents
      }
      oProductPage {
        aComponent {
          iId
          eType
          instanceId
          sComponentTitle
          bIsStatic
          sPreviewUrl
        }
        oComponents
      }
      oPartnershipsAlliancesPage {
        aComponent {
          iId
          eType
          instanceId
          sComponentTitle
          bIsStatic
          sPreviewUrl
        }
        oComponents
      }
      oAboutUs {
        aComponent {
          iId
          eType
          instanceId
          sComponentTitle
          bIsStatic
          sPreviewUrl
        }
        oComponents
      }
      oCustomPage
      aHighlightText
    }
    sMessage
  }
}
`
