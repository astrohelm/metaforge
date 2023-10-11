const object = {
  rules: ['length'],
  kind: 'struct',

  constructor: function(definition, prep) {
    const { [this.name]: type, key, value } = definition;
    const [[k, v]] = type ? Object.entries(type) : [[key, value]];
    this.key = v;
    const { }
  },
  compare: function(value, path) {
    if (typeof value !== 'object') return [`Field "${path}" if not a ${this.name}`];
    const entries = Object.entries(value);
    if (entries.length === 0 && this.required) return [`Field "${path}" is required`];
    const errors = [];
    for (const [field, value] of entries) {
      if(typeof field !== this.)
    }
    return errors;
  },
}
