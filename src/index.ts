import { Bridge } from './interface/interface'
export { Bridge };
import { OnQuoteIF } from './interface/interface'
export { OnQuoteIF };
import { AskIF } from './interface/interface'
export { AskIF };
import { Quote } from './interface/interface'
export { Quote };
import { LpInfo } from './interface/interface'
export { LpInfo };
import { AuthenticationLimiter } from './interface/interface'
export { AuthenticationLimiter };
import { QuoteBase } from './interface/interface'
export { QuoteBase };

import { getChainId } from './utils/chain';
import { getSignDataEIP712 } from './business/evm';
import { _signQuoteEIP712ByPrivateKey } from "./api/SignQuoteEIP712ByPrivateKey";
import { _signQuoteEIP712ByMetamaskAPI } from './api/SignQuoteEIP712ByMetamaskAPI';

import { _getBridge } from './api/GetBridge';
import { QuoteManager } from "./api/Quote";

export namespace utils {
    export const GetChainId = getChainId;
}

export namespace evm {
    export const GetSignDataEIP712 = getSignDataEIP712;
    export const signQuoteEIP712ByPrivateKey = (network: string, quote: Quote, privateKey: string, amount: string, swapToNative: number, receivingAddress: string, stepTimeLock: number | undefined) => _signQuoteEIP712ByPrivateKey(quote, privateKey, network, amount, swapToNative, receivingAddress, stepTimeLock)
    export const signQuoteEIP712ByMetamaskAPI = (network: string, quote: Quote, metamaskAPI: any, sender: string, amount: string, swapToNative: number, receivingAddress: string, stepTimeLock: number | undefined) => _signQuoteEIP712ByMetamaskAPI(quote, metamaskAPI, sender, network, amount, swapToNative, receivingAddress, stepTimeLock)
}

export class Relay {

    relayUrl: string

    network: string = 'mainnet'

    quoteManager: QuoteManager = new QuoteManager()

    constructor(relay: string) {
        if (relay == undefined) {
            throw new Error("The relay parameter is required. ");
        }

        this.relayUrl = relay
    }

    getBridge = () => _getBridge(this.relayUrl)

    ask = (askIF: AskIF, callback: OnQuoteIF) => this.quoteManager.ask(askIF, callback, this.relayUrl)

    stopAsk = () => this.quoteManager.stopAsk()


    swap = (quote: Quote, privateKey: string) => {

    }
}

export namespace Otmoic {
    export type BridgeIF = Bridge;

    export type RelayImp = Relay;
}

export default Otmoic