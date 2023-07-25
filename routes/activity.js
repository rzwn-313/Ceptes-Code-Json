const { v1: Uuidv1 } = require('uuid');
const JWT = require('../utils/jwtDecoder');
const SFClient = require('../utils/sfmc-client');
const logger = require('../utils/logger');
const axios = require('axios');

const marketingCloudConfig = {
  clientId: process.env.SFMC_CLIENT_ID,
  clientSecret: process.env.SFMC_CLIENT_SECRET,
  subdomain: process.env.SFMC_SUBDOMAIN,
  testApiUrl: process.env.TEST_API_URL,
  dataExtensionKey: process.env.DATA_EXTENSION_EXTERNAL_KEY,
};

/**
 * The Journey Builder calls this method for each contact processed by the journey.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.execute = async (req, res) => {
  console.log('EXECUTE', req.body);
  // decode data
  const data = JWT(req.body);
  logger.info(data);
  const { clientId, clientSecret, subdomain } = marketingCloudConfig;
  // Get access token
  const tokenResponse = await axios.post(
    `https://${subdomain}.auth.marketingcloudapis.com/v2/token`,
    `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  );
  const accessToken = tokenResponse.data.access_token;
  console.log('/accessToken', accessToken);
  // Retrieve data from the data extension
  const response = await axios.get(
    `https://${subdomain}.rest.marketingcloudapis.com/data/v1/customobjectdata/key/${process.env.DATA_EXTENSION_EXTERNAL_KEY}/rowset?$filter=MID eq ${data.inArguments[0].contactKey}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  console.log('retrieveDataFromExtension', response.data.items);

  

  try {
    const id = Uuidv1();

    await SFClient.saveData(process.env.DATA_EXTENSION_EXTERNAL_KEY, [
      {
        keys: {
          Id: id,
          SubscriberKey: data.inArguments[0].contactKey,
        },
        values: {
          Event: data.inArguments[0].DropdownOptions,
          Text: data.inArguments[0].Text,
        },
      },
    ]);
  } catch (error) {
    logger.error(error);
  }

  res.status(200).send({
    status: 'ok',
  });
};

/**
 * Endpoint that receives a notification when a user saves the journey.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.save = async (req, res) => {
  console.log('SAVE');
  res.status(200).send({
    status: 'ok',
  });
};

/**
 *  Endpoint that receives a notification when a user publishes the journey.
 * @param req
 * @param res
 */
exports.publish = (req, res) => {
  console.log('PUBLISH');
  res.status(200).send({
    status: 'ok',
  });
};

/**
 * Endpoint that receives a notification when a user performs
 * some validation as part of the publishing process.
 * @param req
 * @param res
 */
exports.validate = (req, res) => {
  console.log('VALIDATE');
  res.status(200).send({
    status: 'ok',
  });
};
