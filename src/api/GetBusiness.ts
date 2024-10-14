import superagent from 'superagent'
import { Business, BusinessFullData } from '../interface/interface';

export const _getBusiness = (relayUrl: string, hash: string) =>
    new Promise<Business>((resolve, reject) => {
        superagent
            .post(`${relayUrl}/relay/web/fetch_business`)
            .send({
                business_hash: hash,
            }).then((resp) => {
                if (resp.statusCode == 200) {
                    resolve(resp.body.business);
                } else {
                    reject(`server error ${resp.statusCode}, URL: ${relayUrl}/relay/web/fetch_business`);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });

export const _getBusinessFull = (relayUrl: string, hash: string) =>
    new Promise<BusinessFullData>((resolve, reject) => {
        superagent
            .post(`${relayUrl}/relay/web/fetch_business_hash`)
            .send({
                business_hash: hash,
            }).then((resp) => {
                if (resp.statusCode == 200) {
                    resolve(resp.body.result);
                } else {
                    reject(`server error ${resp.statusCode}, URL: ${relayUrl}/relay/web/fetch_business_hash`);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
