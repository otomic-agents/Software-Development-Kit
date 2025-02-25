import Otmoic, { Business, BusinessFullData, SwapType } from '../src/index';

const RELA_URL = 'https://5b4522f4.vaughnmedellins394.myterminus.com';
const HASH = '0x17cc06ad0917d86bd89fa98cc5a19c8fb786c3db5acd7af93f1e7fc11ddff1c4';

const GetBusiness = async () => {
    const business: Business = (await new Otmoic.Relay(RELA_URL).getBusiness(HASH)) as Business;
    console.log('business', business);

    const businessFull: BusinessFullData = (await new Otmoic.Relay(RELA_URL).getBusiness(HASH, {
        detailed: true,
        swapType: SwapType.SINGLECHAIN,
    })) as BusinessFullData;
    console.log('full business', businessFull);
};

GetBusiness();
