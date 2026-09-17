import { gql } from '@apollo/client'

const roleParams = `
  _id
  aPermissions {
    eType
    _id
    eKey
    sTitle
    ePerType
  }
  dUpdated
  sName
`

export const GET_ROLES = gql`
  query getRoles {
    getRoles {
      aResults {
        ${roleParams}
      }
    }
  }
`
export const GET_ROLES_DETAIL = gql`
  query Query($input: getRoleById) {
    getRoleById(input: $input) {
      ${roleParams}
    }
  }
`
export const ADD_ROLE = gql`
  mutation AddRole($input: addRole) {
    addRole(input: $input) {
      sMessage
    }
  }
`
export const EDIT_ROLE = gql`
  mutation EditRole($input: editRole) {
    editRole(input: $input) {
      sMessage
    }
  }
`
export const DELETE_ROLE = gql`
  mutation DeleteRole($input: deleteRole) {
    deleteRole(input: $input) {
      sMessage
    }
  }
`
export const GET_DEFAULT_ROLE = gql`
  query Query {
    getDefaultRoles {
      _id
      aPermissions {
        ePerType
        _id
        eType
        eKey
        sTitle
      }
      dUpdated
      sName
    }
  }
`
