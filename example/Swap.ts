import { evm } from "../src"
import { Bridge, Relay, Quote } from '../src/index'

const RELA_URL = 'https://relay-1.mainnet.otmoic.cloud'
const NETWORK = 'testnet'

const bridge: Bridge = {
    bridge_id: 1,
    src_chain_id: 9006,
    dst_chain_id: 614,
    src_token: '0x55d398326f99059ff775485246999027b3197955',
    dst_token: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58'
}

const Ask = () => new Promise<Quote>((resolve, reject) => {
    const relay = new Relay(RELA_URL)

    relay.ask({
        bridge,
        amount: '20'
    }, {
        OnQuote: (quote: Quote) => {
            console.log('new quote', quote)
            resolve(quote)
        }
    })

    setTimeout(() => relay.stopAsk(), 30 * 1000)
})


const swap = async () => {

    const quote = await Ask()

    // evm.signQuoteEIP712ByPrivateKey(NETWORK, quote, )
}

swap()