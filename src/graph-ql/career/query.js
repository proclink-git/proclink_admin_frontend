import { gql } from '@apollo/client'

export const LIST_CAREER_OPENINGS = gql`
  query ListCareerOpenings($input: listCareerOpeningInput!) {
    listCareerOpenings(input: $input) {
      nTotal
      aResults {
        _id
        aTags
        sTitle
        sDescription
        iLocationId
        oLocation {
          sName
        }
        nExperienceYears
        sRedirectUrl
        eStatus
        dCreated
        dUpdated
        iSubmittedBy {
          _id
          sFName
        }
      }
    }
  }
`

export const GET_CAREER_OPENING = gql`
  query GetCareerOpening($input: getCareerOpeningInput!) {
    getCareerOpening(input: $input) {
      _id
      aTags
      sTitle
      sDescription
      iLocationId
      oLocation {
        sName
      }
      nExperienceYears
      sRedirectUrl
      eStatus
      dCreated
      dUpdated
      iSubmittedBy {
        _id
        sFName
      }
    }
  }
`

export const LIST_LOCATIONS = gql`
  query ListLocations($input: listLocationInput!) {
    listLocations(input: $input) {
      nTotal
      aResults {
        _id
        sName
        eStatus
        dCreated
        dUpdated
      }
    }
  }
`
