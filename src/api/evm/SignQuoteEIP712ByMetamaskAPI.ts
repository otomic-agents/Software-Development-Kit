import { _getSignDataEIP712 } from '../../business/evm';
import { Quote, SwapSignData, SwapSignedData, NetworkType, SwapType } from '../../interface/interface';
import { mathReceived } from '../../utils/math';

export const _signQuoteEIP712ByMetamaskAPI = (
    quote: Quote,
    metamaskAPI: any,
    sender: string,
    network: NetworkType,
    amount: string,
    swapToNative: number,
    receivingAddress: string,
    expectedSingleStepTime: number | undefined,
    tolerantSingleStepTime: number | undefined,
    earliestRefundTime: number | undefined,
    rpcSrc: string | undefined,
    rpcDst: string | undefined,
    swapType: SwapType,
) =>
    new Promise<SwapSignedData>(async (resolve, reject) => {
        try {
            const { dstAmount, dstNativeAmount } = mathReceived(quote, amount, swapToNative);

            const signData: SwapSignData = await _getSignDataEIP712(
                quote,
                network,
                amount,
                dstAmount,
                dstNativeAmount,
                swapToNative,
                receivingAddress,
                expectedSingleStepTime,
                tolerantSingleStepTime,
                earliestRefundTime,
                rpcSrc,
                rpcDst,
                swapType,
            );

            signData.message.requestor = sender;

            const signed = await metamaskAPI.request({
                method: 'eth_signTypedData_v4',
                params: [sender, signData],
            });

            resolve({
                signData,
                signed,
            });
        } catch (error) {
            reject(error);
        }
    });
