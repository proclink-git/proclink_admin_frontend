import { gql } from '@apollo/client'

export const BULK_OPERATION_POPUP = gql`
  mutation BulkPopupUpdate($input: oBulkPopupUpdateInput) {
    bulkPopupUpdate(input: $input) {
      sMessage
    }
  }
`
export const CREATE_POPUP = gql`
  mutation AddPopup($input: addPopupInput!) {
    addPopup(input: $input) {
      sMessage
    }
  }
`
export const EDIT_POPUP = gql`
  mutation EditPopup($input: editPopupInput!) {
    editPopup(input: $input) {
      sMessage
    }
  }
`
