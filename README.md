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

### Classes

#### `Relay`

The `Relay` class is used to interact with the Otmoic relay service. It provides methods to fetch bridges, ask for quotes, confirm swaps, and trace swap histories.

##### Constructor

```typescript
constructor(relay: string)
```

-   **Parameters**:
    -   `relay` (string): The URL of the relay service.
-   **Throws**:
    -   `Error`: If the relay parameter is not provided.

##### Methods

##### `getBridge`

Fetches the list of available bridges from the relay service.

```typescript
getBridge(): Promise<Bridge[]>
```

-   **Returns**:
    -   `Promise<Bridge[]>`: A promise that resolves to an array of `Bridge` objects.

##### `ask`

Requests a quote for a swap.

```typescript
ask(askIF: AskIF, callback: OnQuoteIF): void
```

-   **Parameters**:
    -   `askIF` (AskIF): The request object containing swap details.
    -   `callback` (OnQuoteIF): The callback object to handle the quote response.

##### `stopAsk`

Stops the ongoing quote request.

```typescript
stopAsk(): void
```

-   **Returns**:
    -   `void`

##### `swap`

Confirms a swap with the provided quote and signed data.

```typescript
swap(quote: Quote, signData: SignData, signed: string): Promise<PreBusiness>
```

-   **Parameters**:
    -   `quote` (Quote): The quote object containing swap details.
    -   `signData` (SignData): The signed data object.
    -   `signed` (string): The signed string.
-   **Returns**:
    -   `Promise<PreBusiness>`: A promise that resolves to a `PreBusiness` object.

##### `getHistory`

Fetches the swap history for a specific address.

```typescript
getHistory(address: string): Promise<BusinessFullData[]>
```

-   **Parameters**:
    -   `address` (string): The address to fetch the history for.
-   **Returns**:
    -   `Promise<BusinessFullData[]>`: A promise that resolves to an array of `BusinessFullData` objects.

##### `getBusiness`

Fetches the business details for a specific business id.

```typescript
getBusiness(hash: string): Promise<Business>
```

-   **Parameters**:
    -   `hash` (string): The hash of the business to fetch.
-   **Returns**:
    -   `Promise<Business>`: A promise that resolves to a `Business` object.

##### `getBusinessFull`

Fetches the full business details for a business id.

```typescript
getBusinessFull(hash: string): Promise<BusinessFullData>
```

-   **Parameters**:
    -   `hash` (string): The hash of the business to fetch.
-   **Returns**:
    -   `Promise<BusinessFullData>`: A promise that resolves to a `BusinessFullData` object.

### Namespaces

#### `business`

The `business` namespace provides methods to interact with the Otmoic business service. It allows you to sign, send, confirm and refund assets, and submit complaints.

##### Functions

##### `signQuoteByPrivateKey`

Signs a quote using a private key.

**Parameters:**

-   `quote: Quote` - The quote data.
-   `privateKey: string` - The private key to sign with.
-   `network: string` - The network to use.
-   `amount: string` - The amount to sign.
-   `swapToNative: number` - The percentage of amount that be swapped to native token.
-   `receivingAddress: string` - The receiving address.
-   `stepTimeLock: number | undefined` - The step time lock.
-   `rpcSrc: string | undefined` - The source RPC endpoint.
-   `rpcDst: string | undefined` - The destination RPC endpoint.

**Returns:**

-   `Promise<{ signData: SignData; signed: string }>` - signed data and signature.

##### `transferOutByPrivateKey`

Transfers out using a private key.

-   **Parameters**:

    -   `preBusiness: PreBusiness` - The pre-business data.
    -   `privateKey: string` - The private key to sign with.
    -   `network: string` - The network to use.
    -   `rpc: string | undefined` - The RPC endpoint.
    -   `uuid?: string` - (optional) The UUID for sending transfer out in solana network, will automatically generate if not provided.

-   **Returns**:
    -   `Promise<ResponseTransferOut> | Promise<ResponseSolana>` - The response of the transfer out, including confirmed transaction hash and uuid if in solana network.

##### `transferOutConfirmByPrivateKey`

Confirms a transfer out using a private key.

