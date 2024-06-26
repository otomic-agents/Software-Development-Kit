import { PublicKey } from "@solana/web3.js";
import { decodeUTF8 } from 'tweetnacl-util';
import { _getSignDataEIP712, _getSignPreambleEIP712 } from "../../business/solana";
import { Quote } from "../../interface/interface";
import { mathReceived } from "../../utils/math";
import { getOtmoicAddressBySystemChainId } from "../../utils/chain";

export const _signQuoteByWalletPlugin = (quote: Quote, phantomAPI: any, sender: string, network: string, amount: string, swapToNative: number, receivingAddress: string, stepTimeLock: number | undefined, rpcSrc: string | undefined, rpcDst: string | undefined) => new Promise<{signData: any, signed: string}>(async (resolve, reject) => {
    const {dstAmount, dstNativeAmount} = mathReceived(quote, amount, swapToNative)
    
    const signData = await _getSignDataEIP712(quote, network, amount, dstAmount, dstNativeAmount, swapToNative, receivingAddress, stepTimeLock, rpcSrc, rpcDst)
    const signDataStr = JSON.stringify(signData)

    let contractAddress = new PublicKey(getOtmoicAddressBySystemChainId(quote.quote_base.bridge.src_chain_id, network))
    let signerPubkey = new PublicKey(sender)
    let msgLen = Buffer.from(signDataStr).length

    const signPreamble = _getSignPreambleEIP712(contractAddress, [signerPubkey], msgLen)
    let messageBytes = decodeUTF8(signPreamble.toString('base64') + signDataStr)

    const signedMessage = await phantomAPI.signMessage(messageBytes, "utf8")

    resolve({
        signData: signPreamble.toString('base64') + signDataStr,
        signed: '0x' + Buffer.from(signedMessage.signature).toString('hex')
    })
})