import { Paginator, WhereOperator, whereOperatorKeySuffix } from '@mnfst/types'

export default class Manifest {
  /**
   * The Manifest backend base URL (Without ending slash).
   */
  baseUrl: string

  authBaseUrl: string

  private slug: string
  private headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  private queryParams: { [key: string]: string } = {}

  /**
   * Create a new instance of the client.
   *
   * @param baseUrl The Manifest backend URL address (Without ending slash). Default: http://localhost:1111
   */
  constructor(baseUrl: string = 'http://localhost:1111') {
    this.baseUrl = baseUrl + '/api/dynamic'
    this.authBaseUrl = baseUrl + '/api/auth'
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
   * Get the paginated list of items of the entity.
   *
   * @param paginationParams - Optional pagination parameters. If provided, the function
   *                           returns a paginated result, otherwise returns all entities.
   * @returns A Promise that resolves a Paginator object containing entities of type T, based on the input.
   */
  find<T>(paginationParams?: {
    page?: number
    perPage?: number
  }): Promise<Paginator<T>> {
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
