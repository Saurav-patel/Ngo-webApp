
export class BaseService {
  validate(response, fallbackMessage = "Something went wrong") {
    const data = response?.data
    if (!data?.success) {
      throw new Error(data?.message || fallbackMessage)
    }
    return data
  }

  parseData(response, fallbackMessage) {
    const data = this.validate(response, fallbackMessage)
    return data.data
  }
}
