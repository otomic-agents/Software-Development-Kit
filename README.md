# Otmoic Software Development Kit

The Otmoic Software Development Kit (otmoic-sdk) allows developers to perform cross-chain transactions and exchanges on the Otmoic platform. This SDK provides a comprehensive set of tools and utilities to interact with various blockchain networks, including Ethereum and Solana. It simplifies the process of querying balances, fetching swap histories, and executing swaps across different chains etc.

This SDK is designed to be easy to use, with clear documentation and examples to help you get started quickly.

## Usage

To use the otmoic-sdk, follow these steps:

1. **Install the SDK**:

    ```sh
    npm install --save otmoic-sdk
    ```

2. **Import the SDK**:

    ```ts
    import { Relay } from 'otmoic-sdk';

    const RELA_URL = 'https://relay-1.mainnet.otmoic.cloud';
    const relay = new Relay(RELA_URL);
    ```

### Examples

#### Fetching Balance

To fetch the balance of a specific address, you can use the `GetBalance` function from the `assistive` namespace. Below is an example:

```ts
import { Bridge, assistive } from 'otmoic-sdk';

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

For more detailed usage and additional examples, refer to the example folder in the [otmoic-sdk](https://github.com/otmoic/Software-Development-Kit) repository.

## API Reference

### Classes

#### `Relay`

Main class for interacting with the Otmoic relay service. Provides functionality for bridge operations, quote management, and transaction tracking.

##### Constructor

```typescript
constructor(relay: string)
```

Creates a new Relay instance.

-   **Parameters**:
    -   `relay` (string): The URL of the relay service
-   **Throws**: Error if relay parameter is undefined

##### Methods

###### **getBridge**

```typescript
getBridge(): Promise<Bridge[]>
```

Retrieves all available bridges from the relay service.

-   **Returns**:
    -   `Promise<Bridge[]>`: Array of available bridge configurations

###### **ask**

```typescript
ask(askIF: AskIF, callback: OnQuoteIF): void
```

Initiates a quote request for a swap operation with continuous updates.

-   **Parameters**:
    -   `askIF` (AskIF): Quote request parameters including:
        -   `bridge`: Bridge configuration
        -   `amount`: Amount to swap
        -   `swapToNative`: Percentage to swap to native token
    -   `callback` (OnQuoteIF): Callback functions for quote responses:
        -   `onQuote`: Handler for quote updates
-   **Returns**: void

###### **stopAsk**

```typescript
stopAsk(): void
```

Terminates the current quote request and stops receiving updates.

-   **Returns**: void

###### **swap**

```typescript
swap(quote: Quote, signData: SignData, signed: string): Promise<PreBusiness>
```

Executes a swap operation with a signed quote.

-   **Parameters**:
    -   `quote` (Quote): The quote data for the swap
    -   `signData` (SignData): The signed data object
    -   `signed` (string): The signature
-   **Returns**:
    -   `Promise<PreBusiness>`: Pre-business data for the swap

###### **getHistory**

```typescript
getHistory(address: string): Promise<BusinessFullData[]>
```

Retrieves swap history for a given address.

-   **Parameters**:
    -   `address` (string): The wallet address to query
-   **Returns**:
    -   `Promise<BusinessFullData[]>`: Array of detailed business history

###### **getBusiness**

```typescript
getBusiness(hash: string): Promise<Business>
```

Gets business details by transaction hash.

-   **Parameters**:
    -   `hash` (string): Transaction hash
-   **Returns**:
    -   `Promise<Business>`: Business transaction details

###### **getBusinessFull**

```typescript
getBusinessFull(hash: string): Promise<BusinessFullData>
```

Gets detailed business information by transaction hash.

-   **Parameters**:
    -   `hash` (string): Transaction hash
-   **Returns**:
    -   `Promise<BusinessFullData>`: Detailed business transaction data

### Namespaces

#### `utils`

Collection of utility functions for chain operations and calculations.

##### **GetChainName**

```typescript
GetChainName(systemChainId: number): string
```

Converts a system chain ID to its human-readable name.

-   **Parameters**:
    -   `systemChainId` (number): The system chain ID
-   **Returns**:
    -   `string`: Human-readable chain name (e.g., "Ethereum", "Solana")

##### **GetNativeTokenName**

```typescript
GetNativeTokenName(systemChainId: number): string
```

Retrieves the native token name for a given blockchain.

-   **Parameters**:
    -   `systemChainId` (number): The system chain ID
-   **Returns**:
    -   `string`: Native token name (e.g., "ETH", "SOL")

##### **GetChainId**

```typescript
GetChainId(systemChainId: string, network: string): number
```

Converts a system chain ID to the network-specific chain ID.

-   **Parameters**:
    -   `systemChainId` (string): The system chain ID
    -   `network` (string): Network type ('mainnet' or 'testnet')
-   **Returns**:
    -   `number`: Network-specific chain ID

##### **GetNativeTokenDecimals**

```typescript
GetNativeTokenDecimals(systemChainId: number): number
```

Retrieves the number of decimals for the native token of a chain.

-   **Parameters**:
    -   `systemChainId` (number): The system chain ID
-   **Returns**:
    -   `number`: Number of decimals for the native token

##### **Sleep**

```typescript
Sleep(ms: number): Promise<void>
```

Pauses execution for a specified duration.

-   **Parameters**:
    -   `ms` (number): Duration in milliseconds
-   **Returns**:
    -   `Promise<void>`: Resolves after the specified duration

##### **MathReceived**

```typescript
MathReceived(quote: Quote, amount: string, swapToNative: number): Promise<{ dstAmount: string; dstNativeAmount: string }>
```

Calculates the received amounts after a swap, considering fees and conversions.

-   **Parameters**:
    -   `quote` (Quote): The quote data
    -   `amount` (string): Amount to be swapped
    -   `swapToNative` (number): Percentage to swap to native token
-   **Returns**:
    -   `Promise<{ dstAmount: string; dstNativeAmount: string }>`: Object containing destination amounts

##### **GetChainType**

```typescript
GetChainType(systemChainId: number): string
```

Determines the type of blockchain (e.g., 'evm', 'solana') based on the system chain ID.

-   **Parameters**:
    -   `systemChainId` (number): The system chain ID
-   **Returns**:
    -   `string`: Type of blockchain

##### **GetTokenAddress**

```typescript
GetTokenAddress(systemChainId: number, token: string): string
```

Retrieves the standardized token address for a given chain.

-   **Parameters**:
    -   `systemChainId` (number): The system chain ID
    -   `token` (string): Token identifier
-   **Returns**:
    -   `string`: Standardized token address

##### **Decimals**

```typescript
Decimals(system_chain_id: number, token_address: string, rpc: string): Promise<number>
```

Retrieves the number of decimals for a token on any chain.

-   **Parameters**:
    -   `system_chain_id` (number): The system chain ID
    -   `token_address` (string): The token address
    -   `rpc` (string): The RPC endpoint
-   **Returns**:
    -   `Promise<number>`: Number of decimals for the token

##### **DecimalsDefaultRpc**

```typescript
DecimalsDefaultRpc(system_chain_id: number, token_address: string, network: string): Promise<number>
```

Retrieves the number of decimals for a token using the default RPC endpoint.

-   **Parameters**:
    -   `system_chain_id` (number): The system chain ID
    -   `token_address` (string): The token address
    -   `network` (string): Network type ('mainnet' or 'testnet')
-   **Returns**:
    -   `Promise<number>`: Number of decimals for the token

##### **EvmDecimals**

```typescript
EvmDecimals(system_chain_id: number, token_address: string, rpc: string): Promise<number>
```

Retrieves the number of decimals for a token on EVM chains.

-   **Parameters**:
    -   `system_chain_id` (number): The system chain ID
    -   `token_address` (string): The token address
    -   `rpc` (string): The RPC endpoint
-   **Returns**:
    -   `Promise<number>`: Number of decimals for the token

##### **EvmDecimalsDefaultRpc**

```typescript
EvmDecimalsDefaultRpc(system_chain_id: number, token_address: string, network: string): Promise<number>
```

Retrieves the number of decimals for a token on EVM chains using the default RPC endpoint.

-   **Parameters**:
    -   `system_chain_id` (number): The system chain ID
    -   `token_address` (string): The token address
    -   `network` (string): Network type ('mainnet' or 'testnet')
-   **Returns**:
    -   `Promise<number>`: Number of decimals for the token

##### **SolanaDecimals**

```typescript
SolanaDecimals(system_chain_id: number, token_address: string, rpc: string): Promise<number>
```

Retrieves the number of decimals for a token on Solana.

-   **Parameters**:
    -   `system_chain_id` (number): The system chain ID
    -   `token_address` (string): The token address
    -   `rpc` (string): The RPC endpoint
-   **Returns**:
    -   `Promise<number>`: Number of decimals for the token

##### **SolanaDecimalsDefaultRpc**

```typescript
SolanaDecimalsDefaultRpc(system_chain_id: number, token_address: string, network: string): Promise<number>
```

Retrieves the number of decimals for a token on Solana using the default RPC endpoint.

-   **Parameters**:
    -   `system_chain_id` (number): The system chain ID
    -   `token_address` (string): The token address
    -   `network` (string): Network type ('mainnet' or 'testnet')
-   **Returns**:
    -   `Promise<number>`: Number of decimals for the token

#### `evm`

Ethereum Virtual Machine related functions for handling transactions and signatures.

##### **getComplainSignData**

```typescript
getComplainSignData(preBusiness: PreBusiness): Promise<SignData>
```

Retrieves sign data for a complaint on EVM chains.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
-   **Returns**:
    -   `Promise<SignData>`: Sign data for the complaint

##### **signComplainEIP712ByTermiPass**

```typescript
signComplainEIP712ByTermiPass(preBusiness: PreBusiness, termiPass: any, network: string): Promise<{ signData: SignData; signed: string }>
```

Signs complaint data using TermiPass.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `termiPass` (any): TermiPass instance
    -   `network` (string): Network type
-   **Returns**:
    -   `Promise<{ signData: SignData; signed: string }>`: Signed complaint data

##### **signComplainEIP712ByPrivateKey**

```typescript
signComplainEIP712ByPrivateKey(preBusiness: PreBusiness, privateKey: string, network: string): Promise<{ signData: SignData; signed: string }>
```

Signs complaint data using a private key.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `privateKey` (string): Private key for signing
    -   `network` (string): Network type
-   **Returns**:
    -   `Promise<{ signData: SignData; signed: string }>`: Signed complaint data

##### **getSignDataEIP712**

```typescript
getSignDataEIP712(quote: Quote, network: string, amount: string, dstAmount: string, dstNativeAmount: string, swapToNative: number, receivingAddress: string, expectedSingleStepTime?: number, tolerantSingleStepTime?: number, earliestRefundTime?: number, rpcSrc?: string, rpcDst?: string): Promise<SignData>
```

Retrieves EIP-712 sign data for a quote.

-   **Parameters**:
    -   `quote` (Quote): Quote data
    -   `network` (string): Network type
    -   `amount` (string): Amount to be swapped
    -   `dstAmount` (string): Destination amount
    -   `dstNativeAmount` (string): Destination native amount
    -   `swapToNative` (number): Percentage to swap to native token
    -   `receivingAddress` (string): Receiving address
    -   `expectedSingleStepTime` (number, optional): Expected time for a single step
    -   `tolerantSingleStepTime` (number, optional): Tolerant time for a single step
    -   `earliestRefundTime` (number, optional): Earliest refund time
    -   `rpcSrc` (string, optional): Source RPC endpoint
    -   `rpcDst` (string, optional): Destination RPC endpoint
-   **Returns**:
    -   `Promise<SignData>`: EIP-712 sign data

##### **isNeedApprove**

```typescript
isNeedApprove(quote: Quote, network: string, sender: string, rpc?: string): Promise<boolean>
```

Checks if an approval is needed for a token transfer.

-   **Parameters**:
    -   `quote` (Quote): Quote data
    -   `network` (string): Network type
    -   `sender` (string): Sender address
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<boolean>`: True if approval is needed, false otherwise

