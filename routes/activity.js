const { v1: Uuidv1 } = require('uuid');
const axios = require('axios');
const JWT = require('../utils/jwtDecoder');
const SFClient = require('../utils/sfmc-client');
const logger = require('../utils/logger');


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
  const parsedData = JSON.parse(data.inArguments[0]);
  await axios.post(
    'https://indo.staging.bmp.ada-asia.com/v1/messages/sfmc/sendmessage',
    {
      channel: 'Whatsapp',
      payloadVersion: '1.0.0',
      wabaNumber: parsedData.from,
      isTemplate: true,
      namespace: 'ada_otp_12_sl',
      message: [
        {
          to: parsedData.to,
          templateInfo: parsedData.mergeData && parsedData.mergeData.length > 0 ? parsedData.mergeData.join('~') : "",
          msgId: 'uniqdue Id1',
        },
      ],
    },
    { headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IkFEQSIsImNvdW50cnlDb2RlIjoiIiwiZW1haWwiOiJtb2hhbW1hZC5hZ3VzdGlhcjJAYWRhLWFzaWEuY29tIiwiZXhwIjoyMzE2ODI1NzQ2LCJpYXQiOjE2ODU2NzM3NDYsIm5hbWUiOiJBZ3VzdGlhciIsInJvbGVDb2RlIjoiT1dORVIiLCJyb2xlSWQiOiJPV05FUiIsInNpZCI6ImFwaWtleSIsInN0eXBlIjoidXNlciIsInVpZCI6IjA4NDJlNGI3LWJlMTctNDBhOS1hZmU3LWIwNGIxNjk3NTAwOCJ9.OMWnFbBpb3s7YdNlsRc6C1s-PQUv99mSXeGNufB-2eY' } },
  ).then((resp) => {
    console.log('success');
  });

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
