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

    hashFingerprint: function(fp){
        if (fp.match(/^[a-f0-9]{40}$/i) != null)
            return new jsSHA(fp, "HEX").getHash("SHA-1", "HEX").toUpperCase();
        else
            return fp
    },

    // Show the details page of a node
    mainDetails: function(fingerprint){

        $("#home").removeClass("active");
        $("#about").removeClass("active");

        $("#content").hide();
        $(".progress").show();

        mainDetailsView.model.fingerprint = this.hashFingerprint(fingerprint);
        mainDetailsView.model.lookup({
            success: function(relay) {
    	        mainDetailsView.render();
                $(".progress").hide();
                $("#content").show();

            },
            error: function() {
                mainDetailsView.error();
                $(".progress").hide();
                $("#content").show();
            }
        });
    },

    // Perform a search on Atlas
    doSearch: function(query){
        $("#home").removeClass("active");
        $("#about").removeClass("active");

        $("#content").hide();
        $(".progress").show();

        $("#nav-search").val(query);
        if (query == "") {
	    doSearchView.error = 5;
            doSearchView.renderError();
            $(".progress").hide();
            $("#content").show();
        } else {
            doSearchView.collection.url =
                doSearchView.collection.baseurl + this.hashFingerprint(query);
            doSearchView.collection.lookup({
                success: function(err){
                    doSearchView.relays = doSearchView.collection.models;

                    // Redirect to the details page when there is exactly one
                    // search result.
                    if (doSearchView.relays.length == 1) {
                        document.location = "#details/" +
                            doSearchView.relays[0].fingerprint;
                        return;
                    }
		    doSearchView.error = err;
                    doSearchView.render(query);
		    $("#search-title").text(query);
                    $(".progress").hide();
                    $("#content").show();
                },

                error: function(err){
		    doSearchView.error = err;
		    doSearchView.renderError();
                    $(".progress").hide();
                    $("#content").show();
                }
            });
        }
    },
    showTop10: function(){
        $("#home").removeClass("active");
        $("#about").removeClass("active");

        $("#content").hide();
        $(".progress").show();

        doSearchView.collection.url = "https://onionoo.torproject.org/summary?type=relay&order=-consensus_weight&limit=10&running=true";
            doSearchView.collection.lookup({
                success: function(err){
                    doSearchView.relays = doSearchView.collection.models;
                    doSearchView.error = err;
                    doSearchView.render("");
		    $("#search-title").text("Top 10 Relays by Consensus Weight");
                    $(".progress").hide();
                    $("#content").show();
                },

                error: function(erno){
                    doSearchView.error = erno;
                    doSearchView.renderError();
                    $(".progress").hide();
                    $("#content").show();
                }
            });
    },
    // Display the Atlas about page
    showAbout: function(){
        $("#home").removeClass("active");
        $("#about").addClass("active");

    	aboutView.render();

        $(".progress").hide();
        $("#content").show();
    },

    // No matched rules go to the default home page
    defaultAction: function(actions){
        $("#home").addClass("active");
        $("#about").removeClass("active");

        mainSearchView.render();

        $(".progress").hide();
        $("#content").show();
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
        $("#suggestion").hide();
        document.location = "#search/"+query;
        return false;
    });
  };
  return {
    initialize: initialize
  };
});
