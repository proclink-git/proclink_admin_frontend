import { gql } from '@apollo/client'

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: changePasswordInput) {
    changePassword(input: $input) {
      sMessage
    }
  }
`
