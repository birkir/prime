import * as faker from 'faker';

import { ContentType } from './models/ContentType';
import { ContentEntry } from './models/ContentEntry';
import { ContentTypeField } from './models/ContentTypeField';
import { User } from './models/User';
import { acl } from './acl';

const debug = require('debug')('prime:seed');

export const seed = async () => {

  // Create sample user
  const user = await User.create({
    firstname: 'John',
    lastname: 'Doe',
    email: 'demo@local.me',
    password: 'demo',
  });

  debug('sample user %s', user.dataValues.id);

  // Create some ACLs
  debug('adding roles');
  await acl.addUserRoles(user.id, ['guest', 'sample-editor']);

  // ---

  debug('adding ContentType: %s', 'Author');
  const authorType = await ContentType.create({ title: 'Author' });
  const authorFields = [
    await ContentTypeField.create({ title: 'Name', name: 'name', type: 'string' }),
    await ContentTypeField.create({ title: 'Bio', name: 'bio', type: 'string' }),
  ];
  await authorType.$add('fields', authorFields);

  // ---

  debug('adding ContentType: %s', 'Blog');
  const blogType = await ContentType.create({ title: 'Blog' });
  const blogFields = [
    await ContentTypeField.create({
      title: 'Title',
      name: 'title',
      type: 'string',
    }),
    await ContentTypeField.create({
      title: 'Description',
      name: 'description',
      type: 'string',
    }),
    await ContentTypeField.create({
      title: 'Author',
      name: 'author',
      type: 'document',
      options: {
        contentTypeId: authorType.id,
      },
    }),
  ];

  const tagsField = await ContentTypeField.create({
    title: 'Tags',
    name: 'tags',
    type: 'group',
  });

  const tagsTagField = await ContentTypeField.create({
    title: 'Tag',
    name: 'tag',
    type: 'string',
    contentTypeFieldId: tagsField.id,
  });

  blogFields.push(tagsField, tagsTagField);

  await blogType.$add('fields', blogFields);

  debug('acl: allow %s to do everything on %s', 'sample-editor', 'Blog');
  await acl.allow('sample-editor', `ContentType.${blogType.id}`, ['create', 'read', 'update', 'delete']);

  // Allow author to have blogs
  const blogConnectionField = await ContentTypeField.create({
    title: 'Blog',
    name: 'blog',
    type: 'document',
    options: { contentTypeId: blogType.id }
  });
  await authorType.$add('fields', [blogConnectionField]);

  // --- create some authors
  const authorIds: string[] = [];
  for (let i = 0; i < 15; i++) {
    const author = await ContentEntry.create({
      contentTypeId: authorType.id,
      data: {
        name: faker.name.findName(),
        bio: faker.lorem.words(15),
      },
    });
    if (author) {
      authorIds.push(author.entryId);
    }
  }

  // create some blog posts
  const blogIds: string[] = [];
  for (let i = 0; i < 45; i++) {
    const blog = await ContentEntry.create({
      contentTypeId: blogType.id,
      isPublished: true,
      data: {
        title: faker.lorem.lines(1),
        description: faker.lorem.paragraphs(),
        author: faker.random.arrayElement(authorIds),
        tags: [{ tag: 'foo' }, { tag: 'bar' }],
      },
    });
    if (blog) {
      blogIds.push(blog.entryId);
    }
  }

  const slice1 = await ContentType.create({
    title: 'Slice Test 1',
    isSlice: true,
  })
  await slice1.$add('fields', [await ContentTypeField.create({ title: 'Foo', name: 'foo', type: 'string' })]);
  // next slice type
  const slice2 = await ContentType.create({
    title: 'Slice Test 2',
    isSlice: true,
  })
  await slice2.$add('fields', [await ContentTypeField.create({ title: 'Bar', name: 'bar', type: 'string' })]);
  authorType.$add('fields', [
    await ContentTypeField.create({ title: 'Body', name: 'body', type: 'slice', options: { slices: [slice1.id, slice2.id] }}),
  ]);

  // Print ACL
  debug('print roles:');
  debug(await acl.whatResources('sample-editor'));
}
