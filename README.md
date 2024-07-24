# Manifest Javascript SDK

- Website: https://manifest.build
- Documentation: https://manifest.build/docs

## Example React app

This repository includes a simple React app that you can use to test the JS SDK in real situation.

```
npm pack
cd example
npm install
npm run start
```

Then you can play around with the file `src/App.tsx` to try different features.

## Usage

Install the SDK:

```bash
npm i @mnfst/sdk
```

Use it in your project:

```js
import Manifest from @mnfst/sdk

// Initialize client.
const manifest = new Manifest()
```

See the [Manifest JS SDK doc](https://manifest.build/docs/javascript-sdk)
