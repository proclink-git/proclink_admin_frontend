import { gql } from '@apollo/client'

export const BULK_OPERATION_PRODUCTS = gql`
  mutation BulkProductUpdate($input: oBulkProductUpdateInput) {
    bulkProductUpdate(input: $input) {
      sMessage
    }
  }
`

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: oCreateProductInput) {
    createProduct(input: $input) {
      sMessage
    }
  }
`

export const EDIT_PRODUCT = gql`
  mutation EditProduct($input: oEditProductInput) {
    editProduct(input: $input) {
      sMessage
    }
  }
`
