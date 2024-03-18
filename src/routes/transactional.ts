import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { sendEmail } from '~/aws-sdk/ses-client';
import { Env } from '~/index';

export const transactionalRouter = new Hono<{ Bindings: Env }>();

transactionalRouter.post(
  '/send',
  zValidator(
    'json',
    z.object({
      to: z.array(z.string().email()),
      from: z.string().email(),
      replyToAddresses: z.array(z.string().email()).optional(),
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

    const result = await sendEmail(
      {
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
        ReplyToAddresses: data.replyToAddresses,
      },
      c.env
    );

    return c.json(result);
  }
);
