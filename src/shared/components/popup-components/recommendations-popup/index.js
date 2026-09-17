import { LIST_SEO_FOR_POPUP } from 'graph-ql/settings/seo'
import React from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { Controller, useFormContext } from 'react-hook-form'
import Select from 'react-select'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'

import CommonInput from 'shared/components/common-input'
import { validationErrors } from 'shared/constants/ValidationErrors'
import useReactSelect from 'shared/hooks/useReactSelect'

export default function RecommendationsPopup() {
  const {
    register,
    formState: { errors },
    control,
    setValue,
    getValues,
    clearErrors
  } = useFormContext()

  const { onApiResponce, handleScroll, handleSearch, loading, items } = useReactSelect({
    query: LIST_SEO_FOR_POPUP,
    requestParams: {
      aType: ['ar'],
      nLimit: 20,
      nOrder: -1,
      nSkip: 1,
      sSearch: '',
      sSortBy: 'dCreated'
    },
    responceCallBack: (data) => {
      onApiResponce(data?.listSeoForPopup?.aResults)
    }
  })
  return (
    <Row>
      <Col xs={8}>
        <Row>
          <Col xs={12}>
            <Form.Group className="form-group">
              <Form.Label>Select Content*</Form.Label>
              <Controller
                name="oContentRecommendationPopup.oContentData"
                rules={{ required: validationErrors.required }}
                control={control}
                render={({ field: { onChange, value = [], ref } }) => {
                  return (
                    <Select
                      ref={ref}
                      isLoading={loading}
                      // placeholder={<FormattedMessage id="categoryOnlyOne" />}
                      value={value}
                      options={items}
                      getOptionLabel={(option) => option.sSlug}
                      getOptionValue={(option) => option.iId}
                      className={`react-select ${errors?.oContentRecommendationPopup?.oContentData && 'error'}`}
                      classNamePrefix="select"
                      onInputChange={handleSearch}
                      isSearchable
                      onMenuScrollToBottom={handleScroll}
                      onChange={onChange}
                    />
                  )
                }}
              />
              {errors.oContentRecommendationPopup?.oContentData && (
                <Form.Control.Feedback className="pt-1" type="invalid">
                  {errors.oContentRecommendationPopup?.oContentData.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
          <Col sm={6}>
            <CommonInput
              type="text"
              register={register}
              errors={errors}
              className={errors?.oContentRecommendationPopup?.sBadge && 'error'}
              name="oContentRecommendationPopup.sBadge"
              label="Badge"
              placeholder="New"
              required
              validation={{ maxLength: { value: 50, message: validationErrors.maxLength(50) } }}
            />
          </Col>
          <Col sm={6}>
            <CommonInput
              type="text"
              register={register}
              errors={errors}
              className={errors?.oContentRecommendationPopup?.sCTAText && 'error'}
              name="oContentRecommendationPopup.sCTAText"
              label="Button Text"
              placeholder="Read More"
              validation={{ maxLength: { value: 25, message: validationErrors.maxLength(25) } }}
              required
            />
          </Col>
        </Row>
      </Col>
      <Col sm={4} className="add-article">
        <CategoryPlayerTeamImage
          galleryType="pub"
          title="Image"
          name="oBannerImage"
          register={register}
          setValue={setValue}
          values={getValues()}
          errors={errors}
          clearErrors={clearErrors}
          hideCaption
          hideAttribution
          required
        />
      </Col>
    </Row>
  )
}
