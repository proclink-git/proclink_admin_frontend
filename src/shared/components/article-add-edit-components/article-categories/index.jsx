import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Nav, Tab } from 'react-bootstrap'
import { useQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'

import ArticleTab from 'shared/components/article-tab'
import Search from 'shared/components/search'
import { bottomReached } from 'shared/utils'
import { GET_CATEGORY_LIST_ARTICLE } from 'graph-ql/article/query'
import { validationErrors } from 'shared/constants/ValidationErrors'
import Loading from 'shared/components/loading'

function ArticleCategories({ register, setValue, errors, articleData, disabled }) {
  const categoriesTitle = useIntl().formatMessage({ id: 'categories' })
  const [isBottomReached, setIsBottomReached] = useState(false)
  const [categoriesList, setCategoriesList] = useState([])
  const [totalRecord, setTotalRecord] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [primaryCategory, setPrimaryCategory] = useState()
  const [requestParams, setRequestParams] = useState({
    eType: 'SIMPLE',
    nSkip: 1,
    nLimit: 10,
    sSortBy: 'dCreated',
    nOrder: -1,
    sSearch: ''
  })

  const { loading } = useQuery(GET_CATEGORY_LIST_ARTICLE, {
    notifyOnNetworkStatusChange: true,
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (data && data.getCategory.results) {
        isBottomReached ? setCategoriesList([...categoriesList, ...data.getCategory.results]) : setCategoriesList(data.getCategory.results)
        setTotalRecord(data.getCategory.total)
        setIsBottomReached(false)
      }
    }
  })

  function handleChangeTab(val) {
    if (val === 'simple') {
      setRequestParams({ ...requestParams, eType: 'SIMPLE', nSkip: 1, sSortBy: 'dCreated' })
    } else if (val === 'series') {
      setRequestParams({ ...requestParams, eType: 'API_SERIES', nSkip: 1, sSortBy: 'dCreated' })
    } else {
      delete requestParams.eType
      setRequestParams({ ...requestParams, nSkip: 1, sSortBy: 'nCount' })
    }
  }

  function handleSearch(e) {
    setRequestParams({ ...requestParams, sSearch: e, nSkip: 1 })
  }

  function handleCheckbox({ target }) {
    if (target.checked) {
      setSelectedCategories([...selectedCategories, target.name])
    } else {
      setSelectedCategories((data) => data.filter((item) => item !== target.name))
    }
  }

  function handlePrimary(id) {
    setPrimaryCategory(id)
    setValue('oCategories.iPrimaryId', id)
  }

  useEffect(() => {
    setValue('oCategories.aCategoryId', selectedCategories)
  }, [selectedCategories])

  useEffect(() => {
    if (isBottomReached && categoriesList.length < totalRecord) {
      setRequestParams({ ...requestParams, nSkip: requestParams.nSkip + 1 })
    } else if (isBottomReached && !(categoriesList.length < totalRecord)) {
      setIsBottomReached(false)
    }
  }, [isBottomReached])

  useEffect(() => {
    if (articleData) {
      setSelectedCategories(articleData.oCategories.aCategoryId)
      setPrimaryCategory(articleData.oCategories.iPrimaryId)
    }
  }, [articleData])

  return (
    <ArticleTab title={categoriesTitle}>
      <input type="hidden" {...register('oCategories.aCategoryId')} />
      <input
        type="hidden"
        {...register('oCategories.iPrimaryId', {
          required: validationErrors.category
        })}
        disabled={disabled}
      />
      <Search className="search-box only-border m-0" searchEvent={(e) => handleSearch(e)} disabled={disabled} />
      <Tab.Container defaultActiveKey="simple">
        <Nav variant="tabs" className="article-tabs">
          <Nav.Item>
            <Nav.Link eventKey="simple" onClick={() => handleChangeTab('simple')}>
              <FormattedMessage id="simple" />
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="series" onClick={() => handleChangeTab('series')}>
              <FormattedMessage id="series" />
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="mostUsed" onClick={() => handleChangeTab('ms')}>
              <FormattedMessage id="mostUsed" />
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content className="article-content position-relative">
          <Tab.Pane eventKey="simple" onScroll={(e) => setIsBottomReached(bottomReached(e))}>
            {categoriesList.map((item) => {
              return (
                <Form.Check key={`simple${item._id}`} id={`simple${item._id}`} className="ms-0 form-check d-flex flex-wrap">
                  <Form.Check.Input
                    type="checkbox"
                    checked={selectedCategories.includes(item._id)}
                    name={item._id}
                    onChange={handleCheckbox}
                    disabled={disabled}
                  />
                  <Form.Check.Label>{item.sName}</Form.Check.Label>
                  {primaryCategory === item._id && (
                    <p className={disabled ? 'disabled' : ''}>
                      <FormattedMessage id="primary" />
                    </p>
                  )}
                  <Button disabled={disabled} variant="link" size="sm" className="hover-none p-0" onClick={() => handlePrimary(item._id)}>
                    <FormattedMessage id="makePrimary" />
                  </Button>
                </Form.Check>
              )
            })}
            {!categoriesList.length && (
              <p className="text-center">
                <FormattedMessage id="noRecordFound" />
              </p>
            )}
          </Tab.Pane>
          <Tab.Pane eventKey="series" onScroll={(e) => setIsBottomReached(bottomReached(e))}>
            {categoriesList.map((item) => {
              return (
                <Form.Check key={`series${item._id}`} id={`series${item._id}`} className="ms-0 form-check d-flex flex-wrap">
                  <Form.Check.Input
                    type="checkbox"
                    checked={selectedCategories.includes(item._id)}
                    name={item._id}
                    onChange={handleCheckbox}
                    disabled={disabled}
                  />
                  <Form.Check.Label>{item.sName}</Form.Check.Label>
                  {primaryCategory === item._id && (
                    <p className={disabled ? 'disabled' : ''}>
                      <FormattedMessage id="primary" />
                    </p>
                  )}
                  <Button disabled={disabled} variant="link" size="sm" className="hover-none p-0" onClick={() => handlePrimary(item._id)}>
                    <FormattedMessage id="makePrimary" />
                  </Button>
                </Form.Check>
              )
            })}
            {!categoriesList.length && (
              <p className="text-center">
                <FormattedMessage id="noRecordFound" />
              </p>
            )}
          </Tab.Pane>
          <Tab.Pane eventKey="mostUsed" onScroll={(e) => setIsBottomReached(bottomReached(e))}>
            {categoriesList.map((item) => {
              return (
                <Form.Check key={`ms${item._id}`} id={`ms${item._id}`} className="ms-0 form-check d-flex flex-wrap">
                  <Form.Check.Input
                    type="checkbox"
                    checked={selectedCategories.includes(item._id)}
                    name={item._id}
                    onChange={handleCheckbox}
                    disabled={disabled}
                  />
                  <Form.Check.Label>{item.sName}</Form.Check.Label>
                  {primaryCategory === item._id && (
                    <p className={disabled ? 'disabled' : ''}>
                      <FormattedMessage id="primary" />
                    </p>
                  )}
                  <Button disabled={disabled} variant="link" size="sm" className="hover-none p-0" onClick={() => handlePrimary(item._id)}>
                    <FormattedMessage id="makePrimary" />
                  </Button>
                </Form.Check>
              )
            })}
            {!categoriesList.length && (
              <p className="text-center">
                <FormattedMessage id="noRecordFound" />
              </p>
            )}
          </Tab.Pane>
          {loading && <Loading />}
        </Tab.Content>
      </Tab.Container>
      {errors.oCategories && errors.oCategories.iPrimaryId && (
        <Form.Control.Feedback className="pt-1" type="invalid">
          {errors.oCategories.iPrimaryId.message}
        </Form.Control.Feedback>
      )}
    </ArticleTab>
  )
}
ArticleCategories.propTypes = {
  register: PropTypes.func,
  setValue: PropTypes.func,
  errors: PropTypes.object,
  articleData: PropTypes.object,
  disabled: PropTypes.bool
}
export default ArticleCategories
