import { Bridge, assistive } from "../src"

const bridge: Bridge = {
    bridge_id: 6,
    src_chain_id: 9006,
    dst_chain_id: 9006,
    src_token: '0x0000000000000000000000000000000000000000',
    dst_token: '0xaCDA8BF66C2CADAc9e99Aa1aa75743F536E71094',
    bridge_name: undefined
}

const NETWORK = "testnet"

const ADDRESS = "0x945e9704D2735b420363071bB935ACf2B9C4b814"

const GetBalance = async () => {
    const balance = await assistive.GetBalance(bridge, ADDRESS, NETWORK, undefined)
    console.log('balance', balance)
}

GetBalance()