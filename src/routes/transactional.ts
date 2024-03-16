import { SESClient, SendEmailCommand, type SendEmailCommandInput } from '@aws-sdk/client-ses';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '~/index';

export const transactionalRouter = new Hono<{ Bindings: Env }>();

const client = new SESClient({ region: 'ap-southeast-2' });

transactionalRouter.post(
  '/send',
  zValidator(
    'json',
    z.object({
      to: z.array(z.string().email()),
      from: z.string().email(),
      subject: z.string(),
      body: z
        .object({
          text: z.string().optional(),
          html: z.string().optional(),
        })
        .refine((data) => data.text || data.html, {
          message: "At least one of 'text' or 'html' must be provided",
        }),
      cc: z.array(z.string().email()).optional(),
      bcc: z.array(z.string().email()).optional(),
    })
  ),
  async (c) => {
    const data = c.req.valid('json');

    const input: SendEmailCommandInput = {
      Source: data.from,
      Destination: {
        ToAddresses: data.to,
        CcAddresses: data.cc,
        BccAddresses: data.bcc,
      },
      Message: {
        Body: {
          Text: {
            Data: data.body.text,
          },
          Html: {
            Data: data.body.html,
          },
        },
        Subject: {
          Data: data.subject,
        },
      },
    };
    const command = new SendEmailCommand(input);
    await client.send(command);

    return c.json({ message: 'ok' });
  }
);
