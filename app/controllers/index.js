import Ember from 'ember';

export default Ember.Controller.extend({
  init: function() {
    var self = this;
    Ember.$.ajax({
      url: 'http://localhost:4200/theme',
      type: 'GET',
      success: function(data) {
         var themeData = JSON.parse(data);
         self.setProperties(themeData);
       }
    });
  },

  fontFamily: 'Arial',
  scale: '2:1',
  color: '#304FFE',

  actions: {
    edit: function() {
      // var jsonData = JSON.stringify({
      //   fontFamily: this.fontFamily,
      //   scale: this.scale,
      //   color: this.color
      // });

      var jsonData = JSON.stringify({ color: '#111122', fontFamily: 'Arial', scale: '2:1' });


      Ember.$.ajax({ url: 'http://localhost:4200/theme',
                     type: 'POST',
                     contentType: 'application/json',
                     data: jsonData,
                     success: function(data) {
                       debugger;
                     }
                  });
    }
  }
});
