import { gql } from '@apollo/client'

export const EDIT_PROJECT_CONFIG = gql`
mutation EditProjectConfig($input: oEditProjectConfigInput) {
  editProjectConfig(input: $input) {
    sMessage
  }
}
`
