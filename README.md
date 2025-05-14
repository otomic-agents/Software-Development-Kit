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
    import Otmoic from 'otmoic-sdk';

    const RELA_URL = 'https://relay-1.mainnet.otmoic.com';
    const relay = new Otmoic.Relay(RELA_URL);
    ```

### Examples

#### Fetching Balance

To fetch the balance of a specific address, you can use the `GetBalance` function from the `utils` namespace in otmoic-sdk. Below is an example:

```ts
import Otmoic, { Bridge, NetworkType } from '../src';

const bridge: Bridge = {
    bridge_id: 6,
    src_chain_id: 501,
    dst_chain_id: 9006,
    src_token: '0xd691ced994b9c641cf8f80b5f4dbdd80f0fd86af1b8604a702151fa7e46b7232',
    dst_token: '0xacda8bf66c2cadac9e99aa1aa75743f536e71094',
    bridge_name: undefined,
};

const NETWORK = NetworkType.TESTNET;

const ADDRESS = 'JA2Wc8SzDtKG9N72X1j6T6wPho7Pa4k4yhiVcZqoHmpf';

const GetBalance = async () => {
    const balance = await Otmoic.utils.GetBalance(bridge, ADDRESS, NETWORK, undefined);
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
getBridge(option: GetBridgesOption): Promise<Bridge[] | TranslatedBridge[]>
```

Retrieves all available bridges from the relay service.

-   **Parameters**:

    -   `option` ([GetBridgesOption](#getbridgesoption)): Options for fetching bridges

-   **Returns**:
    -   Promise<[Bridge](#bridge)[] | [TranslatedBridge](#translatedbridge)[]>: Array of bridges

###### **ask**

```typescript
ask(askIF: AskIF, callback: OnQuoteIF): void
```

Initiates a quote request for a swap operation with continuous updates.

-   **Parameters**:
    -   `askIF` ([AskIF](#askif)): Quote request parameters
    -   `callback` ([OnQuoteIF](#onquoteif)): Callback interface for quote responses
-   **Returns**: void

###### **stopAsk**

```typescript
stopAsk(): void
```

Terminates the current quote request and stops receiving updates.

-   **Returns**: void

###### **swap**

```typescript
swap(quote: Quote, signData: SwapSignData, signed: string): Promise<PreBusiness>
```

Executes a swap operation with a signed quote.

-   **Parameters**:
    -   `quote` ([Quote](#quote)): The quote data for the swap
    -   `signData` ([SwapSignData](#swapsigndata)): The signing data object
    -   `signed` (string): The signature
-   **Returns**:
    -   Promise<[PreBusiness](#prebusiness)>: Pre-business data for the swap

###### **getHistory**

```typescript
getHistory(address: string): Promise<BusinessFullData[]>
```

Retrieves swap history for a given address.

-   **Parameters**:
    -   `address` (string): The wallet address to query
-   **Returns**:
    -   Promise<[BusinessFullData](#businessfulldata)[]>: Array of detailed business history

###### **getBusiness**

```typescript
getBusiness(hash: string): Promise<Business>
```

Gets business details by transaction hash.

-   **Parameters**:
    -   `hash` (string): Transaction hash
    -   `options` ([GetBusinessOptions](#getbusinessoptions), optional): Options for fetching business details, if omitted, the [Business](#Business) type data will returned.
-   **Returns**:
    -   Promise<[Business](#Business) | [BusinessFullData](#businessfulldata)>: Business transaction details or full business data if detailed option is set

### Namespaces

#### `utils`

Collection of utility functions for chain operations and calculations.

##### **GetChainName**

```typescript
GetChainName(systemChainId: ChainId): string
```

Converts a system chain ID to its human-readable name.

-   **Parameters**:
    -   `systemChainId` ([ChainId](#chainid)): The system chain ID
-   **Returns**:
    -   `string`: Human-readable chain name (e.g., "ETH", "Solana")

##### **GetNativeTokenName**

```typescript
GetNativeTokenName(systemChainId: ChainId): string
```

Retrieves the native token name for a given blockchain.

-   **Parameters**:
    -   `systemChainId` ([ChainId](#chainid)): The system chain ID
-   **Returns**:
    -   `string`: Native token name (e.g., "ETH", "SOL")

##### **GetChainId**

```typescript
GetChainId(systemChainId: ChainId, network: NetworkType): number | undefined
```

Converts a system chain ID to the network-specific chain ID.

-   **Parameters**:
    -   `systemChainId` ([ChainId](#chainid)): The system chain ID
    -   `network` ([NetworkType](#networktype)): Network type ('mainnet' or 'testnet')
-   **Returns**:
    -   `number | undefined`: Network-specific chain ID

##### **GetNativeTokenDecimals**

```typescript
GetNativeTokenDecimals(systemChainId: ChainId): number
```

Retrieves the number of decimals for the native token of a chain.

-   **Parameters**:
    -   `systemChainId` ([ChainId](#chainid)): The system chain ID
-   **Returns**:
    -   `number`: Number of decimals for the native token

##### **GetTokenDecimals**

```typescript
GetTokenDecimals(systemChainId: ChainId, tokenAddress: string, network: NetworkType, rpc: string | undefined): Promise<number>
```

Retrieves the number of decimals for a token on any chain.

-   **Parameters**:
    -   `systemChainId` ([ChainId](#chainid)): The system chain ID
    -   `tokenAddress` (string): The token address
    -   `network` ([NetworkType](#networktype)): Network type ('mainnet' or 'testnet')
    -   `rpc` (string | undefined): The RPC endpoint, if omitted, the default will be provided
-   **Returns**:
    -   `Promise<number>`: Number of decimals for the token

##### **GetChainType**

```typescript
GetChainType(systemChainId: ChainId): string
```

Determines the type of blockchain (e.g., 'evm', 'solana') based on the system chain ID.

-   **Parameters**:
    -   `systemChainId` ([ChainId](#chainid)): The system chain ID
-   **Returns**:
    -   `string`: Type of blockchain

##### **MathReceived**

```typescript
MathReceived(quote: Quote, amount: string, swapToNative: number): DstAmountSet
```

Calculates the received token amounts and native token amounts, considering fees and percentage swapping to native token.

-   **Parameters**:
    -   `quote` ([Quote](#quote)): The quote data
    -   `amount` (string): Amount to be swapped
    -   `swapToNative` (number): Percentage to swap to native token
-   **Returns**:
    -   `DstAmountSet` ([DstAmountSet](#dstamountset)): Object containing destination amounts

##### **GetTokenAddress**

```typescript
GetTokenAddress(contractAddress: string, systemChainId: ChainId): string
```

Retrieves the standardized token address (Hex string) for a given chain.

-   **Parameters**:
    -   `contractAddress` (string): The contract address
    -   `systemChainId` ([ChainId](#chainid)): The system chain ID
-   **Returns**:
    -   `string`: Standardized token address (Hex string)

##### **Sleep**

```typescript
Sleep(ms: number): Promise<void>
```

Pauses execution for a specified duration.

-   **Parameters**:
    -   `ms` (number): Duration in milliseconds
-   **Returns**:
    -   `Promise<void>`: Resolves after the specified duration

##### **IsNeedApprove**

```typescript
IsNeedApprove(preBusiness: PreBusiness, userWallet: string, rpc?: string, network: NetworkType): Promise<boolean>
```

Checks if an approval is needed for a evm token transfer.

-   **Parameters**:
    -   `preBusiness` ([PreBusiness](#prebusiness)): Pre-business data
    -   `userWallet` (string): The user's wallet address
    -   `rpc` (string, optional): The RPC endpoint
    -   `network` ([NetworkType](#networktype)): The network type
-   **Returns**:
    -   `Promise<boolean>`: True if approval is needed, false otherwise

##### **GetApproveTransfer**

```typescript
GetApproveTransfer(preBusiness: PreBusiness, network: NetworkType): Promise<ContractTransaction>
```

Constructs a raw transaction for approving a token transfer on the evm blockchain.

-   **Parameters**:
    -   `preBusiness` ([PreBusiness](#prebusiness)): Pre-business data
    -   `network` ([NetworkType](#networktype)): Network type
-   **Returns**:
    -   Promise<[ContractTransaction](https://docs.ethers.org/v6/api/contract/#ContractTransaction)>: Raw transaction data for the approval

##### **GetGasPrice**

```typescript
GetGasPrice(provider: JsonRpcProvider, systemChainId: ChainId, network: NetworkType): Promise<GasPrice>
```

Retrieves the current gas price for a network used in Otmoic.

-   **Parameters**:
    -   `provider` ([JsonRpcProvider](https://docs.ethers.org/v6/api/providers/jsonrpc/#JsonRpcProvider)): The JSON RPC provider
    -   `systemChainId` ([ChainId](#chainid)): The system chain ID
    -   `network` ([NetworkType](#networktype)): Network type
-   **Returns**:
    -   Promise<[GasPrice](#gasprice)>: Current gas price

##### **GetOnChainGasPrice**

```typescript
GetOnChainGasPrice(systemChainId: ChainId, network: NetworkType): Promise<bigint>
```

Retrieves the on-chain gas price for an evm network.

-   **Parameters**:
    -   `systemChainId` ([ChainId](#chainid)): The system chain ID
    -   `network` ([NetworkType](#networktype)): Network type
-   **Returns**:
    -   `Promise<bigint>`: On-chain gas price

##### **GetBalance**

```typescript
GetBalance(bridge: Bridge, address: string, network: NetworkType, rpc?: string): Promise<string>
```

Retrieves the balance of the src token on a bridge for a given address.

-   **Parameters**:
    -   `bridge` ([Bridge](#bridge)): The bridge configuration
    -   `address` (string): The address to check the balance for
    -   `network` ([NetworkType](#networktype)): The network type
    -   `rpc` (string, optional): The RPC endpoint
-   **Returns**:
    -   `Promise<string>`: The balance of the token

#### `business` {#business}

The `business` namespace provides methods to interact with the Otmoic business service. It allows you to sign, send, confirm and refund assets, and submit complaints.

##### **signQuote**

```typescript
signQuote(
    network: NetworkType,
    quote: Quote,
    amount: string,
    swapToNative: number,
    receivingAddress: string,
    expectedSingleStepTime?: number,
    tolerantSingleStepTime?: number,
    earliestRefundTime?: number,
    rpcSrc?: string,
    rpcDst?: string,
    option: SignSwapOption
): Promise<SwapSignData | SwapSignedData>
```

Signs a quote for a swap operation, supporting both EVM and Solana networks.

-   **Parameters**:
    -   `network` ([NetworkType](#networktype)): The network type
    -   `quote` ([Quote](#quote)): The quote data to be signed
    -   `amount` (string): The amount to be swapped
    -   `swapToNative` (number): Percentage to swap to native token
    -   `receivingAddress` (string): The address to receive the swapped tokens
    -   `expectedSingleStepTime` (number, optional): Expected time for a single step
    -   `tolerantSingleStepTime` (number, optional): Tolerant time for a single step
    -   `earliestRefundTime` (number, optional): Earliest refund time
    -   `rpcSrc` (string, optional): Source RPC endpoint
    -   `rpcDst` (string, optional): Destination RPC endpoint
    -   `option` ([SignSwapOption](#signswapoption)): Options for signing the quote
-   **Returns**:
    -   Promise<[SwapSignData](#swapsigndata) | [SwapSignedData](#swapsigneddata)>: The signed data and signature

##### **transferOut**

```typescript
transferOut(
    preBusiness: PreBusiness,
    network: NetworkType,
    rpc?: string,
    option: SwapTransactionOption
): Promise<ContractTransaction | ResponseTransferOut | Transaction | ResponseSolana>
```

Initiates a transfer out operation, supporting both EVM and Solana networks.

-   **Parameters**:
    -   `preBusiness` ([PreBusiness](#prebusiness)): Pre-business data
    -   `network` ([NetworkType](#networktype)): The network type
    -   `rpc` (string, optional): RPC endpoint
    -   `option` ([SwapTransactionOption](#swaptransactionoption)): Options for the transfer out operation
-   **Returns**:
    -   Promise<[ContractTransaction](https://docs.ethers.org/v6/api/contract/#ContractTransaction) | [ResponseTransferOut](#responsetransferout) | [Transaction](https://solana-labs.github.io/solana-web3.js/v1.x/classes/Transaction.html) | [ResponseSolana](#responsesolana)>: Response of the transfer out operation

##### **transferOutConfirm**

```typescript
transferOutConfirm(
    preBusiness: PreBusiness,
    network: NetworkType,
    rpc?: string,
    option: SwapTransactionOption
): Promise<ContractTransaction | ContractTransactionResponse | Transaction | ResponseSolana>
```

Confirms a transfer out operation, supporting both EVM and Solana networks.

-   **Parameters**:
    -   `preBusiness` ([PreBusiness](#prebusiness)): Pre-business data
    -   `network` ([NetworkType](#networktype)): The network type
    -   `rpc` (string, optional): RPC endpoint
    -   `option` ([SwapTransactionOption](#swaptransactionoption)): Options for the transfer out confirmation
-   **Returns**:
    -   Promise<[ContractTransaction](https://docs.ethers.org/v6/api/contract/#ContractTransaction) | [ContractTransactionResponse](https://docs.ethers.org/v6/api/contract/#ContractTransactionResponse) | [Transaction](https://solana-labs.github.io/solana-web3.js/v1.x/classes/Transaction.html) | [ResponseSolana](#responsesolana)>: Response of the transfer out confirmation

##### **transferInConfirm**

```typescript
transferInConfirm(
    preBusiness: PreBusiness,
    network: NetworkType,
    rpc?: string,
    sender: string,
    option: SwapTransactionOption
): Promise<ContractTransaction | ContractTransactionResponse | Transaction | ResponseSolana>
```

Confirms a transfer in operation, supporting both EVM and Solana networks.

-   **Parameters**:
    -   `preBusiness` ([PreBusiness](#prebusiness)): Pre-business data
    -   `network` ([NetworkType](#networktype)): The network type
    -   `rpc` (string, optional): RPC endpoint
    -   `sender` (string): The sender address
    -   `option` ([SwapTransactionOption](#swaptransactionoption)): Options for the transfer in confirmation
-   **Returns**:
    -   Promise<[ContractTransaction](https://docs.ethers.org/v6/api/contract/#ContractTransaction) | [ContractTransactionResponse](https://docs.ethers.org/v6/api/contract/#ContractTransactionResponse) | [Transaction](https://solana-labs.github.io/solana-web3.js/v1.x/classes/Transaction.html) | [ResponseSolana](#responsesolana)>: Response of the transfer in confirmation

##### **transferOutRefund**

```typescript
transferOutRefund(
    preBusiness: PreBusiness,
    network: NetworkType,
    rpc?: string,
    option: SwapTransactionOption
): Promise<ContractTransaction | ContractTransactionResponse | Transaction | ResponseSolana>
```

Refunds a transfer out operation, supporting both EVM and Solana networks.

-   **Parameters**:
    -   `preBusiness` ([PreBusiness](#prebusiness)): Pre-business data
    -   `network` ([NetworkType](#networktype)): The network type
    -   `rpc` (string, optional): RPC endpoint
    -   `option` ([SwapTransactionOption](#swaptransactionoption)): Options for the transfer out refund
-   **Returns**:
    -   Promise<[ContractTransaction](https://docs.ethers.org/v6/api/contract/#ContractTransaction) | [ContractTransactionResponse](https://docs.ethers.org/v6/api/contract/#ContractTransactionResponse) | [Transaction](https://solana-labs.github.io/solana-web3.js/v1.x/classes/Transaction.html) | [ResponseSolana](#responsesolana)>: Response of the transfer out refund

##### **complain**

```typescript
complain(
    preBusiness: PreBusiness,
    privateKey: string,
    network: NetworkType
): Promise<string | boolean>
```

Submits a complaint using a private key, supporting EVM networks.

-   **Parameters**:
    -   `preBusiness` ([PreBusiness](#prebusiness)): Pre-business data
    -   `privateKey` (string): The private key for signing
    -   `network` ([NetworkType](#networktype)): The network type
-   **Returns**:
    -   `Promise<string | boolean>`: Result of the complaint submission

##### **signComplainEIP712**

```typescript
signComplainEIP712(
    preBusiness: PreBusiness,
    network: NetworkType,
    option: SignComplainEIP712Option
): Promise<ComplainSignedData | ComplainSignData>
```

Signs a complaint using EIP-712, supporting EVM networks.

-   **Parameters**:
    -   `preBusiness` ([PreBusiness](#prebusiness)): Pre-business data
    -   `network` ([NetworkType](#networktype)): The network type
    -   `option` ([SignComplainEIP712Option](#signcomplaineip712option)): Options for signing the complaint
-   **Returns**:
    -   Promise<[ComplainSignedData](#complainsigneddata) | [ComplainSignData](#complainsigndata)>: The signed data and signature

### Type definitions

#### `GetBridgesOption`

Type definition for the options used to fetch bridges.

```typescript
interface GetBridgesOption {
    detailed?: boolean;
    network?: NetworkType;
    rpcs?: Record<string, string>;
}
```

-   `detailed` (boolean, optional): Whether to fetch detailed bridge information. If `true`, the network will be included, will return [TranslatedBridge](#translatedbridge) array. If `false`, will return [Bridge](#bridge) array.
-   `network` (NetworkType, optional): The network type to filter bridges (e.g., 'mainnet', 'testnet').
-   `rpcs` (Record<string, string>, optional): RPC endpoints for different networks. The key is the network name and the value is the RPC endpoint. e.g., `{ "solana": "https://mainnet.infura.io/v3/your-api-key", "bsc": "https://mainnet.infura.io/v3/your-api-key" }`. If not provided, the default RPC endpoints will be used.

#### `Bridge`

Type definition for the bridge configuration.

```typescript
interface Bridge {
    bridge_id: number;
    src_chain_id: number;
    dst_chain_id: number;
    src_token: string;
    dst_token: string;
    bridge_name?: string;
}
```

-   `bridge_id` (number): Unique identifier for the bridge.
-   `src_chain_id` (number): Source blockchain chain ID.
-   `dst_chain_id` (number): Destination blockchain chain ID.
-   `src_token` (string): Source token address.
-   `dst_token` (string): Destination token address.
-   `bridge_name` (string, optional): Name of the bridge.

#### `TranslatedBridge`

Type definition for the translated bridge configuration.

```typescript
interface TranslatedBridge {
    bridge_id: number;
    src_chain_id: number;
    dst_chain_id: number;
    src_token: string;
    dst_token: string;
    bridge_name?: string;
    src_chain_name: string;
    dst_chain_name: string;
    src_token_symbol: string;
    dst_token_symbol: string;
}
```

-   `bridge_id` (number): Unique identifier for the bridge.
-   `src_chain_id` (number): Source blockchain chain ID.
-   `dst_chain_id` (number): Destination blockchain chain ID.
-   `src_token` (string): Source token address.
-   `dst_token` (string): Destination token address.
-   `bridge_name` (string, optional): Name of the bridge.
-   `src_chain_name` (string): Human-readable name of the source blockchain.
-   `dst_chain_name` (string): Human-readable name of the destination blockchain.
-   `src_token_symbol` (string): Human-readable symbol of the source token.
-   `dst_token_symbol` (string): Human-readable symbol of the destination token.

#### `AskIF`

Type definition for the ask interface.

```typescript
interface AskIF {
    bridge: Bridge;
    amount: string;
}
```

-   `bridge` ([Bridge](#bridge)): The target bridge to ask price.
-   `amount` (string): The amount to be swapped.

#### `OnQuoteIF`

Type definition for the on quote interface.

```typescript
interface OnQuoteIF {
    OnQuote(quote: Quote): void;
}
```

-   `OnQuote` (function): The callback function to be called when a quote is received, with the [quote](#quote) data as the parameter.

#### `Quote`

```typescript
interface Quote {
    quote_base: QuoteBase;
    authentication_limiter: AuthenticationLimiter;
    lp_info: LpInfo;
    quote_name: string;
    timestamp: number;
}
```

-   `quote_base` ([QuoteBase](#quotebase)): Base information about the quote, including bridge details and pricing.
-   `authentication_limiter` ([AuthenticationLimiter](#authenticationlimiter)): Information about authentication limits, such as country restrictions and age limits.
-   `lp_info` ([LpInfo](#lpinfo)): Information about the liquidity provider, including ID, name, and credit score.
-   `quote_name` (string): The name of the quote.
-   `timestamp` (number): The timestamp when the quote was created.

#### `QuoteBase`

Type definition for the base information of a quote.

```typescript
interface QuoteBase {
    bridge: Bridge;
    lp_bridge_address: string;
    price: string;
    native_token_price: string;
    native_token_max: string;
    native_token_min: string;
    capacity: string;
    lp_node_uri: string;
    quote_hash: string;
}
```

-   `bridge` ([Bridge](#bridge)): The bridge details for the quote.
-   `lp_bridge_address` (string): The address of the liquidity provider's bridge.
-   `price` (string): The price of the quote.
-   `native_token_price` (string): The price of the native token.
-   `native_token_max` (string): The maximum amount of native tokens.
-   `native_token_min` (string): The minimum amount of native tokens.
-   `capacity` (string): The capacity of the quote.
-   `lp_node_uri` (string): The URI of the liquidity provider's node.
-   `quote_hash` (string): The hash of the quote.

#### `AuthenticationLimiter`

Type definition for the authentication limiter information.

```typescript
interface AuthenticationLimiter {
    country_white_list: string;
    country_black_list: string;
    min_age: string;
    limiter_state: string;
}
```

-   `country_white_list` (string): List of countries allowed.
-   `country_black_list` (string): List of countries not allowed.
-   `min_age` (string): Minimum age required.
-   `limiter_state` (string): State of the limiter.

#### `LpInfo`

Type definition for the liquidity provider information.

```typescript
interface LpInfo {
    lp_id: number;
    lp_id_fake: string;
    name: string;
    profile: string;
    credit_score: number;
}
```

-   `lp_id` (number): The ID of the liquidity provider.
-   `lp_id_fake` (string): A fake ID for the liquidity provider.
-   `name` (string): The name of the liquidity provider.
-   `profile` (string): The profile of the liquidity provider.
-   `credit_score` (number): The credit score of the liquidity provider.

#### `SwapSignData`

Type definition for the swap sign data.

```typescript
interface SwapSignData {
    types?: {
        Message: {
            name: string;
            type: string;
        }[];
        EIP712Domain: {
            name: string;
            type: string;
        }[];
    };
    primaryType?: string;
    domain?: {
        name: string;
        version: string;
        chainId: number | undefined;
    };
    message: {
        src_chain_id: number;
        src_address: string;
        src_token: string;
        src_amount: string;

        dst_chain_id: number;
        dst_address: string;
        dst_token: string;
        dst_amount: string;
        dst_native_amount: string;

        requestor: string;
        lp_id: string;
        agreement_reached_time: number;
        expected_single_step_time: number;
        tolerant_single_step_time: number;
        earliest_refund_time: number;
    };
}
```

-   `types` (optional): Object defining the types for EIP-712 signing.
    -   `Message`: Array of objects defining the message fields.
        -   `name` (string): Name of the field.
        -   `type` (string): Type of the field.
    -   `EIP712Domain`: Array of objects defining the domain fields.
        -   `name` (string): Name of the field.
        -   `type` (string): Type of the field.
-   `primaryType` (optional): Primary type for EIP-712 signing.
-   `domain` (optional): Object defining the domain for EIP-712 signing.
    -   `name` (string): Name of the domain.
    -   `version` (string): Version of the domain.
    -   `chainId` (number | undefined): Chain ID of the domain.
-   `message`: Object containing the message data for the swap.
    -   `src_chain_id` (number): Source chain ID.
    -   `src_address` (string): Source address.
    -   `src_token` (string): Source token address.
    -   `src_amount` (string): Source amount.
    -   `dst_chain_id` (number): Destination chain ID.
    -   `dst_address` (string): Destination address.
    -   `dst_token` (string): Destination token address.
    -   `dst_amount` (string): Destination amount.
    -   `dst_native_amount` (string): Destination native amount.
    -   `requestor` (string): Requestor address.
    -   `lp_id` (string): Liquidity provider ID.
    -   `agreement_reached_time` (number): Agreement reached time.
    -   `expected_single_step_time` (number): Expected single step time.
    -   `tolerant_single_step_time` (number): Tolerant single step time.
    -   `earliest_refund_time` (number): Earliest refund time.

#### `SwapSignedData`

Type definition for the signed swap data.

```typescript
interface SwapSignedData {
    signData: SwapSignData;
    signed: string;
}
```

-   `signData` ([SwapSignData](#swapsigndata)): The signing data object containing the details of the swap to be signed.
-   `signed` (string): The signature generated from signing the `signData`.

#### `PreBusiness`

Type definition for the pre-business data.

```typescript
interface PreBusiness {
    swap_asset_information: SwapAssetInformation;
    hash: string;
    hashlock_evm: string;
    hashlock_xrp: string;
    hashlock_near: string;
    hashlock_solana: string;
    locked: boolean;
    lock_message: string;
    preimage: string;
    timestamp: number;
    is_kyc: boolean;
    same_did: boolean;
}
```

-   `swap_asset_information` ([SwapAssetInformation](#swapassetinformation)): Information about the swap asset.
-   `hash` (string): The hash of the pre-business transaction.
-   `hashlock_evm` (string): Hashlock for EVM chains.
-   `hashlock_xrp` (string): Hashlock for XRP chain.
-   `hashlock_near` (string): Hashlock for NEAR chain.
-   `hashlock_solana` (string): Hashlock for Solana chain.
-   `locked` (boolean): Indicates if the transaction is locked.
-   `lock_message` (string): Message associated with the lock.
-   `preimage` (string): Preimage for the hashlock.
-   `timestamp` (number): Timestamp of the pre-business transaction.
-   `is_kyc` (boolean): Indicates if KYC is required.
-   `same_did` (boolean): Indicates if the same DID is used.

#### `Business` {#Business}

Type definition for the business data.

```typescript
interface Business {
    business_id: number;
    step: number;
    business_hash: string;
    transfer_out_id: number;
    transfer_in_id: number;
    transfer_out_confirm_id: number;
    transfer_in_confirm_id: number;
    transfer_out_refund_id: number;
    transfer_in_refund_id: number;
}
```

-   `business_id` (number): Unique identifier for the business.
-   `step` (number): Current step of the business process.
-   `business_hash` (string): Hash of the business transaction.
-   `transfer_out_id` (number): ID of the transfer out transaction.
-   `transfer_in_id` (number): ID of the transfer in transaction.
-   `transfer_out_confirm_id` (number): ID of the transfer out confirmation.
-   `transfer_in_confirm_id` (number): ID of the transfer in confirmation.
-   `transfer_out_refund_id` (number): ID of the transfer out refund.
-   `transfer_in_refund_id` (number): ID of the transfer in refund.

#### `BusinessFullData`

Type definition for the full business data.

```typescript
interface BusinessFullData {
    pre_business: PreBusiness;
    business: Business;
    event_transfer_out: any;
    event_transfer_in: any;
    event_transfer_out_confirm: any;
    event_transfer_in_confirm: any;
    event_transfer_out_refund: any;
    event_transfer_in_refund: any;
}
```

-   `pre_business` ([PreBusiness](#prebusiness)): Pre-business data.
-   `business` ([Business](#Business)): Business data.
-   `event_transfer_out` (any): Event data for the transfer out.
-   `event_transfer_in` (any): Event data for the transfer in.
-   `event_transfer_out_confirm` (any): Event data for the transfer out confirmation.
-   `event_transfer_in_confirm` (any): Event data for the transfer in confirmation.
-   `event_transfer_out_refund` (any): Event data for the transfer out refund.
-   `event_transfer_in_refund` (any): Event data for the transfer in refund.

#### `SwapAssetInformation`

Type definition for the swap asset information.

```typescript
interface SwapAssetInformation {
    bridge_name: string;
    lp_id_fake: string;
    sender: string;
    amount: string;
    dst_address: string;
    dst_amount: string;
    dst_native_amount: string;
    system_fee_src: number;
    system_fee_dst: number;
    dst_amount_need: string;
    dst_native_amount_need: string;
    agreement_reached_time: number;
    expected_single_step_time: number;
    tolerant_single_step_time: number;
    earliest_refund_time: number;
    quote: Quote;
    append_information: string;
    did: string;
    requestor: string;
    user_sign: string;
    lp_sign: string;
    src_transfer_id?: string;
}
```

-   `bridge_name` (string): The name of the bridge used for the swap.
-   `lp_id_fake` (string): A fake ID for the liquidity provider.
-   `sender` (string): The address of the sender initiating the swap.
-   `amount` (string): The amount to be swapped.
-   `dst_address` (string): The destination address to receive the swapped tokens.
-   `dst_amount` (string): The amount of tokens to be received at the destination.
-   `dst_native_amount` (string): The amount of native tokens to be received at the destination.
-   `system_fee_src` (number): The system fee charged on the source chain.
-   `system_fee_dst` (number): The system fee charged on the destination chain.
-   `dst_amount_need` (string): The required amount of tokens at the destination.
-   `dst_native_amount_need` (string): The required amount of native tokens at the destination.
-   `agreement_reached_time` (number): The timestamp when the agreement was reached.
-   `expected_single_step_time` (number): The expected time for a single step in the swap process.
-   `tolerant_single_step_time` (number): The tolerant time for a single step in the swap process.
-   `earliest_refund_time` (number): The earliest time when a refund can be initiated.
-   `quote` ([Quote](#quote)): The quote data associated with the swap.
-   `append_information` (string): Additional information related to the swap.
-   `did` (string): The decentralized identifier of the user.
-   `requestor` (string): The address of the requestor.
-   `user_sign` (string): The user's signature for the swap.
-   `lp_sign` (string): The liquidity provider's signature for the swap.
-   `src_transfer_id` (string, optional): The transfer ID on the source chain.

#### `GetBusinessOptions`

Type definition for the options used to fetch business details.

```typescript
interface GetBusinessOptions {
    detailed?: boolean;
}
```

-   `detailed` (boolean, optional): Whether to fetch detailed business information. If `true`, the response will include full business data ([BusinessFullData](#businessfulldata)). If `false`, only basic business data ([Business](#Business)) will be returned.

#### `ChainId`

Enumeration for supported blockchain chain IDs. The chain IDs are from [BIP-44](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).

```typescript
enum ChainId {
    AVAX = 9000,
    BSC = 9006,
    ETH = 60,
    POLYGON = 966,
    OPT = 614,
    SOLANA = 501,
    NEAR = 397,
    XRP = 144,
}
```

-   `AVAX` (9000): Avalanche chain ID.
-   `BSC` (9006): Binance Smart Chain ID.
-   `ETH` (60): Ethereum chain ID.
-   `POLYGON` (966): Polygon chain ID.
-   `OPT` (614): Optimism chain ID.
-   `SOLANA` (501): Solana chain ID.
-   `NEAR` (397): NEAR chain ID.
-   `XRP` (144): XRP chain ID.

#### `NetworkType`

Enumeration for supported network types.

```typescript
enum NetworkType {
    MAINNET = 'mainnet',
    TESTNET = 'testnet',
}
```

-   `MAINNET` ('mainnet'): Represents the main network where actual transactions occur.
-   `TESTNET` ('testnet'): Represents the test network used for testing and development purposes.

#### `DstAmountSet`

Type definition for the destination amount set.

```typescript
interface DstAmountSet {
    dstAmount: string;
    dstNativeAmount: string;
}
```

-   `dstAmount` (string): The amount of tokens to be received at the destination.
-   `dstNativeAmount` (string): The amount of native tokens to be received at the destination.

#### `GasPrice`

Type definition for the gas price information.

```typescript
interface GasPrice {
    amount: bigint;
    usedMaximum: boolean;
}
```

-   `amount` (bigint): The amount of gas price in the smallest unit of the blockchain's native currency (e.g., wei for Ethereum).
-   `usedMaximum` (boolean): Indicates whether the maximum gas price limitation set in otmoic was used for the price. If `true`, means the gas price got from blockchain exceeds otmoic gas price limitaton and the otmoic gas price limitation was used for the price. If `false`, the on chain gas price was used.

#### `SignSwapOption`

Type definition for the options used to sign a swap.

```typescript
interface SignSwapOption {
    getSignDataOnly?: boolean;
    type?: 'privateKey' | 'metamaskAPI' | 'phantomAPI';
    privateKey?: string;
    metamaskAPI?: any;
    phantomAPI?: any;
    sender?: string;
}
```

-   `getSignDataOnly` (boolean, optional): If `true`, only the signing data will be returned without performing the actual signing. the rest of the options will be ignored.
-   `type` ('privateKey' | 'metamaskAPI' | 'phantomAPI', optional): Specifies the method to be used for signing. It can be one of the following:
    -   `privateKey`: Uses a private key for signing.
    -   `metamaskAPI`: Uses the MetaMask API for signing.
    -   `phantomAPI`: Uses the Phantom API for signing.
-   `privateKey` (string, optional): The private key to be used for signing if the `type` is set to `privateKey`.
-   `metamaskAPI` (any, optional): The MetaMask API object to be used for signing if the `type` is set to `metamaskAPI`.
-   `phantomAPI` (any, optional): The Phantom API object to be used for signing if the `type` is set to `phantomAPI`.
-   `sender` (string, optional): The address of the sender initiating the swap must be provided if `type` is either `metamaskAPI` or `phantomAPI`.

#### `SwapTransactionOption`

Type definition for the options used to perform a swap transaction.

```typescript
interface SwapTransactionOption {
    getTxDataOnly?: boolean;
    type?: 'privateKey' | 'metamaskAPI' | 'phantomAPI';
    privateKey?: string;
    metamaskAPI?: any;
    phantomAPI?: any;
    useMaximumGasPriceAtMost?: boolean;
    provider?: Connection;
    pluginProvider?: Provider;
}
```

-   `getTxDataOnly` (boolean, optional): If `true`, only the transaction data will be returned without performing the actual transaction. the rest of the options will be ignored.
-   `type` ('privateKey' | 'metamaskAPI' | 'phantomAPI', optional): Specifies the method to be used for the transaction. It can be one of the following:
    -   `privateKey`: Uses a private key for signing the transaction.
    -   `metamaskAPI`: Uses the MetaMask API for signing the transaction.
    -   `phantomAPI`: Uses the Phantom API for signing the transaction.
-   `privateKey` (string, optional): The private key to be used for signing the transaction if the `type` is set to `privateKey`.
-   `metamaskAPI` (any, optional): The MetaMask API object to be used for signing the transaction if the `type` is set to `metamaskAPI`.
-   `phantomAPI` (any, optional): The Phantom API object to be used for signing the transaction if the `type` is set to `phantomAPI`.
-   `useMaximumGasPriceAtMost` (boolean, optional): If `true`, the maximum gas price limitation set in Otmoic will be used for the transaction. must be provided when `type` is `privateKey` and operate on EVM network.
-   `provider` (Connection, optional): The Solana connection provider.
-   `pluginProvider` (Provider, optional): The Anchor provider for Solana transactions.

#### `ResponseTransferOut`

Type definition for the response of a transfer out operation.

```typescript
interface ResponseTransferOut {
    approve: ContractTransactionResponse | undefined;
    transferOut: ContractTransactionResponse;
}
```

-   `approve` ([ContractTransactionResponse](https://docs.ethers.org/v6/api/contract/#ContractTransactionResponse) | undefined): The response of the approval transaction. This is optional and may be undefined if no approval is needed.
-   `transferOut` ([ContractTransactionResponse](https://docs.ethers.org/v6/api/contract/#ContractTransactionResponse)): The response of the transfer out transaction. This contains details about the transaction such as the transaction hash, status, block number, gas used, and logs.

#### `ResponseSolana`

Type definition for the response of a Solana transaction.

```typescript
interface ResponseSolana {
    txHash: string;
}
```

-   `txHash` (string): The transaction hash of the Solana transaction.

#### `SignComplainEIP712Option`

Type definition for the options used to sign a complaint using EIP-712.

```typescript
interface SignComplainEIP712Option {
    getSignDataOnly?: boolean;
    type?: 'privateKey' | 'termiPass';
    privateKey?: string;
    termiPassAPI?: any;
}
```

-   `getSignDataOnly` (boolean, optional): If `true`, only the signing data will be returned without performing the actual signing. The rest of the options will be ignored.
-   `type` ('privateKey' | 'termiPass', optional): Specifies the method to be used for signing. It can be one of the following:
    -   `privateKey`: Uses a private key for signing.
    -   `termiPass`: Uses the TermiPass API for signing.
-   `privateKey` (string, optional): The private key to be used for signing if the `type` is set to `privateKey`.
-   `termiPassAPI` (any, optional): The TermiPass API object to be used for signing if the `type` is set to `termiPass`.

#### `ComplainSignData`

Type definition for the complaint sign data.

```typescript
interface ComplainSignData {
    types: Record<string, TypedDataField[]>;
    primaryType: string;
    domain: TypedDataDomain;
    message: ComplaintValue;
}
```

-   `types` (Record<string, TypedDataField[]>): Object defining the types for EIP-712 signing.
    -   `TypedDataField`: Array of objects defining the message fields.
        -   `name` (string): Name of the field.
        -   `type` (string): Type of the field.
-   `primaryType` (string): Primary type for EIP-712 signing.
-   `domain` (TypedDataDomain): Object defining the domain for EIP-712 signing.
    -   `name` (string): Name of the domain.
    -   `version` (string): Version of the domain.
    -   `chainId` (number | undefined): Chain ID of the domain.
-   `message` (ComplaintValue): Object containing the message data for the complaint.
    -   `srcChainId` (number): Source chain ID.
    -   `srcAddress` (string): Source address.
    -   `srcToken` (string): Source token address.
    -   `srcAmount` (string): Source amount.
    -   `dstChainId` (number): Destination chain ID.
    -   `dstAddress` (string): Destination address.
    -   `dstToken` (string): Destination token address.
    -   `dstAmount` (string): Destination amount.
    -   `dstNativeAmount` (string): Destination native amount.
    -   `requestor` (string): Requestor address.
    -   `lpId` (string): Liquidity provider ID.
    -   `expectedSingleStepTime` (number): Expected single step time.
    -   `tolerantSingleStepTime` (number): Tolerant single step time.
    -   `earliestRefundTime` (number): Earliest refund time.
    -   `agreementReachedTime` (number): Agreement reached time.
    -   `userSign` (string): User's signature.
    -   `lpSign` (string): Liquidity provider's signature.

#### `ComplainSignedData`

Type definition for the signed complaint data.

```typescript
interface ComplainSignedData {
    signData: ComplainSignData;
    signed: string;
}
```

-   `signData` ([ComplainSignData](#complainsigndata)): The signing data object containing the details of the complaint to be signed.
-   `signed` (string): The signature generated from signing the `signData`.

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
