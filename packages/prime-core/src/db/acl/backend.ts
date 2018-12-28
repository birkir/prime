import { Sequelize } from 'sequelize';
import { defaults, union, difference } from 'lodash';

import { contract } from './contract';
import { setup, clean } from './dbTasks';

export function SequelizeBackend(db: Sequelize, options: object) {
	this.options = defaults({}, options, { prefix : '' });
	this.db = setup(db, this.options);
	this.Op = this.db.Op || { in: '$in' };
	this.Promise = this.db.Promise;
}

type TInstance = Sequelize["model"] & {
  value: object;
}

SequelizeBackend.prototype = {
	/**
	 * return model for bucket
	 * @param  {string} bucket
	 * @return {Sequlize.model}
	 */
	getModel(bucket: string) {
		return this.db.models[this.options.prefix + bucket[0].toUpperCase() + bucket.substr(1)];
	},

	/**
	 * return values for permissions bucket
	 * @param  {String[]} key
	 * @param  {Sequelize.row} row
	 * @return {Array}
	 */
	getPermission(keys: string[], row: TInstance) {
		let res = row && row.value || {};
    keys = Array.isArray(keys) ? keys : [keys];
    res = union(...keys.map((key: string) => res[key] || []))
		return res;
	},

	/**
	 * sbFindRow(bucket, key)
	 *
	 * Find the row for specific bucket.
	 *
	 * @param  {string}   bucket if bucket is allows_* (bucket is permissions and key is bucket value)
	 * @param  {string|number}   key
	 * @return {Promise<Sequelize.Row>}
	 */
	async findRow(bucket: string, key: string | number): Promise<TInstance | null> {
		let perm = false;
		if (bucket.indexOf('allows_') === 0) {
			key    = bucket;
			bucket = 'permissions';
			perm   = true;
		}
		const row = await this.getModel(bucket).findOne({
			where: {key: key.toString()},
			attributes: ['key', 'value']
    });
    if (!row) {
      return null;
    }
    row.value = row.value || (perm ? {} : []);
    return row;
	},

	/**
	 * sbFindRows(bucket, key)
	 *
	 * Find the row for specific bucket.
	 *
	 * @param  {string}   bucket if bucket is allows_* (bucket is permissions and key is bucket value)
	 * @param  {string|number}   key
	 * @return {Promise<Sequelize.Row[]>}
	 */
	async findRows(bucket: string, keys: Array<string | number>): Promise<TInstance[]> {
		if (bucket.indexOf('allows_') === 0) {
			return this.findRow(bucket);
    }

		const rows = await this.getModel(bucket).findAll({
			where: { key: { [this.Op.in]: keys.map(key => key.toString()) } },
			attributes: ['key', 'value'],
    });

    return rows.map(row => {
      row.value = row.value || [];
      return row;
    });
  },

	begin() {
		return [];
	},

	/**
	 * sbEnd(transaction, cb)
	 *
	 * @param  {Function[]}   transaction
	 * @param  {Function} cb
	 * @return {Promise}
	 */
	async end(transaction: Function[], cb: Function): Promise<any> {
    (contract(arguments) as any)
      .params('object', 'function')
      .end();

    await Promise.all(transaction.map((transaction: any) => {
      if (typeof transaction === 'function') {
        return transaction();
      }
      return transaction;
    }));
    cb();
	},


	/**
	 * sbClean(cb)
	 *
	 * Cleans the whole storage.
	 *
	 * @param  {Function} cb
	 * @return {Promise}
	 */
	clean(cb) {
		(contract(arguments) as any).params('function').end();
    clean(this.db, this.options);
    return cb();
	},


	/**
	 * sbGet(bucket, key, cb)
	 *
	 * Gets the contents at the bucket's key.
	 *
	 * @param  {string}   bucket
	 * @param  {string|number}   key
	 * @param  {Function} cb
	 * @return {Promise}
	 */
	async get(bucket, key, cb) {
		(contract(arguments) as any)
      .params('string', 'string|number', 'function')
      .end();

    const row = await this.findRow(bucket, key);
    if (!row) {
      return cb(undefined, []);
    }
    if (bucket.indexOf('allows_') === 0) {
      return cb(undefined, this.getPermission(key, row));
    }
    return cb(undefined, row.value);
	},

	/**
	 * sbGet(bucket, key, cb)
	 *
	 * Returns the union of the values in the given keys.
	 *
	 * @param  {string}   bucket
	 * @param  {array}   key
	 * @param  {Function} cb
	 * @return {Promise}
	 */
	union(bucket: string, keys: string[], cb: Function): Promise<any> {
		(contract(arguments) as any)
			.params('string', 'array', 'function')
      .end();

		return this.findRows(bucket, keys)
			.then(rows => {
				if (bucket.indexOf('allows_') === 0) {
					return this.getPermission(keys, rows);
				} else {
					return union(...rows.map(row => {
						return row.value;
					}));
				}
      })
      .then((rows) => cb(undefined, rows));
	},

	/**
	 * sbAdd(transaction, bucket, key, values)
	 *
	 * Adds values to a given key inside a bucket.
	 *
	 * @param  {array} transaction
	 * @param  {string}   bucket
	 * @param  {string|number}   key
	 * @param  {string|number|array} values
	 * @return {Promise}
	 */
	add(transaction, bucket, key, values) {
		(contract(arguments) as any)
				.params('object', 'string', 'string|number','string|array|number')
				.end();

		values = Array.isArray(values) ? values : [values];

		transaction.push(() => {
			return this.findRow(bucket, key)
				.then(row => {

					let update;
					if (bucket.indexOf('allows_') === 0) {
						update = row && row.value || {};
						update[key] = union(update[key], values);
						key = bucket;
						bucket = 'permissions';
					} else {
						update = union(row && row.value, values);
					}
					return this.getModel(bucket).upsert({
						key,
						value: update
					});
				});
		});
	},

	/**
	 * sbDel(transaction, bucket, keys)
	 * Delete the given key(s) at the bucket
	 *
	 * @param  {array} transaction
	 * @param  {string}	bucket
	 * @param  {string|array} keys
	 * @return {Promise}
	 */
	del(transaction, bucket, keys) {
		(contract(arguments) as any)
				.params('object', 'string', 'string|array')
				.end();

		keys = Array.isArray(keys) ? keys : [keys];

		transaction.push(() => {
			if (bucket.indexOf('allows_') === 0) {
				return this.findRow(bucket).then(row => {
					let update;
					if (!row) {
						return;
					}
					update = row.value;
					keys.forEach(key => {
						update[key] = undefined;
					});
					return row.set('value', update).save();
				});
			} else {
				return this.getModel(bucket)
					.destroy({
						where: {key : {[this.Op.in]: keys}}
					});
			}
		});
	},

	/**
	 * sbRemove(transaction, bucket, key, values)
	 *
	 * Removes values from a given key inside a bucket.
	 *
	 * @param  {array} transaction
	 * @param  {string}	bucket
	 * @param  {string|number}   key
	 * @param  {string|number|array} values
	 * @return {Promise}
	 */
	remove(transaction: Function[], bucket:  string, key: string | number, values: Array<string | number>) {
		(contract(arguments) as any)
				.params('object', 'string', 'string|number','string|array|number')
				.end();

		values = Array.isArray(values) ? values : [values];

		transaction.push(() => {
			return this.findRow(bucket, key)
				.then(row => {
					let update;
					if (!row) {
						return;
					}
					if (bucket.indexOf('allows_') === 0) {
						update = row.value;
						update[key] = difference(update[key], values);
					} else {
						update = difference(row.value, values);
					}
					row.value = update;
					return row.save();
				});
		});
	}
};
