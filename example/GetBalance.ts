import { Bridge, assistive } from "../src"

const bridge: Bridge = {
    bridge_id: 1,
    src_chain_id: 9006,
    dst_chain_id: 9006,
    src_token: '0x57e73db0eebd89f722e064d4c209f86eba9daeec',
    dst_token: '0xacda8bf66c2cadac9e99aa1aa75743f536e71094',
    bridge_name: undefined
}

const NETWORK = "testnet"

const ADDRESS = "0x1C55a22A2AD9c2921706306ADFBdBee009987fce"

const GetBalance = async () => {
    const balance = await assistive.GetBalance(bridge, ADDRESS, NETWORK, undefined)
    console.log('balance', balance)
}

GetBalance()