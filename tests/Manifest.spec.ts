import nock from 'nock'
import Manifest from '../src/Manifest'

describe('Manifest', () => {
  const baseUrl: string = 'http://localhost:1111/api/dynamic'

  beforeEach(() => {
    // Clean up all mocks
    nock.cleanAll()
  })

  it('should create a new instance of the client with default values', () => {
    const manifest = new Manifest()

    expect(manifest.baseUrl).toBe('http://localhost:1111/api/dynamic')
    expect(manifest.authBaseUrl).toBe('http://localhost:1111/api/auth')
  })

  it('should create a new instance of the client with custom values', () => {
    const customPort = 2222

    const manifest = new Manifest(`http://localhost:${customPort}`)

    expect(manifest.baseUrl).toBe(`http://localhost:${customPort}/api/dynamic`)
    expect(manifest.authBaseUrl).toBe(`http://localhost:${customPort}/api/auth`)
  })

  it('should set the slug of the entity to query', () => {
    const manifest = new Manifest()

    expect(manifest.from('cats')).toBe(manifest)
    expect(manifest['slug']).toBe('cats')
  })

  it('should get the paginated list of items of the entity', async () => {
    const scope = nock(baseUrl).get('/cats/1').reply(200, { test: 'test' })

    const manifest = new Manifest()
    const paginator = await manifest.from('cats').findOneById(1)

    console.log(paginator)

    expect(scope.isDone()).toBe(true)
  })
})
