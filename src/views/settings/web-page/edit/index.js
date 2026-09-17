import React, { Suspense } from 'react'
import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { GET_PAGE_BY_ID } from 'graph-ql/pages/query'
import Loading from 'shared/components/loading'

const KnowledgeCenter = React.lazy(() => import('shared/components/web-pages/knowledge-center'))
const LicenseAgreement = React.lazy(() => import('shared/components/web-pages/license-agreement'))
const HomePage = React.lazy(() => import('shared/components/web-pages/home-page'))
const IndustryPage = React.lazy(() => import('shared/components/web-pages/industry-page'))
const AboutUs = React.lazy(() => import('shared/components/web-pages/about-us'))
const ContactUs = React.lazy(() => import('shared/components/web-pages/contact-us'))
const AccountSoftware = React.lazy(() => import('shared/components/web-pages/account-software'))
const ServicePage = React.lazy(() => import('shared/components/web-pages/service-page'))
const ProductPage = React.lazy(() => import('shared/components/web-pages/product-page'))
const CustomPage = React.lazy(() => import('shared/components/web-pages/custom-page'))
const PartnershipsAlliances = React.lazy(() => import('shared/components/web-pages/partnerships-alliances'))

const PAGE_TYPES = ['kc', 'la', 'h', 'i', 'ip', 'au', 'cu', 'as', 's', 'p', 'cp', 'pa']
const PAGE_TYPE_BY_ROUTE_TITLE = {
  'knowledge-center': 'kc',
  'license-agreement': 'la',
  home: 'h',
  'home-page': 'h',
  industry: 'i',
  industries: 'i',
  'industry-page': 'i',
  'about-us': 'au',
  contact: 'cu',
  'contact-us': 'cu',
  'account-software': 'as',
  service: 's',
  services: 's',
  product: 'p',
  products: 'p',
  'custom-page': 'cp',
  'custom page': 'cp',
  custom: 'cp',
  'partnerships-and-alliances': 'pa',
  'partnerships-alliances': 'pa',
  'partnerships alliances': 'pa',
  partnerships: 'pa',
  alliances: 'pa'
}

function getRoutePageType(value = '') {
  const normalizedValue = String(value || '').trim().toLowerCase()

  return PAGE_TYPES.includes(normalizedValue) ? normalizedValue : PAGE_TYPE_BY_ROUTE_TITLE[normalizedValue]
}

function getPageComponent(pageData, allComponents) {
  if (allComponents?.[pageData?.ePageType]) return allComponents[pageData.ePageType]
  if (pageData?.oProductPage) return ProductPage
  if (pageData?.oIndustryPage) return IndustryPage
  if (pageData?.oServicePage) return ServicePage
  if (pageData?.oCustomPage) return CustomPage
  if (pageData?.oPartnershipsAlliancesPage) return PartnershipsAlliances

  return null
}

function EditPage() {
  const { id, title } = useParams()
  const ePageType = getRoutePageType(title)

  const { data, loading } = useQuery(GET_PAGE_BY_ID, { variables: { input: ePageType ? { _id: id, ePageType } : { _id: id } } })
  const pageData = data?.getPage?.oData

  const allComponents = {
    kc: KnowledgeCenter,
    la: LicenseAgreement,
    h: HomePage,
    i: IndustryPage,
    ip: IndustryPage,
    au: AboutUs,
    cu: ContactUs,
    as: AccountSoftware,
    s: ServicePage,
    p: ProductPage,
    cp: CustomPage,
    pa: PartnershipsAlliances
  }
  const Current = getPageComponent(pageData, allComponents)

  if (loading) return <Loading />
  return <Suspense fallback={<Loading />}>{Current ? <Current pageData={pageData} /> : <Loading />}</Suspense>
}

export default EditPage