##### **getApproveTransfer**

```typescript
getApproveTransfer(quote: Quote, network: string, sender: string, rpc?: string): Promise<ContractTransactionResponse>
```

Constructs a raw transaction for approving a token transfer on the blockchain.

-   **Parameters**:
    -   `quote` (Quote): Quote data
    -   `network` (string): Network type
    -   `sender` (string): Sender address
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ContractTransactionResponse>`: Raw transaction data for the approval

##### **getTransferOutTransfer**

```typescript
getTransferOutTransfer(preBusiness: PreBusiness, network: string, sender: string, rpc?: string): Promise<ContractTransactionResponse>
```

Constructs a raw transaction for initiating a transfer out operation on the blockchain.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `network` (string): Network type
    -   `sender` (string): Sender address
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ContractTransactionResponse>`: Raw transaction data for the transfer out

##### **getTransferOutConfirmTransfer**

```typescript
getTransferOutConfirmTransfer(preBusiness: PreBusiness, network: string, sender: string, rpc?: string): Promise<ContractTransactionResponse>
```

Constructs a raw transaction for confirming a transfer out on the blockchain.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `network` (string): Network type
    -   `sender` (string): Sender address
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ContractTransactionResponse>`: Raw transaction data for the confirmation

##### **getTransferOutRefundTransfer**

```typescript
getTransferOutRefundTransfer(preBusiness: PreBusiness, network: string, sender: string, rpc?: string): Promise<ContractTransactionResponse>
```

Constructs a raw transaction for refunding a transfer out on the blockchain.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `network` (string): Network type
    -   `sender` (string): Sender address
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ContractTransactionResponse>`: Raw transaction data for the refund

