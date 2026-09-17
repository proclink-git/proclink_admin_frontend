import React, { Fragment } from 'react'
import { Route, useParams } from 'react-router'
import { Link as RouterLink } from 'react-router-dom'
import { Breadcrumb } from 'react-bootstrap'
import { HEADER_CATEGORY_SLUG_ADMIN } from 'shared/constants'
// import { allRoutes } from 'shared/constants/AllRoutes'

function Breadcrumbs() {
  const { id } = useParams()
  return (
    <Route>
      {({ location }) => {
        const pathNames = location.pathname.split('/').filter((x) => x)
        const items = pathNames.filter((value) => value !== id)
        let categoryType
        const knowledgeCenterRoutes = Object.values(HEADER_CATEGORY_SLUG_ADMIN)
        if (knowledgeCenterRoutes.includes(items?.[0]) && items.length > 1) {
          categoryType = items.pop()
        }
        return (
          <Breadcrumb className="breadcrumb-main" style={{ '--bs-breadcrumb-divider': '>' }}>
            {items.map((value, index) => {
              const last = index === items.length - 1
              const to = location.pathname.split(value)[0]
              return last ? (
                <Breadcrumb.Item active key={value}>
                  {value?.replaceAll('-', ' ')}
                </Breadcrumb.Item>
              ) : (
                <Fragment key={value}>
                  <Breadcrumb.Item linkAs={RouterLink} linkProps={{ to: `${to}${value}${categoryType ? '/' + categoryType : ''}` }}>
                    {value?.replaceAll('-', ' ')}
                  </Breadcrumb.Item>
                  <i className="icon-chevron-right"></i>
                </Fragment>
              )
            })}
          </Breadcrumb>
        )
      }}
    </Route>
  )
}

export default Breadcrumbs
