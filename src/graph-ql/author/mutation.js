import { gql } from '@apollo/client'

export const AUTHOR_BULK_OPERATION = gql`
  mutation BulkAuthorUpdate($input: oBulkAuthorUpdateInput!) {
    bulkAuthorUpdate(input: $input) {
      sMessage
    }
  }
`

export const UPDATE_AUTHOR_STATUS = gql`
  mutation UpdateAuthorStatus($input: oUpdateAuthorStatusInput!) {
    updateAuthorStatus(input: $input) {
      sMessage
    }
  }
`

export const EDIT_AUTHOR_PAGE = gql`
  mutation EditAuthor($input: oEditAuthorInput!) {
    editAuthor(input: $input) {
      sMessage
    }
  }
`

export const CREATE_AUTHOR_PAGE = gql`
  mutation CreateAuthor($input: oCreateAuthorInput!) {
    createAuthor(input: $input) {
      sMessage
    }
  }
`