##### **getTransferInConfirmTransfer**

```typescript
getTransferInConfirmTransfer(preBusiness: PreBusiness, network: string, sender: string, rpc?: string): Promise<ContractTransactionResponse>
```

Constructs a raw transaction for confirming a transfer in on the blockchain.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `network` (string): Network type
    -   `sender` (string): Sender address
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ContractTransactionResponse>`: Raw transaction data for the confirmation

##### **getGasPrice**

```typescript
getGasPrice(network: string, rpc?: string): Promise<string>
```

Retrieves the current gas price for a network.

-   **Parameters**:
    -   `network` (string): Network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<string>`: Current gas price

##### **getOnChainGasPrice**

```typescript
getOnChainGasPrice(network: string, rpc?: string): Promise<string>
```

Retrieves the on-chain gas price for a network.

-   **Parameters**:
    -   `network` (string): Network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<string>`: On-chain gas price

##### **signQuoteEIP712ByPrivateKey**

```typescript
signQuoteEIP712ByPrivateKey(quote: Quote, privateKey: string, network: string, amount: string, swapToNative: number, receivingAddress: string, expectedSingleStepTime?: number, tolerantSingleStepTime?: number, earliestRefundTime?: number, rpcSrc?: string, rpcDst?: string): Promise<{ signData: SignData; signed: string }>
```

Signs a quote using EIP-712 standard with a private key.

-   **Parameters**:
    -   `quote` (Quote): The quote data to be signed
    -   `privateKey` (string): The private key for signing
    -   `network` (string): The network type
    -   `amount` (string): The amount to be swapped
    -   `swapToNative` (number): Percentage to swap to native token
    -   `receivingAddress` (string): The address to receive the swapped tokens
    -   `expectedSingleStepTime` (number, optional): Expected time for a single step
    -   `tolerantSingleStepTime` (number, optional): Tolerant time for a single step
    -   `earliestRefundTime` (number, optional): Earliest refund time
    -   `rpcSrc` (string, optional): Source RPC endpoint
    -   `rpcDst` (string, optional): Destination RPC endpoint
-   **Returns**:
    -   `Promise<{ signData: SignData; signed: string }>`: The signed data and signature

##### **signQuoteEIP712ByMetamaskAPI**

```typescript
signQuoteEIP712ByMetamaskAPI(quote: Quote, metamaskAPI: any, network: string, sender: string, amount: string, swapToNative: number, receivingAddress: string, expectedSingleStepTime?: number, tolerantSingleStepTime?: number, earliestRefundTime?: number, rpcSrc?: string, rpcDst?: string): Promise<{ signData: SignData; signed: string }>
```

Signs a quote using EIP-712 standard with Metamask API.

-   **Parameters**:
    -   `quote` (Quote): The quote data to be signed
    -   `metamaskAPI` (any): The Metamask API instance
    -   `network` (string): The network type
    -   `sender` (string): The sender address
    -   `amount` (string): The amount to be swapped
    -   `swapToNative` (number): Percentage to swap to native token
    -   `receivingAddress` (string): The address to receive the swapped tokens
    -   `expectedSingleStepTime` (number, optional): Expected time for a single step
    -   `tolerantSingleStepTime` (number, optional): Tolerant time for a single step
    -   `earliestRefundTime` (number, optional): Earliest refund time
    -   `rpcSrc` (string, optional): Source RPC endpoint
    -   `rpcDst` (string, optional): Destination RPC endpoint
-   **Returns**:
    -   `Promise<{ signData: SignData; signed: string }>`: The signed data and signature

##### **transferOutByPrivateKey**

```typescript
transferOutByPrivateKey(preBusiness: PreBusiness, privateKey: string, network: string, rpc?: string): Promise<ResponseTransferOut>
```

Initiates a transfer out operation using a private key.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `privateKey` (string): The private key for signing
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ResponseTransferOut>`: Response of the transfer out operation

