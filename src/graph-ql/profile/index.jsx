import { gql } from '@apollo/client'

const profile = `
_id
eGender
sEmail
sFName
sNumber
sUName
sUrl
`

export const GET_PROFILE_DATA = gql`
  query Query {
    getProfile {
      ${profile}
    }
  }
`

export const EDIT_PROFILE = gql`
  mutation EditProfileMutation($input: editProfileInput) {
    editProfile(input: $input) {
      sMessage
      oData {
        ${profile}
      }
    }
  }
`
