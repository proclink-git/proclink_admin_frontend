import { gql } from '@apollo/client'

export const LIST_USERS = gql`
  query ListUsers($input: oListUsersInput) {
    listUsers(input: $input) {
      nTotal
      aResults {
        _id
        bIsMobVerified
        bIsEmailVerified
        dCreated
        sEmail
        sFullName
        eStatus
      }
      nTotal
    }
  }
`

export const VIEW_USER_DETAILS = gql`
  query ViewUserDetail($input: oViewUserDetailInput!) {
    viewUserDetail(input: $input) {
      sMessage
      oData {
        _id
        aSLinks {
          sLink
          # sDisplayName
          eSocialNetworkType
        }
        bIsMobVerified
        bIsEmailVerified
        dCreated
        dDOB
        dUpdated
        eGender
        eStatus
        eType
        sBio
        oCountry {
          sName
          sId
        }
        sCity
        sEmail
        sFullName
        sMobNum
        sProPic
        sToken
        sUsername
      }
    }
  }
`
