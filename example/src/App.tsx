import logo from './logo.svg'
import './App.css'
import Manifest from '@mnfst/sdk'

const client = new Manifest()

client.login('admins', 'admin@manifest.build', 'admin').then((res) => {
  client
    .from('users')
    .find()
    .then((cats) => console.log(cats))
})

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
