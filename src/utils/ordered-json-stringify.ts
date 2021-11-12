function sortObjByKey(value) {
  return typeof value === 'object'
    ? Array.isArray(value)
      ? value.map(sortObjByKey)
      : Object.keys(value)
          .sort()
          .reduce((o, key) => {
            const v = value[key];
            o[key] = sortObjByKey(v);
            return o;
          }, {})
    : value;
}

function orderedJsonStringify(obj) {
  return JSON.stringify(sortObjByKey(obj), null, 2);
}

export { orderedJsonStringify };
