import Manifest from '../src'

describe('Manifest', () => {
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
})