##### **transferOutByMetamaskAPI**

```typescript
transferOutByMetamaskAPI(preBusiness: PreBusiness, metamaskAPI: any, network: string, rpc?: string): Promise<ResponseTransferOut>
```

Initiates a transfer out operation using Metamask API.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `metamaskAPI` (any): The Metamask API instance
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ResponseTransferOut>`: Response of the transfer out operation

##### **transferOutConfirmByPrivateKey**

```typescript
transferOutConfirmByPrivateKey(preBusiness: PreBusiness, privateKey: string, network: string, rpc?: string): Promise<ContractTransactionResponse>
```

Confirms a transfer out operation using a private key.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `privateKey` (string): The private key for signing
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ContractTransactionResponse>`: Response of the transfer out confirmation

##### **transferOutConfirmByMetamaskAPI**

```typescript
transferOutConfirmByMetamaskAPI(preBusiness: PreBusiness, metamaskAPI: any, network: string, rpc?: string): Promise<ContractTransactionResponse>
```

Confirms a transfer out operation using Metamask API.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `metamaskAPI` (any): The Metamask API instance
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ContractTransactionResponse>`: Response of the transfer out confirmation

##### **transferOutRefundByPrivateKey**

```typescript
transferOutRefundByPrivateKey(preBusiness: PreBusiness, privateKey: string, network: string, rpc?: string): Promise<ContractTransactionResponse>
```

Refunds a transfer out operation using a private key.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `privateKey` (string): The private key for signing
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ContractTransactionResponse>`: Response of the transfer out refund

