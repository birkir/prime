import { omitBy } from 'lodash';
import {
  Brackets,
  EntityRepository,
  FindConditions,
  FindOperator,
  In,
  ObjectLiteral,
} from 'typeorm';
import { Document } from '../../../entities/Document';
import { DataLoaderRepository } from './DataLoaderRepository';

@EntityRepository(Document)
export class DocumentRepository extends DataLoaderRepository<Document> {
  public loadOneByDocumentId(
    id: string,
    key: string = 'documentId',
    where?: FindConditions<Document> | ObjectLiteral | string
  ) {
    if (!id) {
      return Promise.resolve(null);
    }

    const qb = this.createQueryBuilder();
    qb.where('Document.deletedAt IS NULL');

    const subquery = qb
      .subQuery()
      .select('id')
      .from(Document, 'd');

    where = omitBy(where, n => !n);

    const filterWithName = name =>
      new Brackets(sq => {
        Object.entries(where as ObjectLiteral).map(([k, value]) => {
          if (value instanceof FindOperator) {
            sq.andWhere(value.value(`${name}.${k}`));
          } else {
            sq.andWhere(`${name}.${k} = :${k}`, { [k]: value });
          }
        });
      });

    if (Object.keys(where as ObjectLiteral).length > 0) {
      subquery.andWhere(filterWithName('d'));
      qb.where(filterWithName('Document'));
    }

    subquery
      .andWhere('d.documentId = Document.documentId')
      .andWhere('d.deletedAt IS NULL')
      .orderBy({ 'd.createdAt': 'DESC' })
      .limit(1);

    qb.having(`Document.id = ${subquery.getQuery()}`);
    qb.groupBy('Document.id');

    return this.getLoader(qb, (b, keys) => b.where({ [key]: In(keys) }), key).load(id);
  }

  public async publish(document: Document, userId: string) {
    delete document.id;
    delete document.releaseId;
    delete document.createdAt;
    delete document.updatedAt;
    document.publishedAt = new Date();
    document.userId = userId;
    const res = await this.insert(document);
    const doc = res.identifiers.pop() || { id: null };
    return this.findOneOrFail(doc.id);
  }
}
