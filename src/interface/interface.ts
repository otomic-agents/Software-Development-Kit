export interface Bridge {
    bridge_id: number,
    src_chain_id: number,
    dst_chain_id: number,
    src_token: string,
    dst_token: string,
    bridge_name: string | undefined
}

export interface QuoteBase {
    bridge: Bridge,
    lp_bridge_address: string,
    price: string,
    native_token_price: string,
    native_token_max: string,
    native_token_min: string,
    capacity: string,
    lp_node_uri: string,
    quote_hash: string
}

export interface AuthenticationLimiter {
    country_white_list: string,
    country_black_list: string,
    min_age: string,
    limiter_state: string
}

export interface LpInfo {
    lp_id: number,
    lp_id_fake: string,
    name: string,
    profile: string,
    credit_score: number
}

export interface Quote {
    quote_base: QuoteBase,
    authentication_limiter: AuthenticationLimiter,
    lp_info: LpInfo,
    quote_name: string,
    timestamp: number
}

export interface OnQuoteIF {
    OnQuote(quote: Quote): void;

}

export interface AskIF {
    bridge: Bridge,
    amount: string
}

export interface SignData {
    types: {
        Message: {
            name: string,
            type: string
        }[]
    },
    primaryType: string,
    domain: {
        name: string,
        version: string,
        chainId: number | undefined
    },
    message: {
        src_chain_id: number,
        src_address: string,
        src_token: string,
        src_amount: string,

        dst_chain_id: number,
        dst_address: string,
        dst_token: string
        dst_amount: string,
        dst_native_amount: string,

        requestor: string,
        lp_id: string,
        step_time_lock: number,
        agreement_reached_time: number
    };
}