import { ethers } from 'ethers';
import { _getSignDataEIP712 } from '../../business/evm';
import { Quote, SwapSignData, SwapSignedData, NetworkType, SwapType } from '../../interface/interface';
import { mathReceived } from '../../utils/math';

export const _signQuoteEIP712ByPrivateKey = (
    quote: Quote,
    privateKey: string,
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

            const web3Wallet = new ethers.Wallet(privateKey);

            signData.message.requestor = web3Wallet.address;

            const signed = await web3Wallet.signTypedData(
                signData.domain!,
                { Message: signData.types!.Message },
                signData.message,
            );

            resolve({
                signData,
                signed,
            });
        } catch (error) {
            reject(error);
        }
    });
