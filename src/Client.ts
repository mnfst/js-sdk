import axios from "axios";

export default class Client {
  /**
   * The CASE backend URL address (Without ending slash).
   */
  baseUrl: string;
  private slug: string;

  constructor(baseUrl: string = "http://localhost:4000") {
    this.baseUrl = baseUrl + "/api/dynamic";
    this.slug = "";
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
    this.slug = slug;
    return this;
  }

  // TODO: Paginator typing
  /**
   * Get the list of items of the entity.
   *
   * @returns The list of items of the entity.
   */
  async find() {
    return (await axios.get(`${this.baseUrl}/${this.slug}`)).data;
  }

  async findOne(id: number) {
    return (await axios.get(`${this.baseUrl}/${this.slug}/${id}`)).data;
  }

  async create(itemDto: any): Promise<any> {
    const response: any = (
      await axios.post(`${this.baseUrl}/${this.slug}`, itemDto)
    ).data;

    const createdItemId: number = response.identifiers[0].id;

    return this.findOne(createdItemId);
  }

  async update(id: number, itemDto: any): Promise<any> {
    await axios.put(`${this.baseUrl}/${this.slug}/${id}`, itemDto);

    return this.findOne(id);
  }
}
