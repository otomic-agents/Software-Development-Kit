import { Connection } from '@solana/web3.js';
import { Provider } from '@coral-xyz/anchor';
import { TypedDataField, TypedDataDomain } from 'ethers';

export interface Bridge {
    bridge_id: number;
    src_chain_id: number;
    dst_chain_id: number;
    src_token: string;
    dst_token: string;
    bridge_name: string | undefined;
}

export interface QuoteBase {
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

export interface AuthenticationLimiter {
    country_white_list: string;
    country_black_list: string;
    min_age: string;
    limiter_state: string;
}

export interface LpInfo {
    lp_id: number;
    lp_id_fake: string;
    name: string;
    profile: string;
    credit_score: number;
}

export interface Quote {
    quote_base: QuoteBase;
    authentication_limiter: AuthenticationLimiter;
    lp_info: LpInfo;
    quote_name: string;
    timestamp: number;
}

export interface OnQuoteIF {
    OnQuote(quote: Quote): void;
}

export interface AskIF {
    bridge: Bridge;
    amount: string;
}

export interface SwapSignData {
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

export interface SwapSignedData {
    signData: SwapSignData;
    signed: string;
}

export interface SignSwapOption {
    getSignDataOnly?: boolean;
    type?: 'privateKey' | 'metamaskAPI' | 'phantomAPI';
    privateKey?: string;
    metamaskAPI?: any;
    phantomAPI?: any;
    sender?: string;
}

export interface SwapAssetInformation {
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

export interface KycInfo {
    address: string;
    address_on_chain: string;
    birthday: string;
    country: string;
    email: string;
    first_name: string;
    gender: string;
    id_end_image: string;
    id_front_image: string;
    id_number: string;
    id_type: string;
    image1: string;
    image2: string;
    last_name: string;
    phone: string;
    username: string;
    identification_photo_1: string;
    identification_photo_2: string;
    identification_photo_3: string;
    identification_photo_4: string;
    did: string;
    status: string;
    vp: string;
}

export interface PreBusiness {
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

export interface Business {
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

export interface BusinessFullData {
    pre_business: PreBusiness;
    business: Business;
    event_transfer_out: any;
    event_transfer_in: any;
    event_transfer_out_confirm: any;
    event_transfer_in_confirm: any;
    event_transfer_out_refund: any;
    event_transfer_in_refund: any;
}

export interface GetBusinessOptions {
    detailed?: boolean;
}

export interface DstAmountSet {
    dstAmount: string;
    dstNativeAmount: string;
}

export enum ChainId {
    AVAX = 9000,
    BSC = 9006,
    ETH = 60,
    POLYGON = 966,
    OPT = 614,
    SOLANA = 501,
    NEAR = 397,
    XRP = 144,
}

export enum NetworkType {
    MAINNET = 'mainnet',
    TESTNET = 'testnet',
}

export interface ComplaintValue {
    srcChainId: number;
    srcAddress: string;
    srcToken: string;
    dstChainId: number;
    dstAddress: string;
    dstToken: string;
    srcAmount: string;
    dstAmount: string;
    dstNativeAmount: string;
    requestor: string;
    lpId: string;
    expectedSingleStepTime: number;
    tolerantSingleStepTime: number;
    earliestRefundTime: number;
    agreementReachedTime: number;
    userSign: string;
    lpSign: string;
}

export interface ComplainSignData {
    types: Record<string, TypedDataField[]>;
    primaryType: string;
    domain: TypedDataDomain;
    message: ComplaintValue;
}

export interface ComplainSignedData {
    signData: ComplainSignData;
    signed: string;
}

export interface SignComplainEIP712Option {
    getSignDataOnly?: boolean;
    type?: 'privateKey' | 'termiPass';
    privateKey?: string;
    termiPassAPI?: any;
}

export interface SwapTransactionOption {
    getTxDataOnly?: boolean;
    type?: 'privateKey' | 'metamaskAPI' | 'phantomAPI';
    privateKey?: string;
    metamaskAPI?: any;
    phantomAPI?: any;
    useMaximumGasPriceAtMost?: boolean;
    provider?: Connection;
    pluginProvider?: Provider;
}

export interface GasPrice {
    amount: bigint;
    usedMaximum: boolean;
}

export interface GetBridgesOption {
    detailed?: boolean;
    network?: NetworkType;
    rpcs?: Record<string, string>;
}
