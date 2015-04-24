window.Elemental = {
  reloadCSS: function() {
    var links = $('link');
    links.remove()
    links.appendTo('head');
    console.log('reloaded css!');
  }
};
