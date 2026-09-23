import { gql } from '@apollo/client'

export const articleData = `
_id
    sTitle
    sContent
    sInsContent
    sMediaUrl
    eMediaType
    oCategory {
      sName
    },   
    dPublishDate
    dModifiedDate
    dPublishDisplayDate
    iAuthorDId
    oDisplayAuthor {
      sFName
      sEmail
      sUrl
      aSLinks {
        eSocialNetworkType
        sLink
      }
      eAuthorType
      sBio
      eDesignation
    }
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
    dCreated
    dUpdated
    oHeaderCategory {
      sName
    }
   
    aComponents {
      iId
      eType
      instanceId
    }
   
    oSU {
      sTitle
      sDescription
      sPlaceholder
      sButtonLabel
    }
     oLSC {
      sTitle
      sDescription
      aCard {
        oImg {
          sText
          sCaption
          sAttribute
          sUrl
        }
        oPopupImg {
          sText
          sCaption
          sAttribute
          sUrl
          oMeta {
            nWidth
            nHeight
            nSize
          }
        }
        sName
        sRole
        sDescription
        sRedirectUrl
        eTarget
      }
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
    aSocialLinks {
      eType
      sUrl
    }
    eHeaderCategoryType
    oCaseStudy {
      sLink
    }
    aTags
    aTopHighlights {
      sLabel
      sValue
    }
    sThumbnailUrl
    oEPO {
      sTitle
      aLogo {
        oImg {
          sText
          sCaption
          sAttribute
          sUrl
        }
        sRedirectUrl
      }
    }
    oPodcast {
      sLink
      nEpisodeNumber
      aSpeaker {
        _id
        aSLinks {
          sLink
          eSocialNetworkType
        }
        eDesignation
        sBio
        sFName
        sUrl
        eHeaderCategoryType
      }
      sDurationLabel
    }
    oAuthor {
      _id
      sFName
    }
    iAuthorId
    eState
    oAssignedTo {
      _id
      sFName
    }
    sEditorNotes
    oFAQ {
      sTitle
      sDescription
      aFaq {
        sQuestion
        sAnswer
      }
    }
    iCategoryId
    iReviewerId
    oDLF {
      sTitle
      sDescription
      eFormType
      aField {
        sLabel
        sPlaceholder
        bRequired
      }
      oCta {
        sLabel
        sUrl
      }
      sFooterNote
      sThumbnailUrl
      sMediaUrl
      eMediaType
      sLink
    }
    oPEM {
      sTitle
      sDescription
      aCard {
        sLabel
        sValue
      }
      bIsMarquee
      aMarquee {
        oImg {
          sText
          sCaption
          sAttribute
          sUrl
        }
      }
    }
    oRSC {
      sTitle
      sDescription
      aCard {
        oImg {
          sText
          sCaption
          sAttribute
          sUrl
        }
        sTitle
        sRedirectUrl
        eTarget
        sSlug
      }
    }
    oReviewer {
      _id
      sFName
      sUrl
      eType
    }
    oWebInar {
      dDate
      aSpeaker {
        _id
        sFName
        sUrl
      }
      sLink
      sDurationLabel
    }
    oWhitePaper {
      sLink
    }
     oVideo {
      sLink
      sDurationLabel
    }
    sListingBadge
    sDescription
    oListingCopy {
      sListingTitle
      sListingDescription
    }
    nDuration
    oComponents
`

export const CREATE_ARTICLE = gql`
  mutation CreateArticleMutation($input: oCreateArticleInput) {
    createArticle(input: $input) {
      oData {
        _id
      }
      sMessage
    }
  }
`
export const EDIT_ARTICLE = gql`
  mutation EditArticle($input: oEditArticleInput) {
    editArticle(input: $input) {
      sMessage
    }
  }
`

export const AUTO_SAVE_ARTICLE = gql`
  mutation AutoSaveArticle($input: oAutoSaveArticleInput) {
    autoSaveArticle(input: $input) {
      oData {
        ${articleData}
      }
    }
  }
`

export const UPDATE_PICK_ARTICLE = gql`
  mutation UpdatePickArticleData($input: oEditArticleInput) {
    updatePickArticleData(input: $input) {
      sMessage
    }
  }
`

export const PICK_ARTICLE = gql`
  mutation PickArticle($input: oPickArticleInput) {
    pickArticle(input: $input) {
      sMessage
    }
  }
`

export const CREATE_ARTICLE_COMMENT = gql`
  mutation CreateArticleComment($input: oCreateArticleCommentInput) {
    createArticleComment(input: $input) {
      sMessage
    }
  }
`
export const CHANGE_DISPLAY_AUTHOR = gql`
  mutation EditDisplayAuthor($input: editDisplayAuthorInput) {
    editDisplayAuthor(input: $input) {
      sMessage
    }
  }
`
export const GENERATE_PREVIEW_TOKEN = gql`
  query GenerateTokenFront($input: oGenerateTokenFrontInput) {
    generateTokenFront(input: $input) {
      sMessage
      oData {
        sToken
      }
    }
  }
`
export const UPDATE_ARTICLE_STATUS = gql`
  mutation UpdateArticleStatus($input: oUpdateArticleStatusInput!) {
    updateArticleStatus(input: $input) {
      sMessage
    }
  }
`

export const INSERT_IMAGE = gql`
  mutation InsertImage($input: [insertImageInput]!) {
    insertImage(input: $input) {
      sMessage
    }
  }
`

export const EDIT_IMAGE = gql`
  mutation EditImage($input: editImageInput!) {
    editImage(input: $input) {
      sMessage
    }
  }
`

export const DELETE_IMAGE = gql`
  mutation DeleteImage($input: deleteImageInput!) {
    deleteImage(input: $input) {
      sMessage
    }
  }
`

export const BULK_DELETE_ARTICLE = gql`
  mutation BulkArticleDelete($input: oBulkArticleDeleteInput) {
  bulkArticleDelete(input: $input) {
    sMessage
  }
}
`
