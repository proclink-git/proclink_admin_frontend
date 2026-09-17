import gql from 'graphql-tag'

export const CREATE_PAGE = gql`
  mutation CreatePage($input: createPageInput!) {
    createPage(input: $input) {
      sMessage
    }
  }
`

export const EDIT_PAGE = gql`
  mutation EditPage($input: editPageInput!) {
    editPage(input: $input) {
      sMessage
    }
  }
`

export const DELETE_PAGE = gql`
  mutation DeletePage($input: oDeleteInput) {
    deletePage(input: $input) {
      sMessage
    }
  }
`
