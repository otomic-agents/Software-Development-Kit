import { ethers } from "ethers";
import { _getSignDataEIP712 } from "../../business/evm";
import { Quote, SignData } from "../../interface/interface";
import { mathReceived } from "../../utils/math";

export const _signQuoteEIP712ByPrivateKey = (quote: Quote, privateKey: string, network: string, amount: string, swapToNative: number, receivingAddress: string, stepTimeLock: number | undefined, rpcSrc: string | undefined, rpcDst: string | undefined) => new Promise<{signData: SignData, signed: string}>(async (resolve, reject) => {
    const {dstAmount, dstNativeAmount} = mathReceived(quote, amount, swapToNative)
    
    const signData: SignData = await _getSignDataEIP712(quote, network, amount, dstAmount, dstNativeAmount, swapToNative, receivingAddress, stepTimeLock, rpcSrc, rpcDst)

    const web3Wallet = new ethers.Wallet(privateKey)

    signData.message.requestor = web3Wallet.address

    const signed = await web3Wallet.signTypedData(signData.domain, signData.types, signData.message)

    resolve({
        signData,
        signed
    })
})
