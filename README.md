# Otmoic Software Development Kit

The Otmoic Software Development Kit (SDK) allows developers to perform cross-chain transactions and exchanges on the Otmoic platform. This SDK provides a comprehensive set of tools and utilities to interact with various blockchain networks, including Ethereum and Solana. It simplifies the process of querying balances, fetching swap histories, and executing swaps across different chains etc.

This SDK is designed to be easy to use, with clear documentation and examples to help you get started quickly.

## Usage

To use the Otmoic SDK, follow these steps:

1. **Install the SDK**:

    ```sh
    npm install --save otmoic-software-development-kit
    ```

2. **Import the SDK**:

    ```ts
    import { Relay } from 'otmoic-software-development-kit';

    const RELA_URL = 'https://relay-1.mainnet.otmoic.cloud';
    const relay = new Relay(RELA_URL);
    ```

### Examples

#### Fetching Balance

To fetch the balance of a specific address, you can use the `GetBalance` function from the `assistive` namespace. Below is an example:

```ts
import { Bridge, assistive } from 'otmoic-software-development-kit';

const bridge: Bridge = {
    bridge_id: 6,
    src_chain_id: 9006,
    dst_chain_id: 9006,
    src_token: '0x0000000000000000000000000000000000000000',
    dst_token: '0xaCDA8BF66C2CADAc9e99Aa1aa75743F536E71094',
    bridge_name: undefined,
};

const NETWORK = 'testnet';
const ADDRESS = '0x945e9704D2735b420363071bB935ACf2B9C4b814';

const GetBalance = async () => {
    const balance = await assistive.GetBalance(bridge, ADDRESS, NETWORK, undefined);
    console.log('balance', balance);
};

GetBalance();
```

For more detailed usage and additional examples, refer to the example files in the [example](./example) directory.

## API Reference

<!-- Document the main classes, functions, and interfaces -->

## Contributing

<!-- Guidelines for contributing to the project -->

## License

<!-- License information -->
