import { _getComplainSignData } from '../../business/evm';
import { PreBusiness, NetworkType, ComplainSignedData } from '../../interface/interface';

export const _signComplainEIP712ByTermiPass = (
    preBusiness: PreBusiness,
    termiPassAPI: any,
    network: NetworkType,
): Promise<ComplainSignedData> =>
    new Promise<{ signData: any; signed: string }>(async (resolve, reject) => {
        try {
            const signData = _getComplainSignData(preBusiness, network);

            const signed = await termiPassAPI.signTypeData(
                signData.domain,
                signData.types,
                signData.message,
                'Complaint',
            );

            resolve({
                signData,
                signed,
            });
        } catch (error) {
            reject(error);
        }
    });
