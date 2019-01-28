import { EntityRepository, FindConditions, In, ObjectLiteral } from 'typeorm';
import { Document } from '../../../entities/Document';
import { DataLoaderRepository } from './DataLoaderRepository';

@EntityRepository(Document)
export class DocumentRepository extends DataLoaderRepository<Document> {
  public loadOneByDocumentId(
    id: string,
    where?: FindConditions<Document> | ObjectLiteral | string
  ) {
    if (!id) {
      return Promise.resolve(null);
    }

    const qb = this.createQueryBuilder('document');

    const subquery = qb
      .subQuery()
      .select('id')
      .from(Document, 'd');

    if (where) {
      const { locale, releaseId } = where as any;
      if (locale) {
        subquery.andWhere('locale = :locale', { locale });
      }
      if (releaseId) {
        subquery.andWhere('releaseId = :releaseId', { releaseId });
      }
    }

    subquery
      .andWhere('d.documentId = document.documentId')
      // .andWhere('d.deletedAt IS NULL')
      .orderBy({ '"createdAt"': 'DESC' })
      .limit(1);

    qb.having(`document.id = ${subquery.getQuery()}`);
    qb.groupBy('document.id');

    return this.getLoader(qb, (b, keys) => b.where({ documentId: In(keys) }), 'documentId').load(
      id
    );
  }
}
