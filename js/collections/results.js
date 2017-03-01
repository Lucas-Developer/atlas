// ~ collections/results ~
define([
  'jquery',
  'underscore',
  'backbone',
  'models/relay'
], function($, _, Backbone, relayModel){
	var resultsCollection = Backbone.Collection.extend({
		model: relayModel,
		baseurl: 'https://onionoo.torproject.org/summary?search=',
		url: '',
		lookup: function(options) {
            var success = options.success;
            var error = options.error;
            var err = 0;
            var collection = this;
            options.success = $.getJSON(this.url, function(response) {
                checkIfDataIsUpToDate(options.success.getResponseHeader("Last-Modified"));
                this.fresh_until = response.fresh_until;
                this.valid_after = response.valid_after;
                var relays = [];
                options.error = function(options) {
                    console.log('error..');
                    error(options.error, collection, options);
                }
                _.each(response.relays, function(relay, resultsC) {
                    crelay = new relayModel;
                    crelay.fingerprint = relay.f;
                    relays.push(crelay);
                });
                _.each(response.bridges, function(relay, resultsC) {
                    crelay = new relayModel;
                    crelay.fingerprint = relay.h;
                    relays.push(crelay);
                });
                if (relays.length == 0) {
                    error(0);
                    console.log('Empty result set was returned');
                    return false;
                } else if (relays.length > 50) {
		    relays = relays.slice(0, 50);
		    err = 4;
		    console.log(options);
                }
                var lookedUpRelays = 0;
                _.each(relays, function(relay) {
                    var lookedUp = function() {
                      lookedUpRelays++;
                      if (lookedUpRelays == relays.length) {
                        success(err);
                      }
                    }
                    relay.lookup({
                        success: function(){
                            collection[options.add ? 'add' : 'reset'](relays, options);
                            lookedUp();
                        },
                        error: function() {
                            console.log("error in loading one relay..");
                            lookedUp();
                            error(0);
                        }
                    });
                });
            }).error(
                function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
                if(jqXHR.statusText == "error") {
                    error(2);
                } else {
                    error(3);
                }
                /*
                console.log("jqXHR: " +
                    jqXHR + " textStauts: " +
                    textStatus + " errorThrown: " +
                    errorThrown);
                console.log("error in doing query..");
                error(2)
                */
                }
            );
        }

	});
	return resultsCollection;
});

