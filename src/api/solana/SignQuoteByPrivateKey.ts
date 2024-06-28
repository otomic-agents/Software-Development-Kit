import { PublicKey, Keypair } from "@solana/web3.js";
import { decodeUTF8 } from 'tweetnacl-util';
import * as nacl from 'tweetnacl';
import { _getSignDataEIP712, _getSignPreambleEIP712 } from "../../business/solana";
import { Quote } from "../../interface/interface";
import { mathReceived } from "../../utils/math";
import { getOtmoicAddressBySystemChainId } from "../../utils/chain";

export const _signQuoteByPrivateKey = 
    (quote: Quote, privateKey: string, network: string, amount: string, swapToNative: number, receivingAddress: string,
    stepTimeLock: number | undefined, rpcSrc: string | undefined, rpcDst: string | undefined) => 
        new Promise<{signData: any, signed: string}>(async (resolve, reject) => {
        
    const {dstAmount, dstNativeAmount} = mathReceived(quote, amount, swapToNative)
    
    const signData = await _getSignDataEIP712(quote, network, amount, dstAmount, dstNativeAmount, swapToNative, receivingAddress, stepTimeLock, rpcSrc, rpcDst)
    const signDataStr = JSON.stringify(signData)

    let contractAddress = new PublicKey(getOtmoicAddressBySystemChainId(quote.quote_base.bridge.src_chain_id, network))
    let keypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(privateKey, 'hex')))
    let signerPubkeys = [keypair.publicKey]
    let msgLen = decodeUTF8(signDataStr).length

    const signPreamble = _getSignPreambleEIP712(contractAddress, signerPubkeys, msgLen)
    let messageBytes = decodeUTF8(signDataStr)
    let signed = nacl.sign.detached(messageBytes, keypair.secretKey);
    
    resolve({
        signData: signDataStr,
        signed: '0x' + Buffer.from(signed).toString('hex')
    })
})