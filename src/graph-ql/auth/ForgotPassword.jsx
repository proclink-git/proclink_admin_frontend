import { gql } from '@apollo/client'

export const FORGOT_PASSWORD = gql`
  mutation forgotPassword($sEmail: String!) {
    forgotPassword(input: { sEmail: $sEmail }) {
      sMessage
    }
  }
`
