import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import moment from 'moment'
import DatePicker from 'react-datepicker'

import { FormattedMessage } from 'react-intl'
import { GET_ARTICLE_CATEGORY, LIST_PERMITTED_SUB_ADMIN } from 'graph-ql/article/query'
import Select from 'react-select'
import useReactSelect from 'shared/hooks/useReactSelect'
import { LIST_AUTHORS_WITHOUT_PERMISSION } from 'graph-ql/author/query'

function ArticleFilter({ filterChange, defaultValue }) {
  const { categoryType } = useParams()
  const { handleSubmit, reset, control, setValue } = useForm({})
  const [dateRange, setDateRange] = useState(getDateValue())
  const [startDate, endDate] = dateRange

  const {
    onApiResponce,
    handleScroll,
    handleSearch,
    // selected: quizSelected,
    // setSelected: setSelectedQuiz,
    loading,
    items: authors
  } = useReactSelect({
    query: LIST_AUTHORS_WITHOUT_PERMISSION,
    requestParams: {
      eHeaderCategoryType: categoryType,
      eAuthorType: categoryType === 'b' ? 'a' : 's',
      nLimit: 10,
      nSkip: 1,
      sSearch: ''
    },
    // selectedItem: selectedPoll?.quiz,
    responceCallBack: (data) => {
      setValue(
        'aAuthorsFilters',
        data?.listAuthorsFront?.aResults?.filter((c) => defaultValue.aAuthorsFilters.includes(c._id))
      )
      onApiResponce(data?.listAuthorsFront?.aResults)
    }
  })

  const {
    onApiResponce: onApiResponceCategory,
    handleScroll: handleScrollCategory,
    handleSearch: handleSearchCategory,
    // selected: quizSelected,
    // setSelected: setSelectedQuiz,
    loading: categoryLoading,
    items: category
  } = useReactSelect({
    query: GET_ARTICLE_CATEGORY,
    requestParams: {
      eHeaderCategoryType: categoryType,
      eStatus: 'a',
      eType: 's',
      nLimit: 10,
      nOrder: -1,
      nSkip: 1,
      sSearch: '',
      sSortBy: 'dCreated'
    },
    // selectedItem: selectedPoll?.quiz,
    responceCallBack: (data) => {
      setValue(
        'aCategoryFilters',
        data?.getCategoryWithoutPermission?.filter((c) => defaultValue.aCategoryFilters.includes(c._id))
      )
      onApiResponceCategory(data?.getCategoryWithoutPermission)
    }
  })

  const {
    onApiResponce: onApiResponceWriter,
    handleScroll: handleScrollWriter,
    handleSearch: handleSearchWriter,
    // selected: quizSelected,
    // setSelected: setSelectedQuiz,
    loading: writersLoading,
    items: writers
  } = useReactSelect({
    query: LIST_PERMITTED_SUB_ADMIN,
    requestParams: {
      nLimit: 10,
      nSkip: 1,
      sSearch: '',
      eHeaderCategoryType: categoryType
    },
    // selectedItem: selectedPoll?.quiz,
    responceCallBack: (data) => {
      setValue(
        'aWriterFilters',
        data?.listPermittedSubAdmins?.aResults?.filter((c) => defaultValue?.aWriterFilters?.includes(c._id))
      )
      onApiResponceWriter(data?.listPermittedSubAdmins?.aResults)
    }
  })
  function getDateValue() {
    if (defaultValue?.aPublishDate?.length) {
      return [new Date(defaultValue.aPublishDate[0]), new Date(defaultValue.aPublishDate[1])]
    } else return [null, null]
  }

  function onSubmit(data) {
    data.aCategoryFilters = data.aCategoryFilters ? data.aCategoryFilters.map((item) => item._id) : []
    data.aWriterFilters = data.aWriterFilters ? data.aWriterFilters.map((item) => item._id) : []
    data.aAuthorsFilters = data.aAuthorsFilters ? data.aAuthorsFilters.map((item) => item._id) : []
    if (data.aPublishDate) {
      data.aPublishDate =
        moment(Number(data.aPublishDate[0])).format('DD MMMM YYYY') + '-' + moment(Number(data.aPublishDate[1])).format('DD MMMM YYYY')
    } else data.aPublishDate = ''
    filterChange({ data })
  }

  const onReset = () => {
    reset({})
    setDateRange([null, null])
  }

  return (
    <Form className="user-filter" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="top-d-button">
        <Button variant="outline-secondary" type="reset" onClick={onReset} className="square me-2" size="sm">
          <FormattedMessage id="reset" />
        </Button>
        <Button variant="success" type="submit" className="square" size="sm">
          <FormattedMessage id="apply" />
        </Button>
      </div>
      <Form.Group className="form-group">
        <Form.Label className="d-block">
          <FormattedMessage id="dateRange" />
        </Form.Label>
        <Controller
          name="aPublishDate"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <DatePicker
              ref={ref}
              value={value}
              className="form-control"
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              withPortal
              onChange={(update) => {
                setDateRange(update)
                onChange(update)
              }}
              maxDate={new Date()}
            />
          )}
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="categories" />
        </Form.Label>
        <Controller
          name="aCategoryFilters"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <Select
              ref={ref}
              value={value}
              options={category}
              getOptionLabel={(option) => option.sName}
              getOptionValue={(option) => option._id}
              isMulti
              isSearchable
              className="react-select"
              classNamePrefix="select"
              closeMenuOnSelect={false}
              isLoading={categoryLoading}
              onMenuScrollToBottom={handleScrollCategory}
              // onMenuOpen={() => handleClick('sc')}
              onInputChange={handleSearchCategory}
              onChange={(e) => {
                onChange(e)
              }}
            />
          )}
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="authors" />
        </Form.Label>
        <Controller
          name="aAuthorsFilters"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <Select
              ref={ref}
              value={value}
              options={authors}
              getOptionLabel={(option) => option.sFName}
              getOptionValue={(option) => option._id}
              isMulti
              isSearchable
              className="react-select"
              classNamePrefix="select"
              closeMenuOnSelect={false}
              isLoading={loading}
              onInputChange={handleSearch}
              onMenuScrollToBottom={handleScroll}
              // onMenuOpen={() => handleClick('a')}
              onChange={(e) => {
                onChange(e)
              }}
            />
          )}
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>Writers</Form.Label>
        <Controller
          name="aWriterFilters"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <Select
              ref={ref}
              value={value}
              options={writers}
              getOptionLabel={(option) => option.sFName}
              getOptionValue={(option) => option._id}
              isMulti
              isSearchable
              className="react-select"
              classNamePrefix="select"
              closeMenuOnSelect={false}
              isLoading={writersLoading}
              onMenuScrollToBottom={handleScrollWriter}
              onInputChange={handleSearchWriter}
              // onMenuOpen={handleSearchTag}
              onChange={(e) => {
                onChange(e)
              }}
            />
          )}
        />
      </Form.Group>
    </Form>
  )
}
ArticleFilter.propTypes = {
  filterChange: PropTypes.func,
  defaultValue: PropTypes.object
}
export default ArticleFilter
