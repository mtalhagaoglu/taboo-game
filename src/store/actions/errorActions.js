export const errorActionCreator = (errorType, error) => {
    console.log(errorType)
    return {
      type: errorType,
      error: true,
      payload: error,
    }
  }

  //Clears errors from store when component unmounts in case next component is synched to same error state
  export const clearErrors = (type) => {
    return {
      type,
    }
  }