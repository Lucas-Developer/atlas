// ~ views/search/do ~
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/results',
  'text!templates/search/do.html',
  'datatables',
  'tooltip',
  'helpers',
  'collapse',
  'typeahead'
], function($, _, Backbone, resultsCollection, doSearchTemplate){
  var doSearchView = Backbone.View.extend({
	    el: $("#content"),
	    initialize: function() {
	    	this.collection = new resultsCollection;
	    },
        filtering: function() {
            var rangefilter = function(data) {
                var iMin = document.getElementById(data.ida).value;
                var iMax = document.getElementById(data.idb).value;

                if ( iMin == "" && iMax == "") {
                    return true;
                } else {
                    var rawdata = $(data.aData[data.i]).attr('data-filter');
                    var datafilter = data.transform(rawdata);
                }

                if ( iMin == "" && datafilter < iMax*1) {
                    return true;
                } else if (iMin*1 <= datafilter && "" == iMax) {
                    return true;
                } else if (iMin*1 <= datafilter && datafilter <= iMax*1) {
                    return true;
                }

                return false;

            }
            var imagefilter = function(data) {
                var name = document.getElementById(data.id).value;
                var result = false;
                if ( name == "" ) {
                    return true;
                } else {
                    var elements = $(data.aData[data.i]);
                }
                _.each(elements, function(el) {
                    var datafilter = $(el).attr('title');
                    if (datafilter != undefined) {
                        var fRegex = new RegExp(datafilter);

                        if (name.match(fRegex)) {
                            result |= true;
                        } else {
                            result |= false;
                        }
                    }
                });

                return (result == 1);
            }

            $.fn.dataTableExt.afnFiltering.push(
                function(oSettings, aData, iDataIndex) {
                    var result = true;
                    // Filter the bandwidth
                    result &= rangefilter({
                        aData: aData,
                        ida: "bw_from",
                        idb: "bw_to",
                        i: 1,
                        transform: function(data) {
                            return Math.round(data/1000);
                            }
                        });
                    // Filter the uptime
                    result &= rangefilter({
                        aData: aData,
                        ida: "uptime_from",
                        idb: "uptime_to",
                        i: 2,
                        transform: function(data) {
                            return Math.floor(data/1000/3600/24);
                            }
                        });

                    result &= imagefilter({
                        aData: aData,
                        id: "country",
                        i: 3
                        });

                    result &= imagefilter({
                        aData: aData,
                        id: "flags",
                        i: 5
                        });

                    return (result == 1);
                }
            );

            $.extend( $.fn.dataTableExt.oStdClasses, {
                "sSortAsc": "header headerSortDown",
                "sSortDesc": "header headerSortUp",
                "sSortable": "header"
            } );


        },
        render: function(query){
            document.title = "Atlas";
            this.filtering();
            var asInitVals = new Array();
		var compiledTemplate = _.template(doSearchTemplate, {relays: this.relays, countries: CountryCodes, error: this.error});
			this.el.html(compiledTemplate);
			var fp = this;
			// This creates the table using DataTables
			var oTable = $('#torstatus_results').dataTable({
				// Save the state of the tables
                "sDom": "<'row'<'span6'l><'span6 hide'f>r>t<'row'<'span6'i><'span6'p>>",
				"bStateSave": false,
				"aaSorting": [],
                "fnDrawCallback": function( oSettings ) {
                    // Make the tooltips
                    $(".tip").tooltip();
                }
			});
            // Type ahead for country codes
            $('.typeahead').typeahead({source:_.values(CountryCodes)});
            $('input#flags').typeahead({
                    source: ['Authority', 'Fast', 'Guard', 'HSDir', 'Named',
                            'Running', 'Stable', 'V2Dir', 'Valid', 'Unnamed',
                            'Exit']
            });
            $('input#type').typeahead({
                    source: ['Relay', 'Bridge']
            });
            $(".search-query").val(query);

            $("#torstatus_results tbody tr").hover(function() {
                $(this).addClass('hover');
            }, function() {
                $(this).removeClass('hover');
            });

            $("tfoot input#nickname").keyup( function() {
                oTable.fnFilter(this.value, 0);
            });

            $("tfoot input#bw_from").keyup(function() {
                oTable.fnDraw();
            });

            $("tfoot input#bw_to").keyup(function() {
                oTable.fnDraw();
            });

           $("tfoot input#uptime_from").keyup(function() {
                oTable.fnDraw();
            });

           $("tfoot input#uptime_to").keyup(function() {
                oTable.fnDraw();
            });

           $("tfoot input#or_address").keyup(function() {
                oTable.fnFilter(this.value, 4);
           });

           $("tfoot input#or_port").keyup(function() {
                oTable.fnFilter(this.value, 6);
           });

           $("tfoot input#dir_port").keyup(function() {
                oTable.fnFilter(this.value, 7);
           });

           $("tfoot input#flags").keyup(function() {
                oTable.fnDraw();
           });

           $("tfoot input#country").keyup(function() {
                oTable.fnDraw();
           });

           $("tfoot input#type").keyup(function() {
                oTable.fnFilter(this.value, 8);
           });


        },

	    renderError: function(){
	    	var compiledTemplate = _.template(doSearchTemplate, {relays: null, error: this.error, countries: null});
	    	this.el.html(compiledTemplate);
	    }

  });
  return new doSearchView;
});

