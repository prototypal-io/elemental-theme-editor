import Ember from 'ember';

// <img class="iconic" data-src="icons/search.svg">

export default Ember.Component.extend({
  tagName: 'img',
  classNames: ['iconic'],
  attributeBindings: ['data-src'],
  name: null,

  'data-src': Ember.computed('name', function() {
    return `icons/${this.name}.svg`;
  }),

  didInsertElement() {
    var iconic = new IconicJS();
    iconic.inject(this.element);
  }
});
