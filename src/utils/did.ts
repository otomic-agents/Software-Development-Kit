import { ethers } from 'ethers';
import superagent from 'superagent';

export const getDidName = (privateKey: string, network: string) =>
    new Promise<string | undefined>((resolve, reject) => {
        const w = new ethers.Wallet(privateKey);

        superagent
            .get(
                `https://${network == 'mainnet' ? 'did-support.ursa-services.bttcdn.com' : 'testnet-did-support.ursa-services.bttcdn.com'}/find/owner/${w.address}`,
            )
            .set('Content-Type', 'application/json')
            .then((resp) => {
                if (resp.statusCode == 200 && resp.body.data != undefined && resp.body.data.length > 0) {
                    resolve(resp.body.data[0].name);
                } else {
                    resolve(undefined);
                }
            })
            .catch((error) => {
                resolve(undefined);
            });
    });
