import { gql } from '@apollo/client'

export const HEADER_MENU = gql`
  query GetHeaderMenuV2 {
    getHeaderMenuV2 {
      aMenu {
        _id
        sTitle
        bIsMulti
        aChildren
        sSlug
        sUrl
        eUrlTarget
        eMenuType
        nSort
        eStatus
        oLogoOnly {
          sText
          sCaption
          sAttribute
          sUrl
        }
        oLogoWithText {
          sText
          sCaption
          sAttribute
          sUrl
        }
        sContactEmail
        sContactPhone
        dCreated
        dUpdated
      }
      aHeaderSocial {
        eType
        sUrl
        sHandle
        sIconKey
      }
      oHeaderContact {
        sEmail
        sPhone
      }
    }
  }
`

export const ADD_HEADER_MENU = gql`
  mutation AddHeaderMenuV2($input: [headerMenuV2ItemInput!]!, $oHeaderContact: oHeaderContactInput, $aHeaderSocial: [headerSocialLinkInput!]) {
    addHeaderMenuV2(input: { aMenu: $input, oHeaderContact: $oHeaderContact, aHeaderSocial: $aHeaderSocial })
  }
`

export const GET_SLIDER = gql`
  query GetFrontSlider {
    getFrontSlider {
      sSlug
      sName
      oImg {
        sUrl
        sText
        sCaption
        sAttribute
      }
      _id
      aSlide {
        _id
        sName
        sSlug
      }
      dUpdated
      dCreated
      bIsMulti
      eStatus
      nPriority
    }
  }
`

export const ADD_SLIDER = gql`
  mutation AddSlider($input: [oSliderDataInput!]!) {
  addSlider(input: $input)
}
`

export const FOOTER_MENU = gql`
query GetFooterMenu {
  getFooterMenu {
    _id
    aAddresses {
      sLabel
      sAddress
    }
    aMenu {
      eType
      sTitle
      sSlug
      nPriority
    }
    aCMSMenu {
      eType
      sTitle
      sSlug
      nPriority
    }
    sCopyrightLine
    dCreated
    dUpdated
  }
}
`
export const ADD_FOOTER_MENU = gql`
  mutation AddFooterMenu($input: addFooterMenuInput!) {
    addFooterMenu(input: $input)
  }
`
