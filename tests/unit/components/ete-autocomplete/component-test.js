import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('ete-autocomplete', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']
});

test('it renders', function(assert) {
  assert.expect(2);

  // Creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // Renders the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');
});

test('shows the list when clicked', function(assert) {
  let options = ['foo', 'bar', 'baz'];
  let component = this.subject({options});
  this.render();
  component.$('input').focus();
  let renderedOptions = component.$('li');
  assert.equal(renderedOptions.length, 3);
});
