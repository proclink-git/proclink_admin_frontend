import { gql } from '@apollo/client'

export const VERIFY_OTP = gql`
  mutation VerifyOtp($input: verifyOtp) {
    verifyOtp(input: $input) {
      sMessage
    }
  }
`
export const RESET_PASSWORD = gql`
  mutation resetPassword($sEmail: String!, $sNewPassword: String!, $sConfirmNewPassword: String!) {
    resetPassword(input: { sEmail: $sEmail, sNewPassword: $sNewPassword, sConfirmNewPassword: $sConfirmNewPassword }) {
      sMessage
    }
  }
`
