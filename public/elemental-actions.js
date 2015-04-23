window.elemental = {
  reloadCSS: function() {
    var links = $('link');
    links.remove()
    links.appendTo('head');
  }
};
