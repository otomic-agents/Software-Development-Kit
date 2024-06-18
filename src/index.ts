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
import { SignData } from './interface/interface';
export { SignData };
import { PreBusiness } from './interface/interface';
export { PreBusiness };
import { BusinessFullData } from './interface/interface';
export { BusinessFullData };
import { Business } from './interface/interface';
export { Business };
import { TranslatedBridge } from './interface/api';
export { TranslatedBridge }


import { getChainId } from './utils/chain';
import { sleep } from './utils/sleep';
import { translateBridge } from './api/TranslateBridge';
import { _getSignDataEIP712 } from './business/evm';
import { _signQuoteEIP712ByPrivateKey } from "./api/evm/SignQuoteEIP712ByPrivateKey";
import { _signQuoteEIP712ByMetamaskAPI } from './api/evm/SignQuoteEIP712ByMetamaskAPI';
import { _swap } from './api/Swap';
import { _transferOutByPrivateKey } from './api/evm/TransferOutByPrivateKey'; 
import { _transferOutByMetamaskAPI } from './api/evm/TransferOutByMetamaskAPI';
import { _transferOutConfirmByPrivateKey } from './api/evm/TransferOutConfirmByPrivateKey';
import { _transferOutConfirmByMetamaskAPI } from './api/evm/TransferOutConfirmByMetamaskAPI';
import { _getHistory } from './api/GetHistory';
import { _getBusiness } from './api/GetBusiness';
import { _getBridge } from './api/GetBridge';
import { QuoteManager } from "./api/Quote";

export namespace utils {
    export const GetChainId = getChainId;
    export const Sleep = sleep;
}

export namespace evm {
    export const getSignDataEIP712 = _getSignDataEIP712;
    export const signQuoteEIP712ByPrivateKey = 
        (network: string, quote: Quote, privateKey: string, amount: string, swapToNative: number, 
            receivingAddress: string, stepTimeLock: number | undefined, rpcSrc: string | undefined, 
            rpcDst: string | undefined) => _signQuoteEIP712ByPrivateKey(
                quote, privateKey, network, amount, swapToNative, receivingAddress, stepTimeLock, rpcSrc, rpcDst)

    export const signQuoteEIP712ByMetamaskAPI = 
        (network: string, quote: Quote, metamaskAPI: any, sender: string, amount: string,
             swapToNative: number, receivingAddress: string, stepTimeLock: number | undefined, 
             rpcSrc: string | undefined, rpcDst: string | undefined) => _signQuoteEIP712ByMetamaskAPI(
                quote, metamaskAPI, sender, network, amount, swapToNative, receivingAddress, stepTimeLock, rpcSrc, rpcDst)
    
    export const transferOutByPrivateKey = 
        (preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined) => 
            _transferOutByPrivateKey(preBusiness, privateKey, network, rpc)
    
    export const transferOutByMetamaskAPI = 
        (preBusiness: PreBusiness, metamaskAPI: any, network: string, rpc: string | undefined) => 
            _transferOutByMetamaskAPI(preBusiness, metamaskAPI, network, rpc)

    export const transferOutConfirmByPrivateKey = 
        (preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined) => 
            _transferOutConfirmByPrivateKey(preBusiness, privateKey, network, rpc)

    export const transferOutConfirmByMetamaskAPI =
        (preBusiness: PreBusiness, metamaskAPI: any, network: string, rpc: string | undefined) => 
            _transferOutConfirmByMetamaskAPI(preBusiness, metamaskAPI, network, rpc)
}

export namespace assistive {
    export const TranslateBridge = translateBridge;
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

    swap = (quote: Quote, signData: SignData, signed: string,) => _swap(quote, signData, signed, this.relayUrl)

    getHistory = (address: string) => _getHistory(this.relayUrl, address)

    getBusiness = (hash: string) => _getBusiness(this.relayUrl, hash)
}

export namespace Otmoic {
    export type BridgeIF = Bridge;

    export type RelayImp = Relay;
}

export default Otmoic