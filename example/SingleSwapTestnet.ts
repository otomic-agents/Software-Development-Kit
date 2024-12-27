import Otmoic, { Bridge, NetworkType, Quote, SwapSignedData, PreBusiness, Business, SwapType } from '../src/index';

const RELA_URL = 'https://5b4522f4.vaughnmedellins394.myterminus.com';
const NETWORK = NetworkType.TESTNET;
const RPC_BSC = 'https://bsc-testnet-rpc.publicnode.com';

const bridge: Bridge = {
    bridge_id: 3,
    src_chain_id: 9006,
    dst_chain_id: 9006,
    src_token: '0xacda8bf66c2cadac9e99aa1aa75743f536e71094',
    dst_token: '0x57e73db0eebd89f722e064d4c209f86eba9daeec',
    bridge_name: undefined,
};
const amount = '15';

const relay = new Otmoic.Relay(RELA_URL);

const Ask = () =>
    new Promise<Quote>((resolve, reject) => {
        relay.ask(
            {
                bridge,
                amount: amount,
            },
            {
                OnQuote: (quote: Quote) => {
                    console.log('new quote', quote);
                    relay.stopAsk();
                    resolve(quote);
                },
            },
        );

        setTimeout(() => relay.stopAsk(), 30 * 1000);
    });

const doInitSwap = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('init swap');

        const resp = await Otmoic.business.initSwap(preBusiness, NETWORK, RPC_BSC, {
            type: 'privateKey',
            privateKey: process.env.WALLET_KEY as string,
            useMaximumGasPriceAtMost: false,
        });
        console.log('response init swap', resp);
        resolve();
    });

const waitConfirmSwap = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('waitConfirmSwap');

        let succeed = false;

        while (succeed == false) {
            const resp = (await relay.getBusiness(preBusiness.hash)) as Business;
            succeed = resp.single_swap_step >= 3;
            console.log('waitConfirmSwap', resp.single_swap_step);
            await Otmoic.utils.Sleep(1000);
        }

        resolve();
    });

const swap = async () => {
    const quote = await Ask();

    const signData: SwapSignedData = (await Otmoic.business.signQuote(
        NETWORK,
        quote,
        amount,
        0,
        '0x945e9704D2735b420363071bB935ACf2B9C4b814',
        undefined,
        undefined,
        undefined,
        RPC_BSC,
        RPC_BSC,
        {
            swapType: SwapType.SINGLECHAIN,
            type: 'privateKey',
            privateKey: process.env.WALLET_KEY as string,
        },
    )) as SwapSignedData;

    console.log('signData', signData);

    const relay = new Otmoic.Relay(RELA_URL);
    const preBusiness: PreBusiness = await relay.swap(quote, signData.signData, signData.signed, SwapType.SINGLECHAIN);

    console.log('preBusiness', preBusiness);

    if (preBusiness.locked == true) {
        await doInitSwap(preBusiness);
        await waitConfirmSwap(preBusiness);
        console.log('swap success');
        process.exit(0);
    }
};

swap();
