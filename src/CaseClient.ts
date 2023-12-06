import { Paginator, WhereOperator, whereOperatorKeySuffix } from '@casejs/types'

export default class CaseClient {
  /**
   * The CASE backend URL address (Without ending slash).
   */
  baseUrl: string
  authBaseUrl: string
  uploadBaseUrl: string
  storageBaseUrl: string

  private slug: string
  private headers: Record<string, string> = {}
  private queryParams: { [key: string]: string } = {}

  /**
   * Create a new instance of the client.
   *
   * @param baseUrl The CASE backend URL address (Without ending slash). Default: http://localhost:4000
   */
  constructor(baseUrl: string = 'http://localhost:4000') {
    this.baseUrl = baseUrl + '/api/dynamic'
    this.authBaseUrl = baseUrl + '/api/auth'
    this.uploadBaseUrl = baseUrl + '/api/upload'
    this.storageBaseUrl = baseUrl + '/storage'
    this.slug = ''
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
    this.queryParams = {}
    return this
  }

  /**
   * Get the list of items of the entity.
   *
   * @returns An array of items of the entity.
   */
  async find<T>(): Promise<T[]>

  /**
   * Get the paginated list of items of the entity.
   *
   * @param paginationParams The pagination parameters.
   *
   * @returns A paginator of items of the entity.
   */
  async find<T>(paginationParams: {
    page?: number
    perPage?: number
  }): Promise<Paginator<T>>

  /**
   * Implementation of the `find` function that can either fetch all entities of type T
   * or fetch them with pagination based on the provided arguments.
   *
   * @param paginationParams - Optional pagination parameters. If provided, the function
   *                           returns a paginated result, otherwise returns all entities.
   * @returns A Promise that resolves to either an array of entities of type T
   *          or a Paginator object containing entities of type T, based on the input.
   */
  find<T>(paginationParams?: {
    page?: number
    perPage?: number
  }): Promise<T[] | Paginator<T>> {
    if (paginationParams) {
      return fetch(
        this.buildUrlWithQueryParams(`${this.baseUrl}/${this.slug}`, {
          ...this.queryParams,
          ...paginationParams,
        }),
        {
          headers: this.headers,
          method: 'GET',
        }
      ).then((res) => res.json())
    } else {
      return fetch(
        this.buildUrlWithQueryParams(
          `${this.baseUrl}/${this.slug}`,
          this.queryParams
        ),
        {
          headers: this.headers,
          method: 'GET',
        }
      ).then((res) => res.json())
    }
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
  findOneById<T>(id: number): Promise<T> {
    return fetch(`${this.baseUrl}/${this.slug}/${id}`, {
      headers: this.headers,
      method: 'GET',
    }).then((res) => res.json())
  }

  /**
   * Create an item of the entity.
   *
   * @param itemDto The DTO of the item to create.
   *
   * @returns The created item.
   */
  async create<T>(itemDto: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${this.slug}`, {
      headers: this.headers,
      method: 'POST',
      body: JSON.stringify(itemDto),
    }).then((res) => res.json())

    const createdItemId: number = response.identifiers[0].id

    return this.findOneById(createdItemId)
  }

  /**
   * Update an item of the entity.
   *
   * @param id The id of the item to update.
   * @param itemDto The DTO of the item to update.
   *
   * @returns The updated item.
   * @example client.from('cats').update(1, { name: 'updated name' });
   */
  async update<T>(id: number, itemDto: any): Promise<T> {
    await fetch(`${this.baseUrl}/${this.slug}/${id}`, {
      headers: this.headers,
      method: 'PUT',
      body: JSON.stringify(itemDto),
    }).then((res) => res.json())

    return this.findOneById(id)
  }

  /**
   *
   * Delete an item of the entity.
   *
   * @param id The id of the item to delete.
   *
   * @returns The id of the deleted item.
   * @example client.from('cats').delete(1);
   */
  delete(id: number): Promise<number> {
    return fetch(`${this.baseUrl}/${this.slug}/${id}`, {
      headers: this.headers,
      method: 'DELETE',
    }).then(() => id)
  }

  /**
   *
   * Adds a where clause to the query.
   *
   * @param whereClause The where clause to add.
   *
   * @returns The current instance of the client.
   * @example client.from('cats').where('age = 10').find();
   */
  where(whereClause: string): this {
    // Check if the where clause includes one of the available operators (between spaces). We reverse array as some operators are substrings of others (ex: >= and >).
    const whereOperator: WhereOperator = Object.values(WhereOperator)
      .reverse()
      .find((operator) =>
        whereClause.includes(` ${operator} `)
      ) as WhereOperator

    if (!whereOperator) {
      throw new Error(
        `Invalid where clause. Where clause must include one of the following operators: ${Object.values(
          WhereOperator
        ).join(', ')}.`
      )
    }

    const [propName, propValue] = whereClause
      .split(whereOperator)
      .map((str) => str.trim())

    const suffix: string = whereOperatorKeySuffix[whereOperator]
    this.queryParams[propName + suffix] = propValue

    return this
  }

  /**
   * Adds a where clause to the query.
   *
   * @param whereClause
   * @returns The current instance of the client.
   * @example client.from('cats').andWhere('age = 10').find();
   */
  andWhere(whereClause: string): this {
    return this.where(whereClause)
  }

  /**
   * Adds an order by clause to the query.
   *
   * @param propName The property name to order by.
   * @param order The order of the property (ASC or DESC). Default ASC
   *
   * @returns The current instance of the client.
   * @example client.from('cats').orderBy('age', { desc: true }).find();
   */
  orderBy(propName: string, order?: { desc: boolean }): this {
    this.queryParams['orderBy'] = propName
    this.queryParams['order'] = order?.desc ? 'DESC' : 'ASC'

    return this
  }

  /**
   * Loads the relations of the entity.
   *
   * @param relations The relations to load.
   *
   * @returns The current instance of the client.
   * @example client.from('cats').with(['owner', 'owner.company']).find();
   */
  with(relations: string[]): this {
    this.queryParams['relations'] = relations.join(',')

    return this
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
    const response: { token: string } = await fetch(
      `${this.authBaseUrl}/${entitySlug}/login`,
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      }
    ).then((res) => res.json())

    this.headers['Authorization'] = `Bearer ${response.token}`
  }

  /**
   *
   * Logout as any authenticable entity.
   *
   * @returns void
   */
  logout(): void {
    delete this.headers['Authorization']
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
    const response: { token: string } = await fetch(
      `${this.authBaseUrl}/${entitySlug}/signup`,
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      }
    ).then((res) => res.json())

    this.headers['Authorization'] = `Bearer ${response.token}`
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
    formData.append('file', file)
    formData.append('entitySlug', this.slug)

    const response: { path: string } = await fetch(
      `${this.uploadBaseUrl}/file`,
      {
        method: 'POST',
        body: formData,
      }
    ).then((res) => res.json())

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
    formData.append('image', image)
    formData.append('entitySlug', this.slug)
    formData.append('propName', propName)

    const response: { [key: string]: string } = await fetch(
      `${this.uploadBaseUrl}/image`,
      {
        method: 'POST',
        body: formData,
      }
    ).then((res) => res.json())

    return Object.keys(response).reduce(
      (acc: { [key: string]: string }, key: string) => {
        acc[key] = this.storageBaseUrl + response[key]
        return acc
      },
      {}
    )
  }

  private buildUrlWithQueryParams(
    baseUrl: string,
    queryParams: Record<string, string | number | boolean>
  ): string {
    const url = new URL(baseUrl)
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value.toString())
      }
    })
    return url.toString()
  }
}