##### **transferOutRefundByMetamaskAPI**

```typescript
transferOutRefundByMetamaskAPI(preBusiness: PreBusiness, metamaskAPI: any, network: string, rpc?: string): Promise<ContractTransactionResponse>
```

Refunds a transfer out operation using Metamask API.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `metamaskAPI` (any): The Metamask API instance
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ContractTransactionResponse>`: Response of the transfer out refund

##### **transferInConfirmByPrivateKey**

```typescript
transferInConfirmByPrivateKey(preBusiness: PreBusiness, privateKey: string, network: string, rpc?: string, sender: string): Promise<ContractTransactionResponse>
```

Confirms a transfer in operation using a private key.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `privateKey` (string): The private key for signing
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
    -   `sender` (string): The sender address
-   **Returns**:
    -   `Promise<ContractTransactionResponse>`: Response of the transfer in confirmation

##### **transferInConfirmByMetamaskAPI**

```typescript
transferInConfirmByMetamaskAPI(preBusiness: PreBusiness, metamaskAPI: any, network: string, rpc?: string, sender: string): Promise<ContractTransactionResponse>
```

Confirms a transfer in operation using Metamask API.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `metamaskAPI` (any): The Metamask API instance
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
    -   `sender` (string): The sender address
-   **Returns**:
    -   `Promise<ContractTransactionResponse>`: Response of the transfer in confirmation

#### `solana`

Solana related functions for handling transactions and signatures on the Solana blockchain.

##### **getSignData**

```typescript
getSignData(quote: Quote, network: string, amount: string, swapToNative: number, receivingAddress: string): Promise<SignData>
```

Retrieves sign data for a quote on Solana.

-   **Parameters**:
    -   `quote` (Quote): The quote data
    -   `network` (string): The network type
    -   `amount` (string): The amount to be swapped
    -   `swapToNative` (number): Percentage to swap to native token
    -   `receivingAddress` (string): The address to receive the swapped tokens
-   **Returns**:
    -   `Promise<SignData>`: Sign data for the quote

##### **getSignPreamble**

```typescript
getSignPreamble(quote: Quote, network: string, amount: string, swapToNative: number, receivingAddress: string): string
```

Constructs the preamble for signing a quote on Solana.

-   **Parameters**:
    -   `quote` (Quote): The quote data
    -   `network` (string): The network type
    -   `amount` (string): The amount to be swapped
    -   `swapToNative` (number): Percentage to swap to native token
    -   `receivingAddress` (string): The address to receive the swapped tokens
-   **Returns**:
    -   `string`: The preamble string for signing

##### **signQuoteByPrivateKey**

```typescript
signQuoteByPrivateKey(network: string, quote: Quote, privateKey: string, amount: string, swapToNative: number, receivingAddress: string, expectedSingleStepTime?: number, tolerantSingleStepTime?: number, earliestRefundTime?: number, rpcSrc?: string, rpcDst?: string): Promise<{ signData: SignData; signed: string }>
```

Signs a quote using a private key on Solana.

-   **Parameters**:
    -   `network` (string): The network type
    -   `quote` (Quote): The quote data to be signed
    -   `privateKey` (string): The private key for signing
    -   `amount` (string): The amount to be swapped
    -   `swapToNative` (number): Percentage to swap to native token
    -   `receivingAddress` (string): The address to receive the swapped tokens
    -   `expectedSingleStepTime` (number, optional): Expected time for a single step
    -   `tolerantSingleStepTime` (number, optional): Tolerant time for a single step
    -   `earliestRefundTime` (number, optional): Earliest refund time
    -   `rpcSrc` (string, optional): Source RPC endpoint
    -   `rpcDst` (string, optional): Destination RPC endpoint
-   **Returns**:
    -   `Promise<{ signData: SignData; signed: string }>`: The signed data and signature

##### **signQuoteByWalletPlugin**

```typescript
signQuoteByWalletPlugin(network: string, quote: Quote, phantomAPI: any, sender: string, amount: string, swapToNative: number, receivingAddress: string, expectedSingleStepTime?: number, tolerantSingleStepTime?: number, earliestRefundTime?: number, rpcSrc?: string, rpcDst?: string): Promise<{ signData: SignData; signed: string }>
```

Signs a quote using a wallet plugin on Solana.

-   **Parameters**:
    -   `network` (string): The network type
    -   `quote` (Quote): The quote data to be signed
    -   `phantomAPI` (any): The wallet plugin instance
    -   `sender` (string): The sender address
    -   `amount` (string): The amount to be swapped
    -   `swapToNative` (number): Percentage to swap to native token
    -   `receivingAddress` (string): The address to receive the swapped tokens
    -   `expectedSingleStepTime` (number, optional): Expected time for a single step
    -   `tolerantSingleStepTime` (number, optional): Tolerant time for a single step
    -   `earliestRefundTime` (number, optional): Earliest refund time
    -   `rpcSrc` (string, optional): Source RPC endpoint
    -   `rpcDst` (string, optional): Destination RPC endpoint
-   **Returns**:
    -   `Promise<{ signData: SignData; signed: string }>`: The signed data and signature

##### **transferOutByPrivateKey**

```typescript
transferOutByPrivateKey(preBusiness: PreBusiness, privateKey: string, network: string, rpc?: string): Promise<ResponseSolana>
```

Initiates a transfer out operation using a private key on Solana.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `privateKey` (string): The private key for signing
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ResponseSolana>`: Response of the transfer out operation

