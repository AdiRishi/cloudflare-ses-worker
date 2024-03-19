import { SESClient } from '@aws-sdk/client-ses';
import { SESv2Client, SendEmailCommand, type SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { type Env } from '~/index';

let sesClient: SESClient;
let sesV2Client: SESv2Client;

export function getSesClient(env: Env) {
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
}

export function getSesV2Client(env: Env) {
  if (!sesV2Client) {
    sesV2Client = new SESv2Client({
      region: 'ap-southeast-2',
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return sesV2Client;
}

export async function sendEmail(input: SendEmailCommandInput, env: Env) {
  const client = getSesV2Client(env);
  return client.send(new SendEmailCommand(input));
}
