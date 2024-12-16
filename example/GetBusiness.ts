import Otmoic, { Business, BusinessFullData } from '../src/index';

const RELA_URL = 'https://5b4522f4.vaughnmedellins394.myterminus.com';
const HASH = '0x1c50cc3703554bd3ab3f92b62710148d25ea9e36021c8ddfe42ae19bd383647d';

const GetBusiness = async () => {
    const business: Business = (await new Otmoic.Relay(RELA_URL).getBusiness(HASH)) as Business;
    console.log('business', business);

    const businessFull: BusinessFullData = (await new Otmoic.Relay(RELA_URL).getBusiness(HASH, {
        detailed: true,
    })) as BusinessFullData;
    console.log('full business', businessFull);
};

GetBusiness();
