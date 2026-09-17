import { gql } from '@apollo/client'

export const GET_TAG_LIST_ARTICLE = gql`
  query Query($input: getTagsInput) {
    getTags(input: $input) {
      nTotal
      aResults {
        _id
        sName
        eType
        iId
      }
    }
  }
`
export const GET_CATEGORY_LIST_ARTICLE = gql`
  query CategoryList($input: getCategoryInput!) {
    getCategory(input: $input) {
      nTotal
      aResults {
        _id
        sName
        oSeo {
          sSlug
        }
      }
    }
  }
`

export const GET_ARTICLE_DETAIL = gql`
query GetArticle($input: oGetArticleInput) {
  getArticle(input: $input) {
   _id
    sTitle
    sContent
    sInsContent
    sMediaUrl
    eMediaType
    oCategory {
      _id
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
      _id
      sName
    }
   
    aComponents {
      iId
      eType
      instanceId
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
      sUrl
    }
    iAuthorId
    iReviewerId
    eState
    oAssignedTo {
      _id
      sFName
    }
    sEditorNotes
    oReviewer {
      _id
      sFName
      sUrl
      eType
    }
    oWebInar {
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
  }
}
`

export const LIST_ARTICLE = gql`
  query ListArticle($input: getArticleInput) {
    listArticle(input: $input) {
      aResults {
        dCreated
        dUpdated
        _id
        eState
        iReviewerId
        oCategory {
          sName
        }
        sTitle
        oAuthor {
          sFName
        }
        oAssignedTo {
          sFName
        }
        oAuthorSeo{
          sSlug
        }
        oSeo {
          sSlug
        }
        dPublishDate
        bPriority
      }
      nTotal
    }
  }
`
export const COUNT_ARTICLES = gql`
  query GetArticleCounts($input: getArticleCountInput) {
    getArticleCounts(input: $input) {
      nAll
      nChangeRequested
      nChangeSubmitted
      nDraft
      nPending
      nPublished
      nRejected
      nScheduled
      nTrash
      nMine
    }
  }
`

export const GET_DISPLAY_AUTHOR = gql`
  query GetDisplayAuthor($input: getDisplayAuthorInput) {
    getDisplayAuthor(input: $input) {
      aResults {
        _id
        eType
        sFName
        sUName
        sUrl
      }
      nTotal
    }
  }
`

export const GET_GALLERY_IMAGES = gql`
  query GetImages($input: oGetImagesInput!) {
    getImages(input: $input) {
      nTotal
      aResults {
        _id
        sUrl
        sText
        sCaption
        sAttribute
        eContentType
        eType
        oAuthor {
          # sDisplayName
          sUName
        }
        oMeta {
          nWidth
          nHeight
          nSize
        }
        dUpdated
        dCreated
      }
      oRange {
        dMax
        dMin
      }
    }
  }
`

export const GET_ARTICLE_CATEGORY = gql`
  query GetCategoryWithoutPermission($input: getCategoryInput) {
    getCategoryWithoutPermission(input: $input) {
      _id
      sName
      oSeo {
        sSlug
      }
    }
  }
`

export const GET_ARTICLE_TAG = gql`
  query GetTagWithoutPermission($input: tagPaginationInput) {
    getTagWithoutPermission(input: $input) {
      aResults {
        _id
        sName
      }
    }
  }
`

export const LIST_PERMITTED_SUB_ADMIN = gql`
  query ListPermittedSubAdmins($input: listPermittedSubAdminsInput) {
    listPermittedSubAdmins(input: $input) {
      nTotal
      aResults {
        sFName
        _id
      }
    }
  }
`

export const LIST_HEADER_CATEGORY_ARTICLE = gql`
  query ListHeaderCategoryArticle($input: oListHeaderCategoryArticleInput) {
    listHeaderCategoryArticle(input: $input) {
      aResults {
        sTitle
        _id
      }
    }
  }
`

export const GET_GALLERY_TYPE = gql`
  query GetGalleryMetaType {
    getGalleryMetaType {
      eType
      nHeight
      nWidth
      sName
    }
  }
`
