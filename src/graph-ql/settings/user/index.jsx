import { gql } from '@apollo/client'

export const ADD_USER = gql`
  mutation CreateSubAdminMutation($input: createSubAdmin) {
    createSubAdmin(input: $input) {
      sMessage
    }
  }
`

export const EDIT_USER = gql`
  mutation EditSubAdminMutation($input: editSubAdminInput) {
  editSubAdmin(input: $input) {
    sMessage
  }
}
`

export const GENERATE_USERNAME = gql`
  query Query($sUserName: String!) {
    generateUsername(input: { sUserName: $sUserName }) {
      sMessage
      oData {
        bIsExists
        sUsername
      }
    }
  }
`

export const GENERATE_USER_SLUG = gql`
  query Query($sSlug: String!) {
    generateSlug(input: { sSlug: $sSlug }) {
      bIsExists
      message
      sSlug
    }
  }
`

export const GET_USER_LIST = gql`
  query Query($aFilters: [String], $nLimit: Int, $nOrder: Int, $nSkip: Int, $sSearch: String, $sSortBy: String) {
    listSubAdmins(input: { aFilters: $aFilters, nLimit: $nLimit, nOrder: $nOrder, nSkip: $nSkip, sSearch: $sSearch, sSortBy: $sSortBy }) {
      aResults {
        _id
        aRole {
          aRoleId {
            sName
            _id
          }
        }
        bIsVerified
        bIsCustom
        dCreated
        eStatus
        sEmail
        sFName
      }
      nTotal
    }
  }
`

export const BULK_ACTION = gql`
  mutation Mutation($aIds: [aIdsBulkActionInput]!, $eType: bulkActionEnumType) {
    bulkAction(input: { aIds: $aIds, eType: $eType }) {
      sMessage
    }
  }
`

export const GET_USER = gql`
  query Query($input: getSubAdminInput) {
    getSubAdmin(input: $input) {
      # aSLinks {
      #   sLink
      #   sDisplayName
      #   eSocialNetworkType
      # }
      dCreated
      eGender
      eStatus
      eType
      _id
      aAssignedRolePermissions {
        sName
        _id
        aPermissions {
          _id
          sTitle
          bDisabled
          ePerType
        }
      }
      # sAddress
      # sBio
      # sCity
      # sDisplayName
      sEmail
      sFName
      sNumber
      sUName
      sUrl
      # oSeo {
      #   sTitle
      #   sSlug
      #   sRobots
      #   sDescription
      #   sCUrl
      #   oTwitter {
      #     sUrl
      #     sTitle
      #     sDescription
      #   }
      #   oFB {
      #     sUrl
      #     sTitle
      #     sDescription
      #   }
      #   iId
      #   eType
      #   aKeywords
      # }
    }
  }
`

export const CHANGE_PROFILE_PICTURE = gql`
  mutation Mutation($_id: ID, $sUrl: String!) {
    editSubAdminProfilePicture(input: { _id: $_id, sUrl: $sUrl }) {
      sMessage
    }
  }
`