-   **Parameters**:

    -   `preBusiness: PreBusiness` - The pre-business data.
    -   `privateKey: string` - The private key to sign with.
    -   `network: string` - The network to use.
    -   `rpc: string | undefined` - The RPC endpoint.
    -   `uuid?: string` - (optional) The UUID for confirm transfer out in solana network, should be the same with the one used in `transferOutByPrivateKey` in one swap set.

-   **Returns**:
    -   `Promise<ContractTransactionResponse | Promise<ResponseSolana>` - The response of the transfer out confirmation, including confirmed transaction hash.

##### `transferInConfirmByPrivateKey`

Confirms a transfer in using a private key.

-   **Parameters**:

    -   `preBusiness: PreBusiness` - The pre-business data.
    -   `privateKey: string` - The private key to sign with.
    -   `network: string` - The network to use.
    -   `rpc: string | undefined` - The RPC endpoint.
    -   `sender: string` - The sender address.
    -   `uuid?: string` - (optional) The UUID for confirm transfer in in solana network, should be the same with the one used in `transfer in` in one swap set.

-   **Returns**:
    -   `Promise<ContractTransactionResponse | Promise<ResponseSolana>` - The response of the transfer in confirmation, including confirmed transaction hash.

##### `transferOutRefundByPrivateKey`

Refunds a transfer out using a private key.

-   **Parameters**:

    -   `preBusiness: PreBusiness` - The pre-business data.
    -   `privateKey: string` - The private key to sign with.
    -   `network: string` - The network to use.
    -   `rpc: string | undefined` - The RPC endpoint.
    -   `uuid?: string` - (optional) The UUID for refund transfer out in solana network, should be the same with the one used in `transferOutByPrivateKey` in one swap set.

-   **Returns**:
    -   `Promise<ContractTransactionResponse | Promise<ResponseSolana>` - The response of the transfer in confirmation, including confirmed transaction hash.

##### `complainByPrivateKey`

Submits a complaint using a private key.

-   **Parameters**:

    -   `preBusiness: PreBusiness` - The pre-business data.
    -   `privateKey: string` - The private key to sign with.
    -   `network: string` - The network to use.

-   **Returns**:
    -   `Promise<string | boolean>` - The true if submit successfully or error message if failed.

#### `evm`

The `evm` namespace provides methods to interact with the Ethereum Virtual Machine (EVM) based blockchain. It allows you to sign, send, confirm and refund assets with private key or from browser extension wallet.

##### Functions

##### `getComplainSignData`

Retrieves the sign data for a complaint.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `network: string` - The network to use.

**Returns:**

-   `Promise<EIP712TypedData>` - The EIP-712 typed data for the complaint.

##### `signComplainEIP712ByTermiPass`

Signs a complaint EIP-712 data using TermiPass.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `termiPassAPI: any` - The termiPassAPI instance.
-   `network: string` - The network to use.

**Returns:**

-   `Promise<{ signData: SignData; signed: string }>` - signed data and signature.

##### `signComplainEIP712ByPrivateKey`

Signs a complaint EIP-712 data using private key.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `privateKey: string` - The private key to sign with.
-   `network: string` - The network to use.

**Returns:**

-   `Promise<{ signData: SignData; signed: string }>` - signed data and signature.

##### `getSignDataEIP712`

Retrieves the EIP-712 quote sign data.

**Parameters:**

-   `quote: Quote` - The quote data.
-   `network: string` - The network to use.
-   `amount: string` - The amount to sign.
-   `dstAmount: string` - The destination amount.
-   `dstNativeAmount: string` - The destination native amount.
-   `swapToNative: number` - The percentage of amount that be swapped to native token.
-   `receivingAddress: string` - The receiving address.
-   `stepTimeLock: number | undefined` - The step time lock.
-   `rpcSrc: string | undefined` - The source RPC endpoint.
-   `rpcDst: string | undefined` - The destination RPC endpoint.

**Returns:**

-   `Promise<EIP712TypedData>` - The EIP-712 typed data for the quote.

##### `signQuoteEIP712ByPrivateKey`

Signs a EIP-712 quote using private key.

**Parameters:**

