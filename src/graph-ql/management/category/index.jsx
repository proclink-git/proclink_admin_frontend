import { gql } from '@apollo/client'

// Define the fields for the category
const category = `
  _id
  sName
  sSubTitle
  eType
  nPriority
`

// Mutation to add a new category
export const ADD_CATEGORY_MUTATION = gql`
  mutation AddCategoryMutation($input: addCategoryInput) {
    addCategory(input: $input) {
      sMessage
    }
  }
`

// Mutation to edit an existing category
export const EDIT_CATEGORY_MUTATION = gql`
  mutation EditCategoryMutation($input: editCategoryInput) {
    editCategory(input: $input) {
      sMessage
    }
  }
`

// Query to get a category by its ID
export const GET_CATEGORY_BY_ID = gql`
  query Query($input: getCategoryById) {
    getCategoryById(input: $input) {
      ${category}
    }
  }
`

// Query to get header category details
export const GET_HEADER_CATEGORY = gql`
  query GetHeaderCategory($input: getHeaderCategoryInput) {
    getHeaderCategory(input: $input) {
      _id
      sName
      sSubTitle
      sContent
      oImg {
        sText
        sCaption
        sAttribute
        sUrl
      }
      oSeo {
        _id
        iId
        sTitle
        sDescription
        sSlug
        aKeywords
        oFB {
          sTitle
          sDescription
          sUrl
        }
          sTitle
        oTwitter {
          sDescription
          sUrl
        }
        sCUrl
        sRobots
        eType
        eStatus
        eSubType
        bIsDeletable
        eCode
        eTabType
        sContent
        sAmpContent
        sDTitle
      }
      eHeaderCategoryType
      eType
      eStatus
      dUpdated
      dCreated
      aComponent {
        iId
        eType
        instanceId
        sComponentTitle
      }
      oComponents
    }
  }
`

// Mutation to update header category details
export const UPDATE_HEADER_CATEGORY = gql`
  mutation EditHeaderCategory($input: editHeaderCategoryInput) {
    editHeaderCategory(input: $input) {
      sMessage
    }
  }
`

// Query to get a list of categories
export const GET_CATEGORY_LIST = gql`
  query GetCategory($input: getCategoryInput!) {
    getCategory(input: $input) {
      nTotal
      aResults {
        _id
        dCreated
        dUpdated
        eStatus
        oSubAdmin {
          sFName
        }
        sName
        nPriority
      }
    }
  }
`

// Mutation to delete a category
export const DELETE_CATEGORY = gql`
  mutation DeleteCategoryMutation($input: deleteCategory) {
    deleteCategory(input: $input) {
      sMessage
    }
  }
`

// Mutation to update the status of a category
export const STATUS_CATEGORY = gql`
  mutation UpdateCategoryStatusMutation($input: updateCategoryStatus) {
    updateCategoryStatus(input: $input) {
      sMessage
    }
  }
`

// Mutation to perform bulk operations on categories
export const BULK_OPERATION = gql`
  mutation BulkCategoryUpdateMutation($input: bulkCategoryActionInput) {
    bulkCategoryUpdate(input: $input) {
      sMessage
    }
  }
`
