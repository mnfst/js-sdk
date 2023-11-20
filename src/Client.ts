import axios, { AxiosHeaders } from "axios"

export default class Client {
  /**
   * The CASE backend URL address (Without ending slash).
   */
  baseUrl: string
  authBaseUrl: string
  uploadBaseUrl: string
  storageBaseUrl: string

  private slug: string
  private headers: AxiosHeaders = new AxiosHeaders()

  /**
   * Create a new instance of the client.
   *
   * @param baseUrl The CASE backend URL address (Without ending slash). Default: http://localhost:4000
   */
  constructor(baseUrl: string = "http://localhost:4000") {
    this.baseUrl = baseUrl + "/api/dynamic"
    this.authBaseUrl = baseUrl + "/api/auth"
    this.uploadBaseUrl = baseUrl + "/api/upload"
    this.storageBaseUrl = baseUrl + "/storage"
    this.slug = ""
  }

  /**
   * Set the slug of the entity to query.
   *
   * @param slug The slug of the entity to query.
   *
   * @returns The current instance of the client.
   * @example client.from('cats').find();
   */
  from(slug: string): this {
    this.slug = slug
    return this
  }

  // TODO: Paginator typing from @casejs/case.
  /**
   * Get the list of items of the entity.
   *
   * @returns The list of items of the entity.
   */
  async find(): Promise<any> {
    return (
      await axios.get(`${this.baseUrl}/${this.slug}`, {
        headers: this.headers,
      })
    ).data
  }

  /**
   * Get an item of the entity.
   *
   * @param id The id of the item to get.
   *
   * @returns The item of the entity.
   * @example client.from('cats').findOne(1);
   *
   **/
  async findOne(id: number): Promise<any> {
    return (
      await axios.get(`${this.baseUrl}/${this.slug}/${id}`, {
        headers: this.headers,
      })
    ).data
  }

  /**
   * Create an item of the entity.
   *
   * @param itemDto The DTO of the item to create.
   *
   * @returns The created item.
   */
  async create(itemDto: any): Promise<any> {
    const response: any = (
      await axios.post(`${this.baseUrl}/${this.slug}`, itemDto, {
        headers: this.headers,
      })
    ).data

    const createdItemId: number = response.identifiers[0].id

    return this.findOne(createdItemId)
  }

  /**
   * Update an item of the entity.
   *
   * @param id The id of the item to update.
   * @param itemDto The DTO of the item to update.
   *
   * @returns The updated item.
   */
  async update(id: number, itemDto: any): Promise<any> {
    await axios.put(`${this.baseUrl}/${this.slug}/${id}`, itemDto, {
      headers: this.headers,
    })

    return this.findOne(id)
  }

  /**
   *
   * Delete an item of the entity.
   *
   * @param id The id of the item to delete.
   *
   * @returns The id of the deleted item.
   */
  async delete(id: number): Promise<void> {
    await axios
      .delete(`${this.baseUrl}/${this.slug}/${id}`, {
        headers: this.headers,
      })
      .then(() => id)
  }

  /**
   *
   * Login as any authenticable entity.
   *
   * @param entitySlug The slug of the entity to login as.
   * @param email The email of the entity to login as.
   * @param password The password of the entity to login as.
   *
   * @returns Promise<void>
   */
  async login(
    entitySlug: string,
    email: string,
    password: string
  ): Promise<any> {
    const response: { token: string } = (
      await axios.post(`${this.authBaseUrl}/${entitySlug}/login`, {
        email,
        password,
      })
    ).data

    this.headers.set("Authorization", `Bearer ${response.token}`)
  }

  /**
   *
   * Logout as any authenticable entity.
   *
   * @returns void
   */
  logout(): void {
    this.headers.delete("Authorization")
  }

  /**
   * Signup as any authenticable entity but Admin and login.
   *
   * @param entitySlug The slug of the entity to signup as.
   * @param email The email of the entity to signup as.
   * @param password The password of the entity to signup as.
   *
   * @returns void
   */
  async signup(
    entitySlug: string,
    email: string,
    password: string
  ): Promise<any> {
    const response: { token: string } = (
      await axios.post(`${this.authBaseUrl}/${entitySlug}/signup`, {
        email,
        password,
      })
    ).data

    this.headers.set("Authorization", `Bearer ${response.token}`)
  }

  /**
   *
   * Adds a file to the CASE backend.
   *
   * @param file The file to upload.
   *
   * @returns The absolute URL of the uploaded file.
   *
   */
  async addFile(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("entitySlug", this.slug)

    const response: { path: string } = (
      await axios.post(`${this.uploadBaseUrl}/file`, formData, {
        headers: this.headers,
      })
    ).data

    return this.storageBaseUrl + response.path
  }

  /**
   * Adds an image to the CASE backend.
   *
   * @param propName The property name for witch the image is added.
   * @param image The image to upload.
   *
   * @returns an object containing the absolute URLs of the sizes of the uploaded image.
   */
  async addImage(
    propName: string,
    image: File
  ): Promise<{ [key: string]: string }> {
    const formData = new FormData()
    formData.append("image", image)
    formData.append("entitySlug", this.slug)
    formData.append("propName", propName)

    const response: { [key: string]: string } = (
      await axios.post(`${this.uploadBaseUrl}/image`, formData, {
        headers: this.headers,
      })
    ).data

    return Object.keys(response).reduce(
      (acc: { [key: string]: string }, key: string) => {
        acc[key] = this.storageBaseUrl + response[key]
        return acc
      },
      {}
    )
  }
}
