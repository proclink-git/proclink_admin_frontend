import { gql } from '@apollo/client'

export const dynamicComponentFields = `
aBenefit {
  oIcon {
    sUrl
    sText
    sCaption
    sAttribute
  }
  sTitle
}
sBenefitComponentTitle
sTestimonialComponentTitle
sTestimonialComponentDescription
aTestimonial {
  _id
  sTitle
}
oWWB {
  aData
  oBackgroundImg {
    sUrl
    sText
  }
  sTitle
  sDescription
}
oFaq {
  sTitle
  sDescription
  aFaq {
    sQuestion
    sAnswer
  }
}
oLtdiri {
  aIconData {
    oIcon {
      sUrl
      sText
      sCaption
      sAttribute
    }
    sTitle
  }
  sTitle
  sDescription
  oImg {
    sUrl
    sText
    sCaption
    sAttribute
  }
}
oLtirs {
   aSection {
     sTitle
     sDescription
     oImg {
       sUrl
       sText
       sCaption
       sAttribute
     }
   }
   sTitle
   sDescription
 }
oSubServiceComponent {
  sTitle
  sDescription
  aSubService {
    sTitle
    oIcon {
      sUrl
      sText
      }
    }
  }
`

export const GET_COMPONENTS_LIST = gql`
  query ListComponents($input: oListComponentInput) {
    listComponents(input: $input) {
      nTotal
      aResults {
        eStatus
        _id
        eType
        sComponentTitle
        sPreviewUrl
        eComponentType
      }
    }
  }
`

export const GET_ALL_COMPONENTS_LIST = gql`
  query ListAllComponents($pageWiseInput: oListComponentInput, $staticInput: oListComponentInput, $dynamicInput: oListComponentInput) {
    pageWise: listComponents(input: $pageWiseInput) {
      aResults {
        eStatus
        _id
        eType
        sComponentTitle
        sPreviewUrl
        eComponentType
      }
    }
    static: listComponents(input: $staticInput) {
      aResults {
        eStatus
        _id
        eType
        sComponentTitle
        sPreviewUrl
        eComponentType
      }
    }
    dynamic: listComponents(input: $dynamicInput) {
      aResults {
        eStatus
        _id
        eType
        sComponentTitle
        sPreviewUrl
        eComponentType
      }
    }
  }
`

export const GET_COMPONENTS_WITHOUT_PERMISSION = gql`
  query ListComponentWithoutPermission($input: oListComponentWithoutPermissionInput) {
    listComponentWithoutPermission(input: $input) {
      aResults {
        _id
        eType
        sComponentTitle
        eComponentType
        sPreviewUrl
      }
    }
  }
`

export const GET_PAGE_COMPONENT = gql`
  query GetComponent($input: oGetToolsInput) {
    getComponent(input: $input) {
      oComponent
    }
  }
`
