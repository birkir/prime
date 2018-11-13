import { ContentEntry } from '../models/ContentEntry';

const contentTypeBuffers = new Map();
const contentTypeTimouts = new Map();

export function bufferContentEntry(contentTypeId: string, id: number, dataloaderContext: any): Promise<ContentEntry> {
  clearTimeout(contentTypeTimouts.get(contentTypeId));
  return new Promise((resolve: Function) => {
    if (!contentTypeBuffers.has(contentTypeId)) {
      contentTypeBuffers.set(contentTypeId, []);
    }
    const contentTypeBuffer = contentTypeBuffers.get(contentTypeId);
    contentTypeBuffer.push({ resolve, id });
    contentTypeTimouts.set(contentTypeId, setTimeout(async () => {
      const contentEntryResult = await ContentEntry.findAll({
        where: {
          id: contentTypeBuffer.map(n => n.id),
          contentTypeId,
        },
      });
      dataloaderContext.prime(contentEntryResult);
      contentEntryResult.forEach((entry) => {
        let index = contentTypeBuffer.length  - 1;
        while (index >= 0) {
          const contentTypeBufferItem = contentTypeBuffer[index];
          if (contentTypeBufferItem.id === entry.id) {
            contentTypeBufferItem.resolve(entry);
            contentTypeBuffer.splice(index, 1);
          }
          index -= 1;
        }
      });
    }, 1));
  });
}
