import React from 'react'
import PropTypes from 'prop-types'

import CareerBannerSection from '../home-page-static/career-banner-section'
import ProductsComponentSection from '../home-page-static/products-component-section'

export function getDefaultProductListingCard() {
  return {
    sProductName: '',
    sDescription: '',
    sRedirectUrl: '',
    eTarget: '_self'
  }
}

function ProductListingSection({ basePath = 'oProductPage.oPLP' }) {
  return (
    <ProductsComponentSection
      basePath={basePath}
      sectionLabel="Product Listing"
      showSectionImageTitle
      showCardTitle={false}
      showCardImage={false}
      getDefaultCard={getDefaultProductListingCard}
    />
  )
}

function ProductCareerBannerSection({ basePath = 'oProductPage.oCB' }) {
  return <CareerBannerSection basePath={basePath} sectionLabel="Career Banner" />
}

ProductListingSection.propTypes = {
  basePath: PropTypes.string
}

ProductCareerBannerSection.propTypes = {
  basePath: PropTypes.string
}

const componentMap = {
  plp: ProductListingSection,
  cb: ProductCareerBannerSection
}

export default function ProductPageStaticComponent({ basePath, component }) {
  const componentType = component?.eType || component?.iId?.eType
  const Component = componentMap?.[componentType]

  if (!Component) return component?.sComponentTitle || component?.iId?.sComponentTitle || componentType || null

  return <Component basePath={basePath} component={component} />
}

ProductPageStaticComponent.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.object
}
