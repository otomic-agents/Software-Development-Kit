import Otmoic, { Bridge, NetworkType, Quote, SwapSignedData, PreBusiness } from '../src/index';

const RELA_URL = 'https://relay-1.mainnet.otmoic.cloud';
const NETWORK = NetworkType.MAINNET;
const RPC_BSC = undefined;
const RPC_OPT = 'https://optimism.llamarpc.com';

const bridge: Bridge = {
    bridge_id: 1,
    src_chain_id: 9006,
    dst_chain_id: 614,
    src_token: '0x55d398326f99059ff775485246999027b3197955',
    dst_token: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    bridge_name: undefined,
};

const Ask = () =>
    new Promise<Quote>((resolve, reject) => {
        const relay = new Otmoic.Relay(RELA_URL);

        relay.ask(
            {
                bridge,
                amount: '20',
            },
            {
                OnQuote: (quote: Quote) => {
                    console.log('new quote', quote);
                    resolve(quote);
                },
            },
        );

        setTimeout(() => relay.stopAsk(), 30 * 1000);
    });

const doTxOut = () => new Promise<void>((resolve, reject) => {});

const waitTxIn = () => new Promise<void>((resolve, reject) => {});

const doTxOutCfm = () => new Promise<void>((resolve, reject) => {});

const waitTxInCfm = () => new Promise<void>((resolve, reject) => {});

const swap = async () => {
    const quote = await Ask();

    const signData: SwapSignedData = (await Otmoic.business.signQuote(
        NETWORK,
        quote,
        '20',
        0,
        '0x1C55a22A2AD9c2921706306ADFBdBee009987fce',
        undefined,
        undefined,
        undefined,
        RPC_BSC,
        RPC_OPT,
        {
            type: 'privateKey',
            privateKey: process.env.WALLET_KEY as string,
        },
    )) as SwapSignedData;

    console.log('signData', signData);

    const relay = new Otmoic.Relay(RELA_URL);
    const preBusiness: PreBusiness = await relay.swap(quote, signData.signData, signData.signed);

    console.log('preBusiness', preBusiness);

    if (preBusiness.locked) {
        await doTxOut();
        await waitTxIn();
        await doTxOutCfm();
        await waitTxInCfm();
    }
};

swap();