##### **transferOutByWalletPlugin**

```typescript
transferOutByWalletPlugin(preBusiness: PreBusiness, phantomAPI: any, network: string, rpc?: string): Promise<ResponseSolana>
```

Initiates a transfer out operation using a wallet plugin on Solana.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `phantomAPI` (any): The wallet plugin instance
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ResponseSolana>`: Response of the transfer out operation

##### **transferOutConfirmByPrivateKey**

```typescript
transferOutConfirmByPrivateKey(preBusiness: PreBusiness, privateKey: string, network: string, rpc?: string): Promise<ResponseSolana>
```

Confirms a transfer out operation using a private key on Solana.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `privateKey` (string): The private key for signing
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ResponseSolana>`: Response of the transfer out confirmation

##### **transferOutConfirmByWalletPlugin**

```typescript
transferOutConfirmByWalletPlugin(preBusiness: PreBusiness, phantomAPI: any, network: string, rpc?: string): Promise<ResponseSolana>
```

Confirms a transfer out operation using a wallet plugin on Solana.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `phantomAPI` (any): The wallet plugin instance
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ResponseSolana>`: Response of the transfer out confirmation

##### **getTransferOutTransaction**

```typescript
getTransferOutTransaction(preBusiness: PreBusiness, provider: Connection | undefined, network: string, pluginProvider?: Provider): Promise<Transaction>
```

Constructs a transaction for initiating a transfer out operation on Solana.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `provider` (Connection | undefined): Solana connection provider
    -   `network` (string): The network type
    -   `pluginProvider` (Provider, optional): Plugin provider
-   **Returns**:
    -   `Promise<Transaction>`: Transaction data for the transfer out

##### **getTransferOutConfirmTransaction**

```typescript
getTransferOutConfirmTransaction(preBusiness: PreBusiness, provider: Connection | undefined, network: string, pluginProvider?: Provider): Promise<aTransactionny>
```

Constructs a transaction for confirming a transfer out operation on Solana.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `provider` (Connection | undefined): Solana connection provider
    -   `network` (string): The network type
    -   `pluginProvider` (Provider, optional): Plugin provider
-   **Returns**:
    -   `Promise<Transaction>`: Transaction data for the confirmation

##### **getTransferOutRefundTransaction**

```typescript
getTransferOutRefundTransaction(preBusiness: PreBusiness, provider: Connection | undefined, network: string, pluginProvider?: Provider): Promise<Transaction>
```

Constructs a transaction for refunding a transfer out operation on Solana.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `provider` (Connection | undefined): Solana connection provider
    -   `network` (string): The network type
    -   `pluginProvider` (Provider, optional): Plugin provider
-   **Returns**:
    -   `Promise<Transaction>`: Transaction data for the refund

##### **transferOutRefundByPrivateKey**

```typescript
transferOutRefundByPrivateKey(preBusiness: PreBusiness, privateKey: string, network: string, rpc?: string): Promise<ResponseSolana>
```

Refunds a transfer out operation using a private key on Solana.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `privateKey` (string): The private key for signing
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ResponseSolana>`: Response of the transfer out refund