-   `network: string` - The network to use.
-   `quote: Quote` - The quote data.
-   `privateKey: string` - The private key to sign with.
-   `amount: string` - The amount to sign.
-   `swapToNative: number` - The percentage of amount that be swapped to native token.
-   `receivingAddress: string` - The receiving address.
-   `stepTimeLock: number | undefined` - The step time lock.
-   `rpcSrc: string | undefined` - The source RPC endpoint.
-   `rpcDst: string | undefined` - The destination RPC endpoint.

**Returns:**

-   `Promise<{ signData: SignData; signed: string }>` - The signed data and signature.

##### `signQuoteEIP712ByMetamaskAPI`

Signs a EIP-712 quote using Metamask API.

**Parameters:**

-   `network: string` - The network to use.
-   `quote: Quote` - The quote data.
-   `metamaskAPI: any` - The Metamask API instance.
-   `sender: string` - The sender address.
-   `amount: string` - The amount to sign.
-   `swapToNative: number` - The percentage of amount that be swapped to native token.
-   `receivingAddress: string` - The receiving address.
-   `stepTimeLock: number | undefined` - The step time lock.
-   `rpcSrc: string | undefined` - The source RPC endpoint.
-   `rpcDst: string | undefined` - The destination RPC endpoint.

**Returns:**

-   `Promise<{ signData: SignData; signed: string }>` - The signed data and signature.

##### `transferOutByPrivateKey`

Transfers out using a private key.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `privateKey: string` - The private key to sign with.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.

**Returns:**

-   `Promise<ResponseTransferOut>` - The response of the transfer out.

##### `transferOutByMetamaskAPI`

Transfers out using Metamask API.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `metamaskAPI: any` - The Metamask API instance.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.

**Returns:**

-   `Promise<ResponseTransferOut>` - The response of the transfer out.

##### `transferOutConfirmByPrivateKey`

Confirms a transfer out using a private key.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `privateKey: string` - The private key to sign with.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.

**Returns:**

-   `Promise<ContractTransactionResponse>` - The response of the transfer out confirmation.

##### `transferOutConfirmByMetamaskAPI`

Confirms a transfer out using Metamask API.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `metamaskAPI: any` - The Metamask API instance.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.

**Returns:**

-   `Promise<ContractTransactionResponse>` - The response of the transfer out confirmation.

##### `transferOutRefundByPrivateKey`

Refunds a transfer out using a private key.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `privateKey: string` - The private key to sign with.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.

**Returns:**

-   `Promise<ContractTransactionResponse>` - The response of the transfer out refund.

##### `transferOutRefundByMetamaskAPI`

Refunds a transfer out using Metamask API.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `metamaskAPI: any` - The Metamask API instance.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.

**Returns:**

-   `Promise<ContractTransactionResponse>` - The response of the transfer out refund.

##### `transferInConfirmByPrivateKey`

Confirms a transfer in using a private key.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `privateKey: string` - The private key to sign with.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.
-   `sender: string` - The sender address.

**Returns:**

-   `Promise<ContractTransactionResponse>` - The response of the transfer in confirmation.

##### `transferInConfirmByMetamaskAPI`

Confirms a transfer in using Metamask API.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `metamaskAPI: any` - The Metamask API instance.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.
-   `sender: string` - The sender address.

**Returns:**

-   `Promise<ContractTransactionResponse>` - The response of the transfer in confirmation.

#### `solana`

The `solana` namespace provides methods to interact with the solana blockchain. It allows you to sign, send, confirm and refund assets with private key or from browser extension wallet.

##### Functions

##### `getSignData`

Retrieves the sign data for a given quote.

**Parameters:**

-   `quote: Quote` - The quote data.
-   `network: string` - The network to use.
-   `amount: string` - The amount to sign.
-   `dstAmount: string` - The destination amount.
-   `dstNativeAmount: string` - The destination native amount.
-   `swapToNative: number` - The percentage of amount that be swapped to native token.
-   `receivingAddress: string` - The receiving address.
-   `stepTimeLock: number | undefined` - The step time lock.
-   `rpcSrc: string | undefined` - The source RPC endpoint.
-   `rpcDst: string | undefined` - The destination RPC endpoint.

**Returns:**

-   `Promise<{ message: SignData }>` - The sign data for the quote.

##### `signQuoteByPrivateKey`

Signs a quote using a private key.

**Parameters:**

