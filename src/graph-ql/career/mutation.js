import { gql } from '@apollo/client'

export const CREATE_CAREER_OPENING = gql`
  mutation CreateCareerOpening($input: createCareerOpeningInput!) {
    createCareerOpening(input: $input) {
      sMessage
    }
  }
`

export const EDIT_CAREER_OPENING = gql`
  mutation EditCareerOpening($input: editCareerOpeningInput!) {
    editCareerOpening(input: $input) {
      sMessage
    }
  }
`

export const UPDATE_CAREER_OPENING_STATUS = gql`
  mutation UpdateCareerOpeningStatus($input: updateCareerOpeningStatusInput!) {
    updateCareerOpeningStatus(input: $input) {
      sMessage
    }
  }
`

export const CREATE_LOCATION = gql`
  mutation CreateLocation($input: createLocationInput!) {
    createLocation(input: $input) {
      oData {
        _id
        sName
        eStatus
        dCreated
        dUpdated
      }
      sMessage
    }
  }
`

export const UPDATE_LOCATION = gql`
  mutation UpdateLocation($input: updateLocationInput!) {
    updateLocation(input: $input) {
      oData {
        _id
        sName
        eStatus
        dCreated
        dUpdated
      }
      sMessage
    }
  }
`
