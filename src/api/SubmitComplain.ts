import superagent from 'superagent';
import { NetworkType, ComplaintValue } from '../interface/interface';

export const submitComplain = (network: NetworkType, value: ComplaintValue, signed: string, name: string) =>
    new Promise<boolean | string>(async (resolve, reject) => {
        superagent
            .post(
                `https://${network == NetworkType.MAINNET ? 'reputation-agent-mainnet' : 'reputation-agent'}.otmoic.cloud/submit-complaint`,
            )
            .send({
                params: [value, signed, name.replace('@', '.')],
            })
            .set('Content-Type', 'application/json')
            .then((resp) => {
                if (resp.body.code != 0) {
                    resolve(`submit failed: ${resp.body.message}`);
                } else {
                    resolve(true);
                }
            })
            .catch((error) => {
                resolve(`submit failed: ${error}`);
            });
    });