-   `quote: Quote` - The quote data.
-   `privateKey: string` - The private key to sign with.
-   `network: string` - The network to use.
-   `amount: string` - The amount to sign.
-   `swapToNative: number` - The percentage of amount that be swapped to native token.
-   `receivingAddress: string` - The receiving address.
-   `stepTimeLock: number | undefined` - The step time lock.
-   `rpcSrc: string | undefined` - The source RPC endpoint.
-   `rpcDst: string | undefined` - The destination RPC endpoint.

**Returns:**

-   `Promise<{ signData: SignData; signed: string }>` - The signed data and signature.

##### `signQuoteByWalletPlugin`

Signs a quote using a wallet plugin.

**Parameters:**

-   `quote: Quote` - The quote data.
-   `phantomAPI: any` - The phantom wallet plugin instance.
-   `sender: string` - The sender address.
-   `network: string` - The network to use.
-   `amount: string` - The amount to sign.
-   `swapToNative: number` - The percentage of amount that be swapped to native token.
-   `receivingAddress: string` - The receiving address.
-   `stepTimeLock: number | undefined` - The step time lock.
-   `rpcSrc: string | undefined` - The source RPC endpoint.
-   `rpcDst: string | undefined` - The destination RPC endpoint.

**Returns:**

-   `Promise<{ signData: any; signed: string }>` - The signed data and signature.

##### `transferOutByPrivateKey`

Transfers out using a private key.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `privateKey: string` - The private key to sign with.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.
-   `uuid?: string` - (optional) The UUID for sending transfer out in solana network, will automatically generate if not provided.

**Returns:**

-   `Promise<ResponseSolana>` - The response of the transfer out.

##### `transferOutByWalletPlugin`

Transfers out using a wallet plugin.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `phantomAPI: any` - The phantom wallet plugin instance.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.
-   `uuid?: string` - (optional) The UUID for sending transfer out in solana network, will automatically generate if not provided.

**Returns:**

-   `Promise<ResponseSolana>` - The response of the transfer out.

##### `transferOutConfirmByPrivateKey`

Confirms a transfer out using a private key.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `privateKey: string` - The private key to sign with.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.
-   `uuid?: string` - (optional) The UUID for confirm transfer out in solana network, should be the same with the one used in `transferOutByPrivateKey` in one swap set.

**Returns:**

-   `Promise<ResponseSolana>` - The response of the transfer out confirmation.

##### `transferOutConfirmByWalletPlugin`

Confirms a transfer out using a wallet plugin.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `phantomAPI: any` - The phantom wallet plugin instance.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.

**Returns:**

-   `Promise<ResponseSolana>` - The response of the transfer out confirmation.

##### `transferOutRefundByPrivateKey`

Refunds a transfer out using a private key.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `privateKey: string` - The private key to sign with.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.
-   `uuid?: string` - (optional) The UUID for refund transfer out in solana network, should be the same with the one used in `transferOutByPrivateKey` in one swap set.

**Returns:**

-   `Promise<ResponseSolana>` - The response of the transfer out refund.

##### `transferOutRefundByWalletPlugin`

Refunds a transfer out using a wallet plugin.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `phantomAPI: any` - The phantom wallet plugin instance.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.

**Returns:**

-   `Promise<ResponseSolana>` - The response of the transfer out refund.

##### `transferInConfirmByPrivateKey`

Confirms a transfer in using a private key.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `privateKey: string` - The private key to sign with.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.
-   `sender: string` - The sender address.
-   `uuid?: string` - (optional) The UUID for confirm transfer in in solana network, should be the same with the one used in `transfer in` in one swap set.

**Returns:**

-   `Promise<ResponseSolana>` - The response of the transfer in confirmation.

##### `transferInConfirmByWalletPlugin`

Confirms a transfer in using a wallet plugin.

**Parameters:**

-   `preBusiness: PreBusiness` - The pre-business data.
-   `phantomAPI: any` - The phantom wallet plugin instance.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.
-   `sender: string` - The sender address.

**Returns:**

-   `Promise<ResponseSolana>` - The response of the transfer in confirmation.

#### `utils`

The `utils` namespace provides utility functions for interacting with the Otmoic platform.

##### Functions

##### `GetChainName`

Retrieves the name of a blockchain chain.