##### **transferOutRefundByWalletPlugin**

```typescript
transferOutRefundByWalletPlugin(preBusiness: PreBusiness, phantomAPI: any, network: string, rpc?: string): Promise<ResponseSolana>
```

Refunds a transfer out operation using a wallet plugin on Solana.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `phantomAPI` (any): The wallet plugin instance
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ResponseSolana>`: Response of the transfer out refund

##### **transferInConfirmByPrivateKey**

```typescript
transferInConfirmByPrivateKey(preBusiness: PreBusiness, privateKey: string, network: string, rpc?: string, sender: string): Promise<ResponseSolana>
```

Confirms a transfer in operation using a private key on Solana.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `privateKey` (string): The private key for signing
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
    -   `sender` (string): The sender address
-   **Returns**:
    -   `Promise<ResponseSolana>`: Response of the transfer in confirmation

##### **transferInConfirmByWalletPlugin**

```typescript
transferInConfirmByWalletPlugin(preBusiness: PreBusiness, phantomAPI: any, network: string, rpc?: string, sender: string): Promise<ResponseSolana>
```

Confirms a transfer in operation using a wallet plugin on Solana.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `phantomAPI` (any): The wallet plugin instance
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
    -   `sender` (string): The sender address
-   **Returns**:
    -   `Promise<ResponseSolana>`: Response of the transfer in confirmation

#### `business`

The `business` namespace provides methods to interact with the Otmoic business service. It allows you to sign, send, confirm and refund assets, and submit complaints.

##### **signQuoteByPrivateKey**

```typescript
signQuoteByPrivateKey(
    network: string,
    quote: Quote,
    privateKey: string,
    amount: string,
    swapToNative: number,
    receivingAddress: string,
    expectedSingleStepTime?: number,
    tolerantSingleStepTime?: number,
    earliestRefundTime?: number,
    rpcSrc?: string,
    rpcDst?: string
): Promise<{ signData: SignData; signed: string }>
```

Signs a quote using a private key, supporting both EVM and Solana networks.

-   **Parameters**:
    -   `network` (string): The network type
    -   `quote` (Quote): The quote data to be signed
    -   `privateKey` (string): The private key for signing
    -   `amount` (string): The amount to be swapped
    -   `swapToNative` (number): Percentage to swap to native token
    -   `receivingAddress` (string): The address to receive the swapped tokens
    -   `expectedSingleStepTime` (number, optional): Expected time for a single step
    -   `tolerantSingleStepTime` (number, optional): Tolerant time for a single step
    -   `earliestRefundTime` (number, optional): Earliest refund time
    -   `rpcSrc` (string, optional): Source RPC endpoint
    -   `rpcDst` (string, optional): Destination RPC endpoint
-   **Returns**:
    -   `Promise<{ signData: SignData; signed: string }>`: The signed data and signature

##### **transferOutByPrivateKey**

```typescript
transferOutByPrivateKey(
    preBusiness: PreBusiness,
    privateKey: string,
    network: string,
    rpc?: string
): Promise<ResponseTransferOut | ResponseSolana>
```

Initiates a transfer out operation using a private key, supporting both EVM and Solana networks.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `privateKey` (string): The private key for signing
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ResponseTransferOut | ResponseSolana>`: Response of the transfer out operation

