import { SESClient } from '@aws-sdk/client-ses';
import { Env } from '~/index';

let sesClient: SESClient;

export const getSesClient = (env: Env) => {
  if (!sesClient) {
    sesClient = new SESClient({
      region: 'ap-southeast-2',
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return sesClient;
};
