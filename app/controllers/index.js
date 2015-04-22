import Ember from 'ember';

export default Ember.Controller.extend({
  fontFamily: 'Arial',
  scale: '2:1',
  color: '#304FFE',
  
  actions: {
    edit: function() {
      var jsonData = JSON.stringify({ 'color': 'black' });

      Ember.$.ajax({ url: 'http://localhost:4200/theme',
                     type: 'POST',
                     contentType: 'application/json',
                     data: jsonData,
                     success: function() { console.log("yay?")}
                  });
    }
  }
});
