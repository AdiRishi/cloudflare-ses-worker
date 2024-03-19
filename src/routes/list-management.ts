import {
  CreateContactListCommand,
  DeleteContactListCommand,
  GetContactListCommand,
  ListContactListsCommand,
  UpdateContactListCommand,
  NotFoundException,
} from '@aws-sdk/client-sesv2';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { getSesV2Client } from '~/aws-sdk/ses-client';
import { Env } from '~/index';

export const listManagementRouter = new Hono<{ Bindings: Env }>();

listManagementRouter.get('/lists', async (c) => {
  const client = getSesV2Client(c.env);
  const result = await client.send(new ListContactListsCommand());
  return c.json(result);
});

listManagementRouter.get('/list/:listName', async (c) => {
  const client = getSesV2Client(c.env);
  try {
    const result = await client.send(
      new GetContactListCommand({
        ContactListName: c.req.param('listName'),
      })
    );
    return c.json(result);
  } catch (e) {
    if (e instanceof NotFoundException) {
      return c.json({ error: e.message }, 404);
    }
    throw e;
  }
});

listManagementRouter.post(
  '/list',
  zValidator(
    'json',
    z.object({
      listName: z.string(),
      description: z.string().optional(),
      topics: z
        .array(
          z.object({
            name: z.string(),
            displayName: z.string(),
            description: z.string().optional(),
            defaultSubscriptionStatus: z.enum(['OPT_IN', 'OPT_OUT']).default('OPT_IN'),
          })
        )
        .default([]),
    })
  ),
  async (c) => {
    const data = c.req.valid('json');
    const client = getSesV2Client(c.env);
    const result = await client.send(
      new CreateContactListCommand({
        ContactListName: data.listName,
        Description: data.description,
        Topics: data.topics.map((topic) => ({
          TopicName: topic.name,
          DisplayName: topic.displayName,
          Description: topic.description,
          DefaultSubscriptionStatus: topic.defaultSubscriptionStatus,
        })),
      })
    );
    return c.json(result);
  }
);

listManagementRouter.put(
  '/list/:listName',
  zValidator(
    'json',
    z.object({
      description: z.string().optional(),
      topics: z
        .array(
          z.object({
            name: z.string(),
            displayName: z.string(),
            description: z.string().optional(),
            defaultSubscriptionStatus: z.enum(['OPT_IN', 'OPT_OUT']).default('OPT_IN'),
          })
        )
        .default([]),
    })
  ),
  async (c) => {
    const data = c.req.valid('json');
    const client = getSesV2Client(c.env);
    const result = await client.send(
      new UpdateContactListCommand({
        ContactListName: c.req.param('listName'),
        Description: data.description,
        Topics: data.topics.map((topic) => ({
          TopicName: topic.name,
          DisplayName: topic.displayName,
          Description: topic.description,
          DefaultSubscriptionStatus: topic.defaultSubscriptionStatus,
        })),
      })
    );
    return c.json(result);
  }
);

listManagementRouter.delete('/list/:listName', zValidator('json', z.object({})), async (c) => {
  const client = getSesV2Client(c.env);
  const result = await client.send(
    new DeleteContactListCommand({
      ContactListName: c.req.param('listName'),
    })
  );
  return c.json(result);
});
