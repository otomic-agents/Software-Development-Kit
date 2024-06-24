import { _getSignDataEIP712 } from "../../business/evm";
import { Quote, SignData } from "../../interface/interface";
import { mathReceived } from "../../utils/math";
import { decodeUTF8 } from 'tweetnacl-util';
import * as nacl from 'tweetnacl';

export const _signQuoteByPrivateKey = 
    (quote: Quote, privateKey: string, network: string, amount: string, swapToNative: number, receivingAddress: string,
    stepTimeLock: number | undefined, rpcSrc: string | undefined, rpcDst: string | undefined) => 
        new Promise<void>(async (resolve, reject) => {
        
    const {dstAmount, dstNativeAmount} = mathReceived(quote, amount, swapToNative)
    
    const signData: SignData = await _getSignDataEIP712(quote, network, amount, dstAmount, dstNativeAmount, swapToNative, receivingAddress, stepTimeLock, rpcSrc, rpcDst)

})





