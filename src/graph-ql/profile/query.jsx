import gql from 'graphql-tag'

export const GET_CURRENT_USER = gql`
  query Query {
    getProfile {
      _id
      # sDisplayName
      sUrl
      eDesignation
      bSuperAdmin
      sFName
    }
  }
`
