import { ReadStream } from 'fs';

/**
 * File upload details, resolved from an `Upload` scalar promise.
 * See: https://github.com/jaydenseric/graphql-upload
 */
export interface Upload {
  /** File name */
  filename: string;

  /** File MIME type. Provided by the client and can’t be trusted. */
  mimetype: string;

  /** File stream transfer encoding. */
  encoding: string;

  /**
   * createReadStream Returns a Node.js readable stream of the file contents,
   * for processing and storing the file. Multiple calls create independent streams.
   * Throws if called after all resolvers have resolved, or after an error has interrupted the request.
   */
  createReadStream: () => ReadStream;
}
