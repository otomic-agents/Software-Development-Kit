import Otmoic, { Bridge, Quote } from '../src/index';

const RELA_URL = 'https://5b4522f4.pixelwave.olares.com';

const bridge: Bridge = {
    bridge_id: 35,
    src_chain_id: 614,
    dst_chain_id: 501,
    src_token: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    dst_token: '0xc6fa7af3bedbad3a3d65f36aabc97431b1bbe4c2d2f6e0e47ca60203452f5d61',
    bridge_name: undefined,
};

const Ask = async () => {
    const relay = new Otmoic.Relay(RELA_URL);

    relay.ask(
        {
            bridge,
            amount: '0.1',
        },
        {
            OnQuote: (quote: Quote) => {
                console.log('new quote', quote);
            },
        },
    );

    setTimeout(() => {
        console.log('socket id', relay.quoteManager.getSocketId());
    }, 10 * 1000);

    setTimeout(() => relay.stopAsk(), 30 * 1000);
};

Ask();