##### **transferOutConfirmByPrivateKey**

```typescript
transferOutConfirmByPrivateKey(
    preBusiness: PreBusiness,
    privateKey: string,
    network: string,
    rpc?: string
): Promise<ResponseTransferOut | ResponseSolana>
```

Confirms a transfer out operation using a private key, supporting both EVM and Solana networks.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `privateKey` (string): The private key for signing
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ResponseTransferOut | ResponseSolana>`: Response of the transfer out confirmation

##### **transferInConfirmByPrivateKey**

```typescript
transferInConfirmByPrivateKey(
    preBusiness: PreBusiness,
    privateKey: string,
    network: string,
    rpc?: string,
    sender: string
): Promise<ResponseTransferOut | ResponseSolana>
```

Confirms a transfer in operation using a private key, supporting both EVM and Solana networks.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `privateKey` (string): The private key for signing
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
    -   `sender` (string): The sender address
-   **Returns**:
    -   `Promise<ResponseTransferOut | ResponseSolana>`: Response of the transfer in confirmation

##### **transferOutRefundByPrivateKey**

```typescript
transferOutRefundByPrivateKey(
    preBusiness: PreBusiness,
    privateKey: string,
    network: string,
    rpc?: string
): Promise<ResponseTransferOut | ResponseSolana>
```

Refunds a transfer out operation using a private key, supporting both EVM and Solana networks.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `privateKey` (string): The private key for signing
    -   `network` (string): The network type
    -   `rpc` (string, optional): RPC endpoint
-   **Returns**:
    -   `Promise<ResponseTransferOut | ResponseSolana>`: Response of the transfer out refund

##### **complainByPrivateKey**

```typescript
complainByPrivateKey(
    preBusiness: PreBusiness,
    privateKey: string,
    network: string
): Promise<string>
```

Submits a complaint using a private key, supporting EVM networks.

-   **Parameters**:
    -   `preBusiness` (PreBusiness): Pre-business data
    -   `privateKey` (string): The private key for signing
    -   `network` (string): The network type
-   **Returns**:
    -   `Promise<string>`: Result of the complaint submission

#### `assistive`

The `assistive` namespace provides methods that used for auxiliary operations that support the main business logic.

##### **TranslateBridge**

```typescript
TranslateBridge(bridges: Bridge[], network: string, rpcs: { [key: string]: string }): Promise<TranslatedBridge[]>
```

Translates bridge data into a standardized format.

-   **Parameters**:
    -   `bridges` (Bridge[]): The raw bridge data to be translated
    -   `network` (string): The network type
    -   `rpcs` ({ [key: string]: string }): RPC endpoints
-   **Returns**:
    -   `Promise<TranslatedBridge[]>`: The translated bridge data

##### **GetBalance**

```typescript
GetBalance(address: string, network: string, tokenAddress: string): Promise<string>
```

Retrieves the balance of a specific token for a given address on a specified network.

-   **Parameters**:
    -   `address` (string): The address to check the balance for
    -   `network` (string): The network type
    -   `tokenAddress` (string): The address of the token
-   **Returns**:
    -   `Promise<string>`: The balance of the token

##### **GetBalanceEVM**

```typescript
GetBalanceEVM(address: string, network: string, tokenAddress: string): Promise<string>
```

Retrieves the balance of a specific token for a given address on an EVM network.

-   **Parameters**:
    -   `address` (string): The address to check the balance for
    -   `network` (string): The network type
    -   `tokenAddress` (string): The address of the token
-   **Returns**:
    -   `Promise<string>`: The balance of the token

##### **GetBalanceSOLANA**

```typescript
GetBalanceSOLANA(address: string, network: string, tokenAddress: string): Promise<string>
```

Retrieves the balance of a specific token for a given address on the Solana network.

-   **Parameters**:
    -   `address` (string): The address to check the balance for
    -   `network` (string): The network type
    -   `tokenAddress` (string): The address of the token
-   **Returns**:
    -   `Promise<string>`: The balance of the token

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
