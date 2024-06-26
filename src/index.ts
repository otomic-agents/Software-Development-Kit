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


import { getChainName, getChainType } from './utils/chain';
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
import { _transferOutRefundByPrivateKey } from './api/evm/TransferOutRefundByPrivateKey';
import { _transferOutRefundByMetamaskAPI } from './api/evm/TransferOutRefundByMetamaskAPI';
import { _getHistory } from './api/GetHistory';
import { _getBusiness } from './api/GetBusiness';
import { _getBridge } from './api/GetBridge';
import { QuoteManager } from "./api/Quote";
import { mathReceived } from './utils/math';
import { getBalance } from './api/GetBalance';

import { _getSignDataEIP712 as _getSignDataSolana, _getSignPreambleEIP712} from './business/solana';
import { _signQuoteByPrivateKey } from './api/solana/SignQuoteByPrivateKey';
import { _signQuoteByWalletPlugin } from './api/solana/SignQuoteByWalletPlugin';
import { _transferOutByPrivateKey as _transferOutSolanaByPrivateKey } from './api/solana/TransferOutByPrivateKey';
import { _transferOutByWalletPlugin } from './api/solana/TransferOutByWalletPlugin';
import { _transferOutConfirmByPrivateKey as _transferOutConfirmSolanaByPrivateKey } from './api/solana/TransferOutConfirmByPrivateKey';
import { _transferOutConfirmByWalletPlugin } from './api/solana/TransferOutConfirmByWalletPlugin';
import { _transferOutRefundByPrivateKey as _transferOutRefundSolanaByPrivateKey } from './api/solana/TransferOutRefundByPrivateKey';
import { _transferOutRefundByWalletPlugin } from './api/solana/TransferOutRefundByWalletPlugin';

export namespace utils {
    export const GetChainName = getChainName;
    export const GetChainId = getChainId;
    export const Sleep = sleep;
    export const MathReceived = mathReceived;
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

    export const transferOutRefundByPrivateKey = 
        (preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined) =>
            _transferOutRefundByPrivateKey(preBusiness, privateKey, network, rpc)

    export const transferOutRefundByMetamaskAPI = 
        (preBusiness: PreBusiness, metamaskAPI: any, network: string, rpc: string | undefined) =>
            _transferOutRefundByMetamaskAPI(preBusiness, metamaskAPI, network, rpc)
}

export namespace solana {
    export const getSignData = _getSignDataSolana;
    export const getSignPreamble = _getSignPreambleEIP712
    export const signQuoteByPrivateKey = 
        (network: string, quote: Quote, privateKey: string, amount: string, swapToNative: number, 
            receivingAddress: string, stepTimeLock: number | undefined, rpcSrc: string | undefined, 
            rpcDst: string | undefined) => _signQuoteByPrivateKey(
                quote, privateKey, network, amount, swapToNative, receivingAddress, stepTimeLock, rpcSrc, rpcDst)

    export const signQuoteByWalletPlugin = 
        (network: string, quote: Quote, phantomAPI: any, sender: string, amount: string,
             swapToNative: number, receivingAddress: string, stepTimeLock: number | undefined, 
             rpcSrc: string | undefined, rpcDst: string | undefined) => _signQuoteByWalletPlugin(
                quote, phantomAPI, sender, network, amount, swapToNative, receivingAddress, stepTimeLock, rpcSrc, rpcDst)
    
    export const transferOutByPrivateKey = 
        (uuid: string, preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined) => 
            _transferOutSolanaByPrivateKey(uuid, preBusiness, privateKey, network, rpc)
    
    export const transferOutByWalletPlugin = 
        (uuid: string, preBusiness: PreBusiness, phantomAPI: any, network: string, rpc: string | undefined) => 
            _transferOutByWalletPlugin(uuid, preBusiness, phantomAPI, network, rpc)

    export const transferOutConfirmByPrivateKey = 
        (uuid: string, preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined) => 
            _transferOutConfirmSolanaByPrivateKey(uuid, preBusiness, privateKey, network, rpc)

    export const transferOutConfirmByWalletPlugin =
        (uuid: string, preBusiness: PreBusiness, metamaskAPI: any, network: string, rpc: string | undefined) => 
            _transferOutConfirmByWalletPlugin(uuid, preBusiness, metamaskAPI, network, rpc)

    export const transferOutRefundByPrivateKey = 
        (uuid: string, preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined) =>
            _transferOutRefundSolanaByPrivateKey(uuid, preBusiness, privateKey, network, rpc)

    export const transferOutRefundByWalletPlugin = 
        (uuid: string, preBusiness: PreBusiness, metamaskAPI: any, network: string, rpc: string | undefined) =>
            _transferOutRefundByWalletPlugin(uuid, preBusiness, metamaskAPI, network, rpc)
}

export namespace business {
    export const signQuoteByPrivateKey = 
        (network: string, quote: Quote, privateKey: string, amount: string, swapToNative: number, 
            receivingAddress: string, stepTimeLock: number | undefined, rpcSrc: string | undefined, 
            rpcDst: string | undefined) => {

        switch (getChainType(quote.quote_base.bridge.src_chain_id)) {
            case 'evm':
                return evm.signQuoteEIP712ByPrivateKey(network, quote, privateKey, amount, swapToNative, 
                    receivingAddress, stepTimeLock, rpcSrc, rpcDst)

            case 'solana':
                return solana.signQuoteByPrivateKey(network, quote, privateKey, amount, swapToNative,
                    receivingAddress, stepTimeLock, rpcSrc, rpcDst)
        
            default:
                throw new Error(`not support chain: ${quote.quote_base.bridge.src_chain_id}`);
        }
    }

    export const transferOutByPrivateKey =
        (preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined, uuid?: string) => {
        
        switch (getChainType(preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id)) {
            case 'evm':
                return evm.transferOutByPrivateKey(preBusiness, privateKey, network, rpc)
            
            case 'solana':
                return solana.transferOutByPrivateKey(uuid!, preBusiness, privateKey, network, rpc)
        
            default:
                throw new Error(`not support chain: ${preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id}`);
        }

    }

    export const transferOutConfirmByPrivateKey = 
        (preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined, uuid?: string) => {
                  
        switch (getChainType(preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id)) {
            case 'evm':
                return evm.transferOutConfirmByPrivateKey(preBusiness, privateKey, network, rpc)

            case 'solana':
                return solana.transferOutConfirmByPrivateKey(uuid!, preBusiness, privateKey, network, rpc)
        
            default:
                throw new Error(`not support chain: ${preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id}`);
        }
    }

    export const transferOutRefundByPrivateKey =
        (preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined, uuid?: string) => {

        switch (getChainType(preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id)) {
            case 'evm':
                return evm.transferOutRefundByPrivateKey(preBusiness, privateKey, network, rpc)

            case 'solana':
                return solana.transferOutRefundByPrivateKey(uuid!, preBusiness, privateKey, network, rpc)
        
            default:
                throw new Error(`not support chain: ${preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id}`);
        }
    }

}

export namespace assistive {
    export const TranslateBridge = translateBridge;
    export const GetBalance = getBalance;
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