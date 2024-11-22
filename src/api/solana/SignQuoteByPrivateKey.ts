import { Keypair } from '@solana/web3.js';
import { decodeUTF8 } from 'tweetnacl-util';
import * as nacl from 'tweetnacl';
import { _getSignDataEIP712, _getSignPreambleEIP712 } from '../../business/solana';
import { Quote } from '../../interface/interface';
import { mathReceived } from '../../utils/math';
import { removePrefix0x } from '../../utils/format';

export const _signQuoteByPrivateKey = (
    quote: Quote,
    privateKey: string,
    network: string,
    amount: string,
    swapToNative: number,
    receivingAddress: string,
    expectedSingleStepTime: number | undefined,
    tolerantSingleStepTime: number | undefined,
    earliestRefundTime: number | undefined,
    rpcSrc: string | undefined,
    rpcDst: string | undefined,
) =>
    new Promise<{ signData: any; signed: string }>(async (resolve, reject) => {
        try {
            const { dstAmount, dstNativeAmount } = mathReceived(quote, amount, swapToNative);
            let keypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(removePrefix0x(privateKey), 'hex')));

            const signData = await _getSignDataEIP712(
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
            );
            signData.message.requestor = keypair.publicKey.toBase58();

            // let contractAddress = new PublicKey(getOtmoicAddressBySystemChainId(quote.quote_base.bridge.src_chain_id, network))
            // let signerPubkeys = [keypair.publicKey]
            // let msgLen = decodeUTF8(signDataStr).length
            // const signPreamble = _getSignPreambleEIP712(contractAddress, signerPubkeys, msgLen)

            let messageBytes = decodeUTF8(JSON.stringify(signData.message));
            let signed = nacl.sign.detached(messageBytes, keypair.secretKey);

            resolve({
                signData: signData,
                signed: Buffer.from(signed).toString('hex'),
            });
        } catch (error) {
            reject(error);
        }
    });
