import { gql } from '@apollo/client'

export const BULK_OPERATION_SERVICES = gql`
  mutation BulkServiceUpdate($input: oBulkServiceUpdateInput) {
    bulkServiceUpdate(input: $input) {
      sMessage
    }
  }
`

export const CREATE_SERVICES = gql`
  mutation CreateService($input: oCreateServiceInput) {
    createService(input: $input) {
      sMessage
    }
  }
`
export const EDIT_SERVICES = gql`
  mutation EditService($input: oEditServiceInput) {
    editService(input: $input) {
      sMessage
    }
  }
`
