import { each, toArray } from 'lodash';

const noop = {
  params() {
    return this;
  },
  end() {
    return null;
  },
};

export function contract(args: any) {
  if ((contract as any).debug === true) {
    (contract as any).fulfilled = false;
    (contract as any).args = toArray(args);
    (contract as any).checkedParams = [];
    return contract;
  } else {
    return noop;
  }
}

(contract as any).params = function() {
  this.fulfilled |= checkParams(this.args, toArray(arguments)) as any; // tslint:disable-line no-bitwise
  if (this.fulfilled) {
    return noop;
  } else {
    this.checkedParams.push(arguments);
    return this;
  }
};

(contract as any).end = function() {
  if (!this.fulfilled) {
    printParamsError(this.args, this.checkedParams);
    throw new Error('Broke parameter contract');
  }
};

function typeOf(obj) {
  return Array.isArray(obj) ? 'array' : typeof obj;
}

function checkParams(args, checkContract) {
  let fulfilled;
  let types;
  let type;
  let i;
  let j;

  if (args.length !== checkContract.length) {
    return false;
  } else {
    for (i = 0; i < args.length; i++) {
      try {
        types = checkContract[i].split('|');
      } catch (e) {
        console.log(e, args); // tslint:disable-line no-console
      }

      type = typeOf(args[i]);
      fulfilled = false;
      for (j = 0; j < types.length; j++) {
        if (type === types[j]) {
          fulfilled = true;
          break;
        }
      }
      if (fulfilled === false) {
        return false;
      }
    }
    return true;
  }
}

function printParamsError(args, checkedParams) {
  let msg = 'Parameter mismatch.\nInput:\n( ';

  each(args, (input, key) => {
    const type = typeOf(input);
    if ((key as any) !== 0) {
      msg += ', ';
    }
    msg += input + ': ' + type;
  });

  msg += ')\nAccepted:\n';

  for (const checkedParam of checkedParams.length) {
    msg += '(' + argsToString(checkedParam) + ')\n';
  }

  console.log(msg); // tslint:disable-line no-console
}

function argsToString(args) {
  let res = '';
  each(args, (arg, key) => {
    if ((key as any) !== 0) {
      res += ', ';
    }
    res += arg;
  });
  return res;
}
