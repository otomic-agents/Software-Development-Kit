import superagent from 'superagent'
import { PreBusiness, Quote, SignData } from '../interface/interface';

export const _swap = (quote: Quote, signData: SignData, signed: string, relayUrl: string) =>
    new Promise<PreBusiness>((resolve, reject) => {
        const data = {
            quote: quote,
            bridge_name: quote.quote_base.bridge.bridge_name,
            lp_id_fake: quote.lp_info.lp_id_fake,

            // TODO FIXME: near need this value to match token
            append_information: JSON.stringify({ user_account_id: signData.message.dst_address }),

            // TODO : This value can be different from requestor.
            sender: signData.message.requestor,

            amount: signData.message.src_amount,
            expected_single_step_time: signData.message.expected_single_step_time,
            tolerant_single_step_time: signData.message.tolerant_single_step_time,
            earliest_refund_time: signData.message.earliest_refund_time,
            dst_address: signData.message.dst_address,
            dst_amount: signData.message.dst_amount,
            dst_native_amount: signData.message.dst_native_amount,
            agreement_reached_time: signData.message.agreement_reached_time,
            requestor: signData.message.requestor,
            user_sign: signed,
        };

        superagent
            .post(`${relayUrl}/relay/web/quote_confirmation`)
            .send(data)
            .set('Content-Type', 'application/json')
            .then((resp) => {
                if (resp.statusCode == 200) {
                    resolve(resp.body.pre_business);
                } else {
                    reject(`server error ${resp.statusCode}, URL: ${relayUrl}/relay/web/quote_confirmation`);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
