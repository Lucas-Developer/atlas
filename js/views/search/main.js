// ~ views/search/main ~
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/search/main.html',
  'collapse'
], function($, _, Backbone, mainSearchTemplate){
  var mainSearchView = Backbone.View.extend({
	    el: $("#content"),

	    render: function(query){
			document.title = "Atlas";
			var data = {};
			var compiledTemplate = _.template(mainSearchTemplate, data);
			this.el.html(compiledTemplate);
            $("#do_search").bind('click', function(){
                var query = _.escape($('#query').val());
                $("#suggestion").hide();
                document.location = "#search/"+query;
                return false;
            });

            $("#home-search").bind('submit', function(){
                var query = _.escape($('#query').val());
                $("#suggestion").hide();
                document.location = "#search/"+query;
                return false;
            });
	    }
  });
  return new mainSearchView;
});

