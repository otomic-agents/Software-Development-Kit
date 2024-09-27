import { ethers } from 'ethers';
import { _getComplainSignData } from '../../business/evm';
import { PreBusiness } from '../../interface/interface';

export const _signComplainEIP712ByPrivateKey = (preBusiness: PreBusiness, privateKey: string, network: string) =>
    new Promise<{ signData: any; signed: string }>(async (resolve, reject) => {
        const signData = await _getComplainSignData(preBusiness, network);

        const w = new ethers.Wallet(privateKey);
        const signed = await w.signTypedData(signData.domain, signData.types, signData.message);

        resolve({
            signData,
            signed,
        });
    });
