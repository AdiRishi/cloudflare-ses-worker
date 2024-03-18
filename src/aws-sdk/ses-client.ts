import { SESClient, SendEmailCommand, type SendEmailCommandInput } from '@aws-sdk/client-ses';
import { type Env } from '~/index';

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

export async function sendEmail(input: SendEmailCommandInput, env: Env) {
  const client = getSesClient(env);
  return client.send(new SendEmailCommand(input));
}
