import gql from 'graphql-tag'

export const EDIT_PAGE_COMPONENT = gql`
  mutation EditComponent($input: oEditToolsInput) {
    editComponent(input: $input) {
      sMessage
    }
  }
`
