import { gql } from '@apollo/client'

export const EDIT_INDUSTRY = gql`
  mutation EditIndustry($input: editIndustryInput!) {
    editIndustry(input: $input) {
      sMessage
    }
  }
`
export const ADD_INDUSTRY = gql`
  mutation AddIndustry($input: addIndustryInput!) {
    addIndustry(input: $input) {
      sMessage
    }
  }
`

export const BULK_OPERATION_INDUSTRY = gql`
  mutation BulkIndustryUpdate($input: oBulkIndustryUpdateInput) {
    bulkIndustryUpdate(input: $input) {
      sMessage
    }
  }
`
