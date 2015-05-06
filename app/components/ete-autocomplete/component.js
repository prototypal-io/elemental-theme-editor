import Ember from 'ember';

export default Ember.Component.extend({
  attributeBindings: ['tabindex'],
  tabindex: -1,

  name: null,
  options: null,
  value: null,
  isFocused: false,
  hasTyped: false,

  filteredOptions: Ember.computed('value', function() {
    let options = this.options;
    if (!this.hasTyped) { return options; }
    return options.filter(val => {
      return val.indexOf(this.value) !== -1;
    });
  }),

  actions: {
    typed() {
      this.set('hasTyped', true);
    },

    focused() {
      this.set('isFocused', true);
    },

    blurred() {
      // this.set('isFocused', false);
    },

    choose(value) {
      this.set('value', value);
      this.set('isFocused', false);
    }
  }
});
