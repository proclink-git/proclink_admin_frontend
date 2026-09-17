import { gql } from '@apollo/client'

export const GET_PERMISSION = gql`
  query Query {
    getPermissions {
      _id
      eType
      eKey
      sTitle
      ePerType
      aAssociatedPermission
      bDisabled
    }
  }
`
