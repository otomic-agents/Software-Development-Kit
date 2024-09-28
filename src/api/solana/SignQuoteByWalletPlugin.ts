import { decodeUTF8 } from 'tweetnacl-util';
import { _getSignDataEIP712, _getSignPreambleEIP712 } from '../../business/solana';
import { Quote } from '../../interface/interface';
import { mathReceived } from '../../utils/math';

export const _signQuoteByWalletPlugin = (
    quote: Quote,
    phantomAPI: any,
    sender: string,
    network: string,
    amount: string,
    swapToNative: number,
    receivingAddress: string,
    stepTimeLock: number | undefined,
    rpcSrc: string | undefined,
    rpcDst: string | undefined,
) =>
    new Promise<{ signData: any; signed: string }>(async (resolve, reject) => {
        try {
            const { dstAmount, dstNativeAmount } = mathReceived(quote, amount, swapToNative);

            const signData = await _getSignDataEIP712(
                quote,
                network,
                amount,
                dstAmount,
                dstNativeAmount,
                swapToNative,
                receivingAddress,
                stepTimeLock,
                rpcSrc,
                rpcDst,
            );
            signData.message.requestor = sender;

            // let contractAddress = new PublicKey(getOtmoicAddressBySystemChainId(quote.quote_base.bridge.src_chain_id, network))
            // let signerPubkey = new PublicKey(sender)
            // let msgLen = decodeUTF8(signDataStr).length
            // const signPreamble = _getSignPreambleEIP712(contractAddress, [signerPubkey], msgLen)

            let messageBytes = decodeUTF8(JSON.stringify(signData.message));

            const signedMessage = await phantomAPI.signMessage(messageBytes, 'utf8');

            resolve({
                signData: signData,
                signed: Buffer.from(signedMessage.signature).toString('hex'),
            });
        } catch (error) {
            reject(error);
        }
    });
