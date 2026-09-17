import { gql } from '@apollo/client'

export const GET_PROJECT_CONFIG = gql`
query GetProjectConfig($input: oGetProjectConfigInput) {
  getProjectConfig(input: $input) {
    oData {
      _id
      aEmail
      eType
    }
    sMessage
  }
}
`
