import React from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { Controller } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import ArticleTab from 'shared/components/article-tab'
import { validationErrors } from 'shared/constants/ValidationErrors'
import useReactSelect from 'shared/hooks/useReactSelect'
import { GET_ARTICLE_CATEGORY } from 'graph-ql/article/query'

function TagYourContent({ control, disabled, setValue, watch, values, addCategoryURL, errors, isCategoryDisabled }) {
  const { categoryType } = useParams()
  const {
    onApiResponce,
    handleScroll,
    handleSearch,
    loading,
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
    responceCallBack: (data) => {
      onApiResponce(data?.getCategoryWithoutPermission)
    }
  })
  return (
    <>
      <ArticleTab title={useIntl().formatMessage({ id: 'tagYourContent' })}>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="selectCategory" />*
          </Form.Label>
          <Controller
            name="iCategoryId"
            rules={{ required: validationErrors.required }}
            control={control}
            render={({ field: { onChange, value = [], ref } }) => {
              return (
                <Select
                  ref={ref}
                  isLoading={loading}
                  placeholder={<FormattedMessage id="categoryOnlyOne" />}
                  value={value || values?.iCategoryId}
                  options={category}
                  getOptionLabel={(option) => option.sName}
                  getOptionValue={(option) => option._id}
                  className={`react-select ${errors?.iCategoryId && 'error'}`}
                  classNamePrefix="select"
                  onInputChange={handleSearch}
                  isSearchable
                  isDisabled={disabled}
                  onMenuScrollToBottom={handleScroll}
                  // onMenuOpen={() => handleClick('sc')}
                  // menuIsOpen={isMenuOpen.sc}
                  onChange={(e) => {
                    onChange(e)
                    // addCategoryURL(e.oSeo.sSlug + '/')
                  }}
                />
              )
            }}
          />
          {errors.iCategoryId && (
            <Form.Control.Feedback className="pt-1" type="invalid">
              {errors.iCategoryId.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </ArticleTab>
    </>
  )
}
TagYourContent.propTypes = {
  control: PropTypes.object,
  values: PropTypes.object,
  watch: PropTypes.func,
  setValue: PropTypes.func,
  errors: PropTypes.object,
  disabled: PropTypes.bool,
  isCategoryDisabled: PropTypes.bool,
  addCategoryURL: PropTypes.func
}
export default TagYourContent
