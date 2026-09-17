import { gql } from '@apollo/client'

export const GET_USER_PERMISSION = gql`
  query Query {
    getUserPermissions
  }
`
