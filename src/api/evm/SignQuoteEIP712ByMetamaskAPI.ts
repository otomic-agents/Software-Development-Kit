import { _getSignDataEIP712 } from "../../business/evm"
import { Quote, SignData } from "../../interface/interface"
import { mathReceived } from "../../utils/math"


export const _signQuoteEIP712ByMetamaskAPI = (quote: Quote, metamaskAPI: any, sender: string, network: string, amount: string, swapToNative: number, receivingAddress: string, stepTimeLock: number | undefined, rpcSrc: string | undefined, rpcDst: string | undefined) => new Promise<{signData: SignData, signed: string}>(async (resolve, reject) => {
    const {dstAmount, dstNativeAmount} = mathReceived(quote, amount, swapToNative)
    
    const signData: SignData = await _getSignDataEIP712(quote, network, amount, dstAmount, dstNativeAmount, swapToNative, receivingAddress, stepTimeLock, rpcSrc, rpcDst)

    signData.message.requestor = sender

    const signed = await metamaskAPI.request({
        method: 'eth_signTypedData_v4',
        params: [sender, signData],
    });

    resolve({
        signData,
        signed
    })
})