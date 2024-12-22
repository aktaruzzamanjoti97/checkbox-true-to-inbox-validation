import { yupResolver } from '@hookform/resolvers/yup';
import { Fragment, useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { Controller, useFieldArray, useFormState } from 'react-hook-form';
import { FaTrashAlt } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import {
  useGetQuery,
  usePostMutation,
  usePutMutation
} from '../../../shared/api/Mutations';
import FormLabel from '../../../shared/components/FormLabel';
import PageTitle from '../../../shared/components/Pagetitle';
import { CreateOrBackToList } from '../../../shared/components/table/CustomTableActions';
import {
  CustomConfirmationCheck,
  CustomDatePicker,
  CustomInput,
  CustomSelect,
  CustomSubmit
} from '../../../shared/hook-form-components';
import useHookForm from '../../../shared/hooks/useHookForm';

const ConfigurationSetup = () => {
  const { state } = useLocation();

  const navigate = useNavigate();
  const [hfConfigureId, setHfConfigureId] = useState(state?.id || null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const defaultValue = {
    configurationDetails: [
      {
        validFrom: '',
        validTo: '',
        propertyCategory: '',
        departureDay: '',
        vatTaxInclude: true,
        withFlight: true,
        propertyNames: [''],
        configurationDetailsRates: [
          {
            rateTypeId: null,
            rate: null
          }
        ],
        configurationChildWiseRates: {
          infant: null,
          threeToSix: null,
          sevenToTwelve: null
        },
        configurationAirlines: {
          departAirName: '',
          departFlightNumber: '',
          departFlightTime: '',
          arrivalAirName: '',
          arrivalFlightNumber: '',
          arrivalFlightTime: ''
        }
      }
    ]
  };

  const [currentValue, setCurrentValue] = useState(state || defaultValue);

  const {
    data: propertyRateData,
    isLoading,
    refetch
  } = useGetQuery(['propertyRateType_list'], `/propertyRateType`);

  const configurationSchema = yup.object().shape({
    configurationDetails: yup.array().of(
      yup.object().shape({
        // propertyName: yup
        //   .array()
        //   .of(
        //     yup
        //       .string()
        //       .required('Property Name is required') // Ensure each property name is required
        //       .min(1, 'Property Name must be at least 1 character') // Minimum length validation
        //   )
        //   .min(1, 'At least one Property Name is required'),
        validFrom: yup
          .date()
          .required('Valid From is required')
          .typeError('Invalid date'),
        validTo: yup
          .date()
          .required('Valid To is required')
          .typeError('Invalid date')
          .min(yup.ref('validFrom'), 'Valid To must be after Valid From'),
        propertyCategory: yup
          .string()
          .required('Property Category is required'),
        departureDay: yup.string().required('Departure Day is required'),
        vatTaxInclude: yup.boolean().required(),
        withFlight: yup.boolean().required(),
        // propertyName: yup
        //   .array()
        //   .of(yup.string().required('Property Name is required'))
        //   .min(1, 'At least one Property Name is required'),
        // detailsRateRequest: yup.array().of(
        //   yup.object().shape({
        //     rateTypeId: yup
        //       .number()
        //       .nullable()
        //       .required('Rate Type is required'),
        //     rate: yup.number().nullable().required('Rate is required')
        //   })
        // ),
        configurationChildWiseRates: yup.object().shape({
          infant: yup.number().nullable().required('Infant rate is required'),
          threeToSix: yup.number().required('Rate for 3-6 years is required'),
          sevenToTwelve: yup
            .number()
            .required('Rate for 7-12 years is required')
        }),
        configurationAirlines: yup.object().shape({
          departAirName: yup
            .string()
            .test(
              'required-if-flight',
              'Departure Airline is required',
              function (value) {
                const { withFlight } = this.parent; // Access the parent object
                return withFlight ? value && value.trim() !== '' : true; // Conditionally validate
              }
            )
            .nullable(),
          departFlightNumber: yup
            .string()
            .test(
              'required-if-flight',
              'Departure Flight Number is required',
              function (value) {
                const { withFlight } = this.parent;
                return withFlight ? value && value.trim() !== '' : true;
              }
            )
            .nullable(),
          departFlightTime: yup
            .string()
            .test(
              'required-if-flight',
              'Departure Flight Time is required',
              function (value) {
                const { withFlight } = this.parent;
                return withFlight ? value && value.trim() !== '' : true;
              }
            )
            .nullable(),
          arrivalAirName: yup
            .string()
            .test(
              'required-if-flight',
              'Arrival Airline Name is required',
              function (value) {
                const { withFlight } = this.parent;
                return withFlight ? value && value.trim() !== '' : true;
              }
            )
            .nullable(),
          arrivalFlightNumber: yup
            .string()
            .test(
              'required-if-flight',
              'Arrival Flight Number is required',
              function (value) {
                const { withFlight } = this.parent;
                return withFlight ? value && value.trim() !== '' : true;
              }
            )
            .nullable(),
          arrivalFlightTime: yup
            .string()
            .test(
              'required-if-flight',
              'Arrival Flight Time is required',
              function (value) {
                const { withFlight } = this.parent;
                return withFlight ? value && value.trim() !== '' : true;
              }
            )
            .nullable()
        })
      })
    )
  });

  const { handleSubmit, reset, control, getValues, trigger, register, watch } =
    useHookForm({
      resolver: yupResolver(configurationSchema),
      defaultValues: currentValue
    });
  const { errors } = useFormState({ control });
  console.log(errors);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'configurationDetails'
  });

  // create mutation
  const { mutate: createMutate, isLoading: hfSaveLoading } = usePostMutation(
    `/propertyConfiguration`,
    {
      onSuccess: (response) => {
        setHfConfigureId(response?.data?.id);
        setCurrentValue(getValues());
      }
    }
  );

  // update mutation
  const { mutate: updateMutate, isLoading: hfUpdateLoading } = usePutMutation(
    `/propertyConfiguration`,
    {
      onSuccess: (response) => {
        console.log('response', response.data);
        setHfConfigureId(response?.data?.id);
        setCurrentValue(getValues());
      }
    }
  );

  const handleFormSubmit = (data) => {
    setIsSubmitted(true);
    const { configurationDetails, ...rest } = data;

    const newConfigurationDetails = configurationDetails?.map(
      (details, index) => {
        const updatedDetailsRateRequest = propertyRateData
          ?.map((property, i) => ({
            rateTypeId: property.id,
            rate: details.configurationDetailsRates[i]?.rate || null
          }))
          .filter((rateRequest) => rateRequest.rate !== null);
        return {
          ...details,
          configurationDetailsRates: updatedDetailsRateRequest
        };
      }
    );

    const newData = {
      ...rest,
      configurationDetails: newConfigurationDetails
    };

    if (hfConfigureId) {
      updateMutate({ id: hfConfigureId, ...newData });
    } else {
      createMutate(newData);
    }
  };

  const days = [
    {
      name: 'Everyday',
      value: 'EVERYDAY'
    },
    {
      name: 'Specific Day',
      value: 'SPECIFICDAY'
    }
  ];

  // if (fields.length === 0) {
  //   append({
  //     validFrom: '',
  //     validTo: '',
  //     propertyCategory: '',
  //     departureDay: '',
  //     vatTaxInclude: true,
  //     withFlight: true,
  //     propertyName: [''],
  //     detailsRateRequest: [{ rateTypeId: null, rate: null }],
  //     propertyConfigurationChildWiseRateRequest: {
  //       infant: null,
  //       threeToSix: null,
  //       sevenToTwelve: null
  //     },
  //     airlineRequest: {
  //       departAirName: '',
  //       departFlightNumber: '',
  //       departFlightTime: '',
  //       arrivalAirName: '',
  //       arrivalFlightNumber: '',
  //       arrivalFlightTime: ''
  //     }
  //   })
  // }

  const handleDayChange = (v, handler) => {
    handler(v);
  };

  useEffect(() => {
    reset(state || defaultValue);
  }, [state, reset]);

  return (
    <Fragment>
      <PageTitle
        activeMenu={'Hotel & Flight Configuration Setup'}
        motherMenu="Hotel & Flight Configuration"
      />
      <CreateOrBackToList path="/hf-configuration" type={'list'} />

      <form className="form-valide" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Hotel & Flight Configuration Setup</h4>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-lg-6 mb-3">
                <CustomInput
                  label="System Code"
                  // defaultValue={stepOneData.packageCode}
                  placeholder="Auto generated code"
                  name="code"
                  control={control}
                  conditions={{
                    disabled: true
                  }}
                />
              </div>
            </div>
          </div>
          <hr />
          {fields?.map((field, index) => (
            <div key={field.id} className="card-body">
              <div className="form-validation">
                {fields.length > 1 && ( // Hide Remove button if only one field remains
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="btn btn-danger m-2">
                      <FaTrashAlt />
                    </button>
                  </div>
                )}

                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <div key={field.id}>
                      <Controller
                        control={control}
                        name={`configurationDetails.${index}.propertyNames`}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <div className={``}>
                              {field.value?.map((name, subIndex) => (
                                <div
                                  key={subIndex}
                                  className="row justify-content-between">
                                  <div className="col-lg-4 mb-2">
                                    <FormLabel
                                      title="Property Name"
                                      id={name}
                                      required={true}
                                    />
                                  </div>

                                  <div className="col-lg-8">
                                    <div className="position-relative w-100">
                                      <input
                                        id={name}
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                          const newValue = [...field.value];
                                          newValue[subIndex] = e.target.value;
                                          field.onChange(newValue);
                                        }}
                                        placeholder={`Property Name ${subIndex + 1}`}
                                        className={`form-control ${
                                          error?.message && 'border-danger'
                                        } text-start`}
                                      />
                                      {error && (
                                        <p className="text-danger m-0">
                                          {error?.message}
                                        </p>
                                      )}
                                    </div>
                                    <div className="d-flex justify-content-end">
                                      {field.value.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newValue = [...field.value];
                                            newValue.splice(subIndex, 1);
                                            field.onChange(newValue);
                                          }}
                                          className="btn btn-danger m-2">
                                          Remove
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="d-flex justify-content-end">
                              <button
                                type="button"
                                onClick={() =>
                                  field.onChange([...field.value, ''])
                                }
                                className="btn btn-primary m-2">
                                Add Property Name
                              </button>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 mb-3">
                    <CustomConfirmationCheck
                      label="Price Include VAT & Tax"
                      isRequired
                      name={`configurationDetails.${index}.vatTaxInclude`}
                      type="switch"
                      control={control}
                      inlineLabel={true}
                      // hideLabel={true}
                      isSwitchSingleItem={true}
                      defaultValue={true}
                      options={[
                        { label: 'Active', value: true },
                        { label: 'Inactive', value: false }
                      ]}
                      fieldName="vatTaxInclude"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <Table
                    responsive
                    className="primary-table-bordered table-bordered">
                    <thead className="thead-primary">
                      <tr>
                        <th scope="col">Valid From</th>
                        <th scope="col">Valid To</th>
                        <th scope="col">Category</th>
                        <th scope="col" className="text-center">
                          Departure Day
                        </th>
                        {propertyRateData?.map((d) => (
                          <th scope="col" className="text-center" key={d.id}>
                            {d.code}
                          </th>
                        ))}
                        <th scope="col" className="text-center">
                          Infant
                        </th>
                        <th scope="col" className="text-center">
                          Child 3-6
                        </th>
                        <th scope="col" className="text-center">
                          Child 7-12
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <CustomDatePicker
                            isRequired
                            name={`configurationDetails.${index}.validFrom`}
                            control={control}
                            min={
                              hfConfigureId || isSubmitted ? null : new Date()
                            }
                            hideLabel
                          />
                        </td>
                        <td>
                          {' '}
                          <CustomDatePicker
                            isRequired
                            name={`configurationDetails.${index}.validTo`}
                            min={
                              hfConfigureId || isSubmitted ? null : new Date()
                            }
                            control={control}
                            hideLabel
                          />
                        </td>
                        <td>
                          <CustomInput
                            name={`configurationDetails.${index}.propertyCategory`}
                            placeholder="Enter Category"
                            isRequired
                            control={control}
                            hideLabel
                          />
                        </td>
                        <td>
                          <CustomSelect
                            control={control}
                            // defaultValue={stepOneData?.selectionOfDays}
                            name={`configurationDetails.${index}.departureDay`}
                            label="Departure Days"
                            options={days?.map((day) => ({
                              value: day.value,
                              label: day.name
                            }))}
                            isRequired
                            hideLabel
                            // isOptionDisabled={handleOptionDisabled}
                            handleChange={handleDayChange}
                          />
                        </td>
                        {propertyRateData?.map((d, i) => (
                          <td scope="col" className="text-center" key={d.id}>
                            <CustomInput
                              name={`configurationDetails.${index}.configurationDetailsRates[${i}].rate`}
                              // defaultValue={d.title}
                              placeholder="Enter Amount"
                              control={control}
                              hideLabel
                            />
                          </td>
                        ))}
                        <td>
                          <CustomInput
                            name={`configurationDetails.${index}.configurationChildWiseRates.infant`}
                            placeholder="Enter Amount"
                            control={control}
                            type='number'
                            hideLabel
                          />
                        </td>
                        <td>
                          <CustomInput
                            name={`configurationDetails.${index}.configurationChildWiseRates.threeToSix`}
                            placeholder="Enter Amount"
                            control={control}
                            type='number'
                            hideLabel
                          />
                        </td>
                        <td>
                          <CustomInput
                            name={`configurationDetails.${index}.configurationChildWiseRates.sevenToTwelve`}
                            placeholder="Enter Amount"
                            control={control}
                            type='number'
                            hideLabel
                          />
                        </td>
                      </tr>
                    </tbody>
                    +{' '}
                  </Table>
                </div>

                <div className="row mt-5">
                  <div className="col-lg-6 mb-3">
                    <label
                      className="col-lg-4 col-form-label"
                      htmlFor="withFlight">
                      With Flight
                    </label>
                    <input
                      role="switch"
                      className="form-check-input"
                      type="checkbox"
                      {...register(`configurationDetails.${index}.withFlight`)}
                    />
                  </div>
                </div>
                {watch(`configurationDetails.${index}.withFlight`) && (
                  <div>
                    <div className="row">
                      <div className="col-lg-6 mb-3">
                        <CustomInput
                          name={`configurationDetails.${index}.configurationAirlines.departAirName`}
                          label="Departure Airline Name"
                          placeholder="Enter Airline Name"
                          control={control}
                        />
                      </div>
                      <div className="col-lg-6 mb-3">
                        <CustomInput
                          name={`configurationDetails.${index}.configurationAirlines.departFlightNumber`}
                          label="Departure Flight Number"
                          placeholder="Enter Flight Number"
                          control={control}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-6 mb-3">
                        <CustomInput
                          control={control}
                          name={`configurationDetails.${index}.configurationAirlines.departFlightTime`}
                          label="Depart Flight Time"
                          type="time"
                          isClearable
                        />
                      </div>
                      <div className="col-lg-6 mb-3">
                        <CustomInput
                          control={control}
                          name={`configurationDetails.${index}.configurationAirlines.arrivalFlightTime`}
                          label="Arrival Flight Time"
                          type="time"
                          isClearable
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-6 mb-3">
                        <CustomInput
                          name={`configurationDetails.${index}.configurationAirlines.arrivalAirName`}
                          label="Arrival Airline Name"
                          placeholder="Enter Airline Name"
                          control={control}
                        />
                      </div>
                      <div className="col-lg-6 mb-3">
                        <CustomInput
                          name={`configurationDetails.${index}.configurationAirlines.arrivalFlightNumber`}
                          label="Arrival Flight Number"
                          placeholder="Enter Flight Number"
                          control={control}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="">
                  <CustomSubmit
                    onUpdate={() => navigate(`/hf-configuration`)}
                    path="/hf-configuration"
                    isUpdateMood={!!hfConfigureId}
                    isLoading={hfUpdateLoading || hfSaveLoading}
                    onReset={() => {
                      reset(currentValue);
                    }}
                  />
                </div>
              </div>
              <hr />
            </div>
          ))}
          <div className="d-flex justify-content-end">
            <button
              type="button"
              style={{
                backgroundColor: '#362465',
                color: 'white',
                marginRight: '2rem'
              }}
              className="btn mb-3"
              onClick={() =>
                append({
                  validFrom: '',
                  validTo: '',
                  propertyCategory: '',
                  departureDay: '',
                  vatTaxInclude: true,
                  withFlight: true,
                  propertyNames: [''],
                  configurationDetailsRates: [
                    {
                      rateTypeId: null,
                      rate: null
                    }
                  ],
                  configurationChildWiseRates: {
                    infant: null,
                    threeToSix: null,
                    sevenToTwelve: null
                  },
                  configurationAirlines: {
                    departAirName: '',
                    departFlightNumber: '',
                    departFlightTime: '',
                    arrivalAirName: '',
                    arrivalFlightNumber: '',
                    arrivalFlightTime: ''
                  }
                })
              }>
              + Add More
            </button>
          </div>
        </div>
      </form>
    </Fragment>
  );
};

export default ConfigurationSetup;
