import Otmoic, { Business, BusinessFullData, SwapType } from '../src/index';

const RELA_URL = 'https://5b4522f4.pixelwave.olares.com';
const HASH = '0x23078a7199edc16655eac158e62e17680a335357b3798e03f49a27ec31045566';

const GetBusiness = async () => {
    const business: Business = (await new Otmoic.Relay(RELA_URL).getBusiness(HASH)) as Business;
    console.log('business', business);

    const businessFull: BusinessFullData = (await new Otmoic.Relay(RELA_URL).getBusiness(HASH, {
        detailed: true,
        swapType: SwapType.ATOMIC,
    })) as BusinessFullData;
    console.log('full business', businessFull);
};

GetBusiness();
