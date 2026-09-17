import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { useQuery } from '@apollo/client'
import { Controller, useFormContext } from 'react-hook-form'
import Select, { components } from 'react-select'

import useReactSelect from 'shared/hooks/useReactSelect'
import { GET_ALL_COMPONENTS_LIST, GET_COMPONENTS_WITHOUT_PERMISSION } from 'graph-ql/page-components/query'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { FormUnsavedChangesPrompt } from 'shared/components/unsaved-changes'
import { ensurePageComponentInstanceId, getPageComponentInstanceId } from 'shared/components/page-components/registry'
import ComponentPreviewTrigger from './component-preview-trigger'

function getComponentKey(component = {}) {
  return component?.iId?._id || component?.iId || component?._id || component?.eType || ''
}

function getComponentType(component = {}) {
  return component?.eType || component?.iId?.eType || ''
}

function getComponentLabel(component = {}) {
  return component?.iId?.sComponentTitle || component?.sComponentTitle || component?.eType || ''
}

function getComponentSelectValue(component = {}) {
  return getPageComponentInstanceId(component) || getComponentKey(component)
}

function ensureComponentInstance(component = {}) {
  return ensurePageComponentInstanceId(component)
}

function ensureSelectedComponents(componentsList = []) {
  return (Array.isArray(componentsList) ? componentsList : []).filter(Boolean).map(ensureComponentInstance)
}

function hydrateComponentId(component = {}, matchedComponent = {}) {
  const componentId = matchedComponent?._id || component?._id || component?.iId?._id || component?.iId

  if (component?.iId && typeof component.iId === 'object') {
    return {
      ...component.iId,
      _id: component?.iId?._id || componentId,
      sComponentTitle: matchedComponent?.sComponentTitle || component?.iId?.sComponentTitle || component?.sComponentTitle || '',
      eType: matchedComponent?.eType || component?.iId?.eType || component?.eType || '',
      eComponentType: matchedComponent?.eComponentType || component?.iId?.eComponentType || component?.eComponentType || '',
      sPreviewUrl: matchedComponent?.sPreviewUrl || component?.iId?.sPreviewUrl || component?.sPreviewUrl || ''
    }
  }

  return component?.iId || matchedComponent?.iId || componentId
}

function hydrateSelectedComponent(component = {}, optionsByKey = new Map(), optionsByType = new Map()) {
  const componentKey = getComponentKey(component)
  const matchedComponent = optionsByKey.get(componentKey) || optionsByType.get(getComponentType(component))

  if (!matchedComponent) return component

  return {
    ...matchedComponent,
    ...component,
    _id: matchedComponent?._id || component?._id || component?.iId?._id || component?.iId,
    iId: hydrateComponentId(component, matchedComponent),
    eType: matchedComponent?.eType || getComponentType(component),
    eComponentType: matchedComponent?.eComponentType || component?.eComponentType,
    sComponentTitle: matchedComponent?.sComponentTitle || component?.sComponentTitle,
    sPreviewUrl: matchedComponent?.sPreviewUrl || component?.sPreviewUrl
  }
}

function getHydratedComponentSnapshot(component = {}) {
  return [
    getPageComponentInstanceId(component),
    getComponentKey(component),
    component?._id || '',
    getComponentType(component),
    component?.eComponentType || component?.iId?.eComponentType || '',
    getComponentLabel(component),
    component?.sPreviewUrl || ''
  ].join('|')
}

function hasHydratedValueChanged(currentValue = [], hydratedValue = []) {
  if (currentValue.length !== hydratedValue.length) return true

  return currentValue.some((component, index) => getHydratedComponentSnapshot(component) !== getHydratedComponentSnapshot(hydratedValue[index]))
}

function getUniqueComponents(componentsList = []) {
  const componentsByKey = new Map()

  componentsList.forEach((component) => {
    const componentKey = getComponentKey(component)
    if (componentKey && !componentsByKey.has(componentKey)) componentsByKey.set(componentKey, component)
  })

  return Array.from(componentsByKey.values())
}

function ComponentSelectLabel({ component, children }) {
  return (
    <div className="component-select-label">
      <span className="component-select-label__text">{getComponentLabel(component) || children}</span>
      <ComponentPreviewTrigger component={component} />
    </div>
  )
}

ComponentSelectLabel.propTypes = {
  children: PropTypes.node,
  component: PropTypes.object
}

function ComponentOption(props) {
  return (
    <components.Option {...props}>
      <ComponentSelectLabel component={props.data}>{props.children}</ComponentSelectLabel>
    </components.Option>
  )
}

ComponentOption.propTypes = {
  children: PropTypes.node,
  data: PropTypes.object
}

