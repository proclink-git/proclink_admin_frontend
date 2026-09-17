import { gql } from '@apollo/client'

export const LIST_MEDIA_GALLERY_ITEM = gql`
  query ListMediaGalleryItem($input: listMediaGalleryItemInput!) {
    listMediaGalleryItem(input: $input) {
      aResults {
        _id
        iSubmittedBy
        eStatus
        dCreated
        dUpdated
        oCategory {
          _id
          sName
        }
        oMeta {
          nWidth
          nHeight
          nSize
        }
        sUrl
        sText
        sCaption
        sAttribute
      }
      nTotal
    }
  }
`

export const EDIT_MEDIA_GALLERY_ITEMS = gql`
  mutation EditMediaGalleryItems($input: editMediaGalleryItemsInput!) {
    editMediaGalleryItems(input: $input) {
      sMessage
      nUpdated
      nCreated
      nAlreadyExist
      nRequested
    }
  }
`

export const UPDATE_MEDIA_GALLERY_ITEM_STATUS = gql`
  mutation UpdateMediaGalleryItemStatus($input: updateMediaGalleryItemStatusInput!) {
    updateMediaGalleryItemStatus(input: $input) {
      sMessage
    }
  }
`
