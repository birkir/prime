import * as uuidv4 from 'uuid/v4';
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
    email: 'john@doe.com',
    password: 'sample',
    refreshToken: uuidv4(),
  });

  debug('sample user %s', user.dataValues.id);

  // Create some ACLs
  debug('adding roles');
  await acl.addUserRoles(user.id, ['guest', 'sample-editor']);

  debug('adding ContentType: %s', 'Blog');
  const blogType = await ContentType.create({ title: 'Blog' });
  const blogFields = [
    await ContentTypeField.create({
      name: 'title',
      type: 'string',
    }),
    await ContentTypeField.create({
      name: 'description',
      type: 'string',
    }),
    await ContentTypeField.create({
      name: 'author',
      type: 'document',
      options: {
        contentType: 'Author',
      },
    }),
  ];

  const tagsField = await ContentTypeField.create({
    name: 'tags',
    type: 'group',
  });

  const tagsTagField = await ContentTypeField.create({
    name: 'tag',
    type: 'string',
    contentTypeFieldId: tagsField.id,
  });

  blogFields.push(tagsField, tagsTagField);


  await blogType.$add('fields', blogFields);

  debug('acl: allow %s to do everything on %s', 'sample-editor', 'Blog');
  await acl.allow('sample-editor', `ContentType.${blogType.id}`, ['create', 'read', 'update', 'delete']);

  // ---

  debug('adding ContentType: %s', 'Author');
  const authorType = await ContentType.create({ title: 'Author' });
  const authorFields = [
    await ContentTypeField.create({ name: 'name', type: 'string' }),
    await ContentTypeField.create({ name: 'bio', type: 'string' }),
  ];
  await authorType.$add('fields', authorFields);

  // --- create some authors
  const authorIds: string[] = [];
  for (let i = 0; i < 15; i++) {
    const author = await ContentEntry.create({
      contentTypeId: authorType.id,
      isPublished: true,
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
    await blog.publish();
    if (blog) {
      blogIds.push(blog.entryId);
    }
  }

  // Print ACL
  debug('print roles:');
  debug(await acl.whatResources('sample-editor'));
}