function ComponentMultiValueLabel(props) {
  return (
    <components.MultiValueLabel {...props}>
      <ComponentSelectLabel component={props.data}>{props.children}</ComponentSelectLabel>
    </components.MultiValueLabel>
  )
}

ComponentMultiValueLabel.propTypes = {
  children: PropTypes.node,
  data: PropTypes.object
}

function ComponentCompactMultiValue(props) {
  const selectedValues = props.getValue()
  const compactSelectedLimit = props.selectProps?.compactSelectedLimit || 3
  const hiddenCount = selectedValues.length - compactSelectedLimit

  if (props.index < compactSelectedLimit) return <components.MultiValue {...props} />

  if (props.index === compactSelectedLimit && hiddenCount > 0) {
    return (
      <div className="select__multi-value select__multi-value--more" title="Open dropdown to view all selected components">
        <span className="select__multi-value__label">+{hiddenCount} more</span>
      </div>
    )
  }

  return null
}

ComponentCompactMultiValue.propTypes = {
  getValue: PropTypes.func,
  index: PropTypes.number,
  selectProps: PropTypes.object
}

function ComponentSelectedMenuList(props) {
  const selectedValues = props.getValue().filter(Boolean)

  function handleRemoveSelectedComponent(event, componentIndex) {
    event.preventDefault()
    event.stopPropagation()
    props.setValue(selectedValues.filter((_, index) => index !== componentIndex), 'remove-value', selectedValues[componentIndex])
  }

  return (
    <components.MenuList {...props}>
      <div className="component-select-menu-panel">
        <div className="component-select-menu-panel__column component-select-menu-panel__column--selected">
          <div className="component-select-menu-panel__header">
            <span>Selected components</span>
            <span>{getSelectedComponentCountLabel(selectedValues.length)}</span>
          </div>
          <div className="component-select-menu-panel__selected-list">
            {selectedValues.map((component, index) => {
              const label = getComponentLabel(component)

              return (
                <div className="component-select-menu-panel__selected-item" key={`${getComponentSelectValue(component)}-${index}`} title={label}>
                  <span className="component-select-menu-panel__selected-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="component-select-menu-panel__selected-label">{label}</span>
                  <ComponentPreviewTrigger component={component} />
                  <button
                    type="button"
                    className="component-select-menu-panel__remove"
                    aria-label={`Remove ${label}`}
                    onMouseDown={(event) => handleRemoveSelectedComponent(event, index)}
                    onClick={(event) => event.preventDefault()}
                  >
                    <i className="icon-close d-block" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
        <div className="component-select-menu-panel__column component-select-menu-panel__column--available">
          <div className="component-select-menu-panel__header">
            <span>Available components</span>
          </div>
          <div className="component-select-menu-panel__options">{props.children}</div>
        </div>
      </div>
    </components.MenuList>
  )
}

ComponentSelectedMenuList.propTypes = {
  children: PropTypes.node,
  getValue: PropTypes.func,
  setValue: PropTypes.func
}

const selectComponents = {
  Option: ComponentOption,
  MultiValueLabel: ComponentMultiValueLabel
}

function getSelectedComponentCountLabel(count) {
  if (!count) return 'No components selected'
  return `${count} ${count === 1 ? 'component' : 'components'} selected`
}

export default function AddPageComponents({
  control,
  name,
  ePageComponentType,
  error,
  disabled = false,
  allowedComponentTypes = [],
  includeAllComponentTypes = false,
  includeAllWithoutPermission = false,
  variant = 'default',
  compactSelectedLimit = 3
}) {
  const {
    formState: { errors },
    setValue,
    watch
  } = useFormContext()

  const selectedValue = watch(name)
  const selectedCount = Array.isArray(selectedValue) ? selectedValue.length : 0
  const isStickyVariant = variant === 'sticky'
  const activeSelectComponents = React.useMemo(
    () => (isStickyVariant ? { ...selectComponents, MenuList: ComponentSelectedMenuList, MultiValue: ComponentCompactMultiValue } : selectComponents),
    [isStickyVariant]
  )
  const [allComponents, setAllComponents] = React.useState([])
  const allComponentsRequestParams = React.useMemo(
    () => ({
      nLimit: 1000,
      nOrder: -1,
      nSkip: 1,
      sSearch: '',
      sSortBy: '_id'
    }),
    []
  )
  const requestParams = React.useMemo(
    () => ({
      sSearch: '',
      ...(includeAllComponentTypes || includeAllWithoutPermission ? {} : { ePageComponentType })
    }),
    [ePageComponentType, includeAllComponentTypes, includeAllWithoutPermission]
  )

  const { loading: allComponentsLoading } = useQuery(GET_ALL_COMPONENTS_LIST, {
    skip: !includeAllComponentTypes,
    variables: {
      pageWiseInput: { ...allComponentsRequestParams, eComponentType: 'pw' },
      staticInput: { ...allComponentsRequestParams, eComponentType: 's' },
      dynamicInput: { ...allComponentsRequestParams, eComponentType: 'd' }
    },
    onCompleted: (data) => {
      setAllComponents(
        getUniqueComponents([
          ...(data?.pageWise?.aResults || []),
          ...(data?.static?.aResults || []),
          ...(data?.dynamic?.aResults || [])
        ])
      )
    }
  })

  const {
    onApiResponce,
    loading,
    items: category
  } = useReactSelect({
    query: GET_COMPONENTS_WITHOUT_PERMISSION,
    requestParams,
    skip: includeAllComponentTypes,
    responceCallBack: (data) => {
      onApiResponce(data?.listComponentWithoutPermission?.aResults)
    }
  })
  const componentOptions = includeAllComponentTypes ? allComponents : category
  const isLoading = includeAllComponentTypes ? allComponentsLoading : loading
  const filteredCategory = React.useMemo(
    () => (allowedComponentTypes.length ? componentOptions.filter((item) => allowedComponentTypes.includes(item?.eType)) : componentOptions),
    [allowedComponentTypes, componentOptions]
  )
  const optionsByKey = React.useMemo(() => new Map(filteredCategory.map((item) => [getComponentKey(item), item])), [filteredCategory])
  const optionsByType = React.useMemo(() => new Map(filteredCategory.map((item) => [getComponentType(item), item])), [filteredCategory])

  React.useEffect(() => {
    const currentValue = Array.isArray(selectedValue) ? selectedValue : []
    if (!currentValue.length) return

    const hydratedValue = currentValue.map((item) => {
      const hydratedItem = optionsByKey.size ? hydrateSelectedComponent(item, optionsByKey, optionsByType) : item
      return ensureComponentInstance(hydratedItem)
    })
    if (hasHydratedValueChanged(currentValue, hydratedValue)) {
      setValue(name, hydratedValue, { shouldDirty: false, shouldValidate: false })
    }
  }, [name, optionsByKey, optionsByType, selectedValue, setValue])

  return (
    <>
      <FormUnsavedChangesPrompt />
      <Form.Group className={`form-group add-page-components ${isStickyVariant ? 'add-page-components--sticky' : ''}`}>
      <div className="add-page-components__heading">
        <Form.Label>Select Component*</Form.Label>
        {isStickyVariant && <span className="add-page-components__count">{getSelectedComponentCountLabel(selectedCount)}</span>}
      </div>
      <Controller
        name={name}
        rules={{ required: validationErrors.required }}
        control={control}
        render={({ field: { onChange, value = [], ref } }) => {
          const hydratedValue = ensureSelectedComponents(
            (Array.isArray(value) ? value : []).map((item) => hydrateSelectedComponent(item, optionsByKey, optionsByType))
          )

          return (
            <Select
              ref={ref}
              isLoading={isLoading}
              isDisabled={disabled}
              placeholder="Add Components"
              value={hydratedValue}
              options={filteredCategory}
              getOptionLabel={getComponentLabel}
              getOptionValue={getComponentSelectValue}
              className={`react-select ${isStickyVariant ? 'react-select--component-toolbar' : ''}`}
              classNamePrefix="select"
              components={activeSelectComponents}
              compactSelectedLimit={compactSelectedLimit}
              // onInputChange={handleSearch}
              isSearchable
              // onMenuScrollToBottom={handleScroll}
              isMulti
              isClearable={!isStickyVariant}
              backspaceRemovesValue={!isStickyVariant}
              captureMenuScroll={!isStickyVariant}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              isOptionSelected={() => false}
              maxMenuHeight={360}
              menuPlacement="auto"
              menuShouldScrollIntoView={false}
              onChange={(e) => {
                onChange(ensureSelectedComponents(e))
                // addCategoryURL(e.oSeo.sSlug + '/')
              }}
            />
          )
        }}
      />
      {(errors?.[name] || error) && (
        <Form.Control.Feedback type="invalid">{error?.message || errors?.[name]?.message}</Form.Control.Feedback>
      )}
    </Form.Group>
    </>
  )
}
AddPageComponents.propTypes = {
  allowedComponentTypes: PropTypes.array,
  control: PropTypes.object,
  disabled: PropTypes.bool,
  error: PropTypes.object,
  includeAllComponentTypes: PropTypes.bool,
  includeAllWithoutPermission: PropTypes.bool,
  compactSelectedLimit: PropTypes.number,
  name: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'sticky']),
  ePageComponentType: PropTypes.string.isRequired
}
