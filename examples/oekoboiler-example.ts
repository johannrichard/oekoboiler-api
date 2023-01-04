// Construct your API instance
import OekoboilerApi from 'oekoboiler-api-client';

const oekoboiler = new OekoboilerApi(
  process.env.OB_USER_MAIL || '',
  process.env.OB_USER_PASSWORD || ''
);

console.log(`Display Boiler ${process.env.OB_DSN}`);
oekoboiler
  .getBoiler(process.env.OB_DSN || '')
  .then(boiler => {
    console.info(boiler);
  })
  .then(() => {
    /***
     * If you wish to iterate over a number of boilers, do as follows:
     *
     */

    console.log('Iterating over all your Boilers');
    oekoboiler.getDevices().then(devices => {
      devices.forEach(boilerDevice => {
        console.info((boilerDevice as unknown) as string);
        oekoboiler.getBoiler(boilerDevice.device.dsn).then(boiler => {
          console.info(boiler);
        });
      });
    });
  });
