import { ContentType } from './models/ContentType';
import { ContentEntry } from './models/ContentEntry';
import { ContentTypeField } from './models/ContentTypeField';

export const seed = async () => {

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

  // ---

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

  const author2 = await ContentEntry.create({
    entryId: await ContentEntry.getRandomId(),
    contentTypeId: authorType.id,
    isPublished: true,
    data: {
      name: 'Paul',
    }
  });

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
}
