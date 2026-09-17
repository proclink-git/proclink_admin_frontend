import { gql } from '@apollo/client'

export const LIST_SEO_REDIRECT = gql`
  query GetSeoRedirect($input: oGetSeoRedirectInput) {
    getSeoRedirect(input: $input) {
      nTotal
      aResults {
        _id
        dCreated
        dUpdated
        eCode
        eSeoType
        eStatus
        iId
        sNewUrl
        sOldUrl
      }
    }
  }
`
export const GET_SEO_REDIRECT_BY_ID = gql`
  query GetSeoRedirectById($input: oGetSeoRedirectByIdInput) {
    getSeoRedirectById(input: $input) {
      _id
      dCreated
      dUpdated
      eCode
      eSeoType
      eStatus
      sNewUrl
      iId
      sOldUrl
    }
  }
`
export const ADD_SEO_REDIRECT = gql`
  mutation AddSeoRedirect($input: oAddSeoRedirectInput) {
    addSeoRedirect(input: $input) {
      sMessage
      oData {
        _id
        dCreated
        eCode
        dUpdated
        eSeoType
        eStatus
        iId
        sNewUrl
        sOldUrl
      }
    }
  }
`
export const EDIT_SEO_REDIRECT = gql`
  mutation EditSeoRedirect($input: oEditSeoRedirectInput) {
    editSeoRedirect(input: $input) {
      sMessage
      oData {
        _id
        dCreated
        dUpdated
        eCode
        eSeoType
        iId
        eStatus
        sNewUrl
        sOldUrl
      }
    }
  }
`
export const BULK_OPERATION = gql`
  mutation BulkSeoRedirectUpdate($input: oBulkSeoRedirectUpdateInput) {
    bulkSeoRedirectUpdate(input: $input) {
      sMessage
    }
  }
`
