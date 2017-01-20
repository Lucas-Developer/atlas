// ~ router.js ~
define([
  'jquery',
  'underscore',
  'backbone',
  'views/details/main',
  'views/search/main',
  'views/search/do',
  'views/about/main',
  'jssha'
], function($, _, Backbone, mainDetailsView, mainSearchView, doSearchView, aboutView, jsSHA){
  var AppRouter = Backbone.Router.extend({
    routes: {
       // Define the routes for the actions in Atlas
    	'details/:fingerprint': 'mainDetails',
    	'search/:query': 'doSearch',
	'top10': 'showTop10',
    	'about': 'showAbout',
    	// Default
    	'*actions': 'defaultAction'
    },

    hashFingerprints: function(fp){
        if (fp.match(/^[a-f0-9]{40}/i) != null)
            return new jsSHA(fp, "HEX").getHash("SHA-1", "HEX").toUpperCase();
        else
            return fp
    },

    // Show the details page of a node
    mainDetails: function(fingerprint){

        $("#home").removeClass("active");
        $("#about").removeClass("active");

        $("#loading").show();
        $("#content").hide();

        mainDetailsView.model.fingerprint = this.hashFingerprints(fingerprint);
        mainDetailsView.model.lookup({
            success: function(relay) {
                $("#content").show();
    	        mainDetailsView.render();
                $("#loading").hide();

            },
            error: function() {
                $("#content").show();
                mainDetailsView.error();
                $("#loading").hide();
            }
        });
    },

    // Perform a search on Atlas
    doSearch: function(query){
        $("#home").removeClass("active");
        $("#about").removeClass("active");

        $("#loading").show();
        $("#content").hide();

        $("#nav-search").val(query);
        if (query == "") {
            $("#content").show();
	    doSearchView.error = 5;
            doSearchView.renderError();
            $("#loading").hide();
        } else {
            doSearchView.collection.url =
                doSearchView.collection.baseurl + this.hashFingerprints(query);
            doSearchView.collection.lookup({
                success: function(err){
                    $("#content").show();
                    doSearchView.relays = doSearchView.collection.models;
		    doSearchView.error = err;
                    doSearchView.render(query);
		    $("#search-title").text(query);
                    $("#loading").hide();
                },

                error: function(err){
                    $("#content").show();
		    doSearchView.error = err;
		    doSearchView.renderError();
                    $("#loading").hide();
                }
            });
        }
    },
    showTop10: function(){
        $("#home").removeClass("active");
        $("#about").removeClass("active");

        $("#loading").show();
        $("#content").hide();

        doSearchView.collection.url = "https://onionoo.torproject.org/summary?type=relay&order=-consensus_weight&limit=10&running=true";
            doSearchView.collection.lookup({
                success: function(relays){
                    $("#content").show();
                    doSearchView.relays = doSearchView.collection.models;
                    doSearchView.render("");
		    $("#search-title").text("Top 10 Relays by Consensus Weight");
                    $("#loading").hide();
                },

                error: function(erno){
                    $("#content").show();
                    doSearchView.error = erno;
                    doSearchView.renderError();
                    $("#loading").hide();
                }
            });
    },
    // Display the Atlas about page
    showAbout: function(){
        $("#home").removeClass("active");
        $("#about").addClass("active");

        $("#loading").show();
        //$("#content").hide();

    	aboutView.render();

        $("#loading").hide();
        //$("#content").show();
    },

    // No matched rules go to the default home page
    defaultAction: function(actions){
        $("#home").addClass("active");
        $("#about").removeClass("active");

        $("#loading").show();
        //$("#content").hide();

        mainSearchView.render();

        //$("#content").show();
        $("#loading").hide();
    }

  });

  var initialize = function(){
    var app_router = new AppRouter;
    Backbone.history.start();

    // This is probably a dirty trick and there should be a better
    // way of doing so.

    $("#nav-search").submit(function(e){
        var query = _.escape($(this).children("input.search-query").val());
        query = query.trim();
        console.log(query);
        $("#suggestion").hide();
        document.location = "#search/"+query;
        return false;
    });
  };
  return {
    initialize: initialize
  };
});
