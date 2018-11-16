import { ContentType } from './models/ContentType';
import { ContentEntry } from './models/ContentEntry';
import { ContentTypeField } from './models/ContentTypeField';
import { User } from './models/User';
import * as uuidv4 from 'uuid/v4';
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
  const blogType = await ContentType.create({ name: 'Blog' });
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
  await blogType.$add('fields', blogFields);

  debug('acl: allow %s to do everything on %s', 'sample-editor', 'Blog');
  await acl.allow('sample-editor', `ContentType.${blogType.id}`, ['create', 'read', 'update', 'delete']);

  // ---

  debug('adding ContentType: %s', 'Author');
  const authorType = await ContentType.create({ name: 'Author' });
  const authorFields = [
    await ContentTypeField.create({ name: 'name', type: 'string' }),
  ];
  await authorType.$add('fields', authorFields);

  // ---
  const author1 = await ContentEntry.create({
    entryId: await ContentEntry.getRandomId(),
    contentTypeId: authorType.id,
    isPublished: true,
    data: {
      name: 'John',
    }
  });
  debug('adding Author: %s', author1.entryId);

  const author2 = await ContentEntry.create({
    entryId: await ContentEntry.getRandomId(),
    contentTypeId: authorType.id,
    isPublished: true,
    data: {
      name: 'Paul',
    }
  });
  debug('adding Author: %s', author2.entryId);

  // --

  const blog1 = await ContentEntry.create({
    entryId: await ContentEntry.getRandomId(),
    contentTypeId: blogType.id,
    isPublished: true,
    data: {
      title: 'Foo 1',
      description: 'Bar 1',
      author: author1.entryId,
    },
  });
  debug('adding Blog: %s', blog1.entryId);

  await blog1.draft({ ...blog1.data, title: 'Foo 111' }, 'en');
  const blog1draft = await blog1.draft({ ...blog1.data, title: 'Foo 123' }, 'en');
  await blog1draft.publish();

  const blog2 = await ContentEntry.create({
    entryId: await ContentEntry.getRandomId(),
    contentTypeId: blogType.id,
    isPublished: true,
    data: {
      title: 'Foo 2',
      description: 'Bar 2',
      author: author2.entryId,
    },
  });

  blog2.draft({ ...blog2.data, title: 'Foo IS' }, 'is')
    .then(blog => blog.publish());

  // Print ACL
  debug('print roles:');
  debug(await acl.whatResources('sample-editor'));
}
