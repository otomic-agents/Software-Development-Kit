import needle from 'needle';

export interface ComplaintValue {
    srcChainId: string;
    srcAddress: string;
    srcToken: string;
    dstChainId: string;
    dstAddress: string;
    dstToken: string;
    srcAmount: string;
    dstAmount: string;
    dstNativeAmount: string;
    requestor: string;
    lpId: string;
    expectedSingleStepTime: string;
    tolerantSingleStepTime: string;
    earliestRefundTime: string;
    agreementReachedTime: string;
    userSign: string;
    lpSign: string;
}

export const submitComplain = (network: string, value: ComplaintValue, signed: string, name: string) =>
    new Promise<boolean | string>(async (resolve, reject) => {
        needle(
            'post',
            `https://${network == 'mainnet' ? 'reputation-agent-mainnet' : 'reputation-agent'}.otmoic.cloud/submit-complaint`,
            {
                params: [value, signed, name.replace('@', '.')],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        )
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
