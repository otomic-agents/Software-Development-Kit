import { PreBusiness, evm, utils } from "../src"
import { Bridge, Relay, Quote, SignData } from '../src/index'

const RELA_URL = 'https://5b4522f4.vaughnmedellins394.myterminus.com'
const NETWORK = 'testnet'
const RPC_BSC = 'https://bsc-testnet-rpc.publicnode.com'

const bridge: Bridge = {
    bridge_id: 6,
    src_chain_id: 9006,
    dst_chain_id: 9006,
    src_token: '0x0000000000000000000000000000000000000000',
    dst_token: '0xaCDA8BF66C2CADAc9e99Aa1aa75743F536E71094',
    bridge_name: undefined
}
const amount = '0.0708'

const relay = new Relay(RELA_URL)

const Ask = () => new Promise<Quote>((resolve, reject) => {
    
    relay.ask({
        bridge,
        amount: amount
    }, {
        OnQuote: (quote: Quote) => {
            console.log('new quote', quote)
            relay.stopAsk()
            resolve(quote)
        }
    })

    setTimeout(() => relay.stopAsk(), 30 * 1000)
})

const doTxOut = (preBusiness: PreBusiness) => new Promise<void>(async (resolve, reject) => {
    console.log('doTxOut')

    const resp = await evm.transferOutByPrivateKey(preBusiness, process.env.WALLET_KEY as string, NETWORK, RPC_BSC)
    console.log('response tx out', resp)
    resolve()
})

const waitTxIn = (preBusiness: PreBusiness) => new Promise<void>(async (resolve, reject) => {
    console.log('waitTxIn')

    let succeed = false

    while (succeed == false) {
        const resp = await relay.getBusiness(preBusiness.hash)
        succeed = resp.step >= 3
        await utils.Sleep(1000)
    }
})

const doTxOutCfm = (preBusiness: PreBusiness) => new Promise<void>(async (resolve, reject) => {
    console.log('doTxOutCfm')

    const resp = await evm.transferOutConfirmByPrivateKey(preBusiness, process.env.WALLET_KEY as string, NETWORK, RPC_BSC)
    console.log('response tx out confirm', resp)
    resolve()
})

const waitTxInCfm = (preBusiness: PreBusiness) => new Promise<void>(async (resolve, reject) => {
    console.log('waitTxInCfm')

    let succeed = false

    while (succeed == false) {
        const resp = await relay.getBusiness(preBusiness.hash)
        succeed = resp.step >= 5
        await utils.Sleep(1000)
    }
})

const swap = async () => {

    const quote = await Ask()

    const signData: {signData: SignData, signed: string} = await evm.signQuoteEIP712ByPrivateKey(NETWORK, quote, process.env.WALLET_KEY as string, amount, 0, '0x1C55a22A2AD9c2921706306ADFBdBee009987fce', 
        undefined, RPC_BSC, RPC_BSC)
    
    console.log('signData', signData)

    const relay = new Relay(RELA_URL)
    const business: PreBusiness = await relay.swap(quote, signData.signData, signData.signed)

    console.log('business', business)

    if (business.locked == true) {
        await doTxOut(business)
        await waitTxIn(business)
        await doTxOutCfm(business)
        await waitTxInCfm(business)
    }
}



swap()

