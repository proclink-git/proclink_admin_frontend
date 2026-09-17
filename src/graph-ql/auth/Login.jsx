import { gql } from '@apollo/client'

export const LOGIN = gql`
  mutation adminLogin($sUserName: String!, $sPassword: String!) {
    adminLogin(input: { sUserName: $sUserName, sPassword: $sPassword }) {
      oData {
        sTinyApiKey
        sToken
      }
    }
  }
`
