import { gql } from '@apollo/client'

export const BULK_STATUS_UPDATE = gql`
  mutation BulkUpdateUsers($input: oBulkUpdateUsersInput!) {
    bulkUpdateUsers(input: $input) {
      sMessage
    }
  }
`
