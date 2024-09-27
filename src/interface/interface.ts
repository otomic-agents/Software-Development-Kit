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

export interface SignData {
    types: {
        Message: {
            name: string;
            type: string;
        }[];
    };
    primaryType: string;
    domain: {
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
        step_time_lock: number;
        agreement_reached_time: number;
    };
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
    step_time_lock: number;
    agreement_reached_time: number;
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
    preimage: string;
    relay_hashlock_evm: string;
    relay_hashlock_xrp: string;
    relay_hashlock_near: string;
    relay_hashlock_solana: string;
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