**Parameters:**

-   `systemChainId: number` - The ID of the chain.

**Returns:**

-   `string` - The name of the chain.

##### `GetNativeTokenName`

Retrieves the name of the native token for a blockchain chain.

**Parameters:**

-   `systemChainId: number` - The ID of the chain.

**Returns:**

-   `string` - The name of the native token.

##### `GetChainId`

Retrieves the chain ID for a given system chain id and network type.

**Parameters:**

-   `systemChainId: string` - The system chain id.
-   `network: string` - The network to use.

**Returns:**

-   `number` - The chain ID.

##### `Sleep`

Pauses execution for a specified duration.

**Parameters:**

-   `ms: number` - The duration to pause in milliseconds.

**Returns:**

-   `Promise<void>` - A promise that resolves after the specified duration.

##### `MathReceived`

Calculates the received amount after applying fees.

**Parameters:**

-   `quote: Quote` - The quote data.
-   `amount: string` - The initial amount.
-   `swapToNative: number` - The percentage of amount that be swapped to native token.

**Returns:**

-   `Promise<{ dstAmount: string; dstNativeAmount: string }>` - The received amount and native amount.

##### `GetChainType`

Retrieves the name of a blockchain chain.

**Parameters:**

-   `systemChainId: number` - The ID of the chain.

**Returns:**

-   `string` - The name of the chain.

##### `EvmDecimals`

Retrieves the decimals for an EVM token.

**Parameters:**

-   `system_chain_id: number` - The system chain ID.
-   `token_address: string` - The token address.
-   `rpc: string` - The RPC endpoint.

**Returns:**

-   `Promise<number>` - The decimals of the token.

##### `SolanaDecimals`

Retrieves the decimals for a Solana token.

**Parameters:**

-   `system_chain_id: number` - The system chain ID.
-   `token_address: string` - The token address.
-   `rpc: string` - The RPC endpoint.

**Returns:**

-   `Promise<number>` - The decimals of the token.

##### `Decimals`

Retrieves the decimals for a token based on the system chain ID.

**Parameters:**

-   `system_chain_id: number` - The system chain ID.
-   `token_address: string` - The token address.
-   `rpc: string` - The RPC endpoint.

**Returns:**

-   `Promise<number>` - The decimals of the token.

#### `assistive`

##### Functions

##### `TranslateBridge`

Translates bridge data.

**Parameters:**

-   `bridges: Bridge[]` - The array of bridge data.
-   `network: string` - The network to use.
-   `rpcs: Record<string, string>` - The RPC endpoints.

**Returns:**

-   `Promise<TranslatedBridge[]>` - The translated bridge data.

##### `GetBalance`

Retrieves the balance of a given address.

**Parameters:**

-   `bridge: Bridge` - The bridge data.
-   `address: string` - The address to retrieve the balance for.
-   `network: string` - The network to use.
-   `rpc: string | undefined` - The RPC endpoint.

**Returns:**

-   `Promise<string>` - The balance of the address.

## Contributing

We welcome contributions to the Otmoic Software Development Kit (SDK)! To contribute, please follow these steps:

### Getting Started

1. **Fork the repository**: Click the "Fork" button at the top right of this repository to create a copy in your GitHub account.
2. **Clone your fork**: Clone your forked repository to your local machine.
    ```sh
    git clone https://github.com/your-username/otmoic-software-development-kit.git
    cd otmoic-software-development-kit
    ```
3. **Install dependencies**: Install the required dependencies using npm.
    ```sh
    npm install
    ```

### Making Changes

1. **Create a new branch**: Create a new branch for your changes.
    ```sh
    git checkout -b my-feature-branch
    ```
2. **Make your changes**: Make your changes to the codebase.
3. **Commit your changes**: Commit your changes with a descriptive message.
    ```sh
    git add .
    git commit -m "Description of my changes"
    ```

### Code Style

Please follow the existing code style and conventions. Use Prettier for code formatting:

```sh
npm run format
```

### Submitting Changes

1. **Push to your fork**: Push your changes to your forked repository.
    ```sh
    git push origin my-feature-branch
    ```
2. **Create a pull request**: Go to the original repository and create a pull request from your forked repository. Provide a clear description of your changes.

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE.txt) file for more details.
