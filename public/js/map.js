(function($) {
	var map;
	var geocoder; 
	var centerChangedLast;
	var reverseGeocodedLast;
	var currentReverseGeocodeResponse;



	function setupEvents() {
		reverseGeocodedLast = new Date();
		centerChangedLast = new Date();
		
		setInterval(function() {
			if((new Date()).getSeconds() - centerChangedLast.getSeconds() > 1) {
				if(reverseGeocodedLast.getTime() < centerChangedLast.getTime())
					reverseGeocode();
			}
		}, 1000);

		google.maps.event.addListener(map, 'zoom_changed', function() {
			document.getElementById("zoom_level").innerHTML = map.getZoom();
		});

		google.maps.event.addListener(map, 'center_changed', centerChanged);

		google.maps.event.addDomListener(document.getElementById('crosshair'),'dblclick', function() {
       		map.setZoom(map.getZoom() + 1);
	    });
	}

	function getCenterLatLngText() {
		return '(' + map.getCenter().lat() + ', '+map.getCenter().lng() +')';
	}

	function centerChanged() {
		centerChangedLast = new Date();
		var latlng = getCenterLatLngText();
		document.getElementById('latlng').innerHTML = latlng;
		document.getElementById('formatedAddress').innerHTML = '';
		currentReverseGeocodeResponse = null;
	}
	
	
	function reverseGeocode() {
    	reverseGeocodedLast = new Date();
	    geocoder.geocode({latLng:map.getCenter()},reverseGeocodeResult);
	}

	function reverseGeocodeResult(results, status) {
	    currentReverseGeocodeResponse = results;
    	if(status == 'OK') {
		    if(results.length == 0) {
		        document.getElementById('formatedAddress').innerHTML = 'None';
		    } else {
        		document.getElementById('formatedAddress').innerHTML = results[0].formatted_address;
		    }
	    } else {
		    document.getElementById('formatedAddress').innerHTML = 'Error';
	    }
  	}

	$.geocode = function() {
   		var address = document.getElementById("address").value;
	    geocoder.geocode({
      		'address': address,
		    'partialmatch': true
		}, geocodeResult);
  	}

	function geocodeResult(results, status) {
    	if (status == 'OK' && results.length > 0) {
		    map.fitBounds(results[0].geometry.viewport);
	    } else {
      		alert("Geocode was not successful for the following reason: " + status);
    	}
  	}

	$.addMarkerAtCenter = function() {
    	var marker = new google.maps.Marker({
        	position: map.getCenter(),
	        map: map
    	});

	    var text = 'Lat/Lng: ' + getCenterLatLngText();
    	if(currentReverseGeocodeResponse) {
      		var addr = '';
		    if(currentReverseGeocodeResponse.size == 0) {
        		addr = 'None';
		    } else {
        		addr = currentReverseGeocodeResponse[0].formatted_address;
		    }
     		 text = text + '<br>' + 'address: <br>' + addr;
    	}

		var infowindow = new google.maps.InfoWindow({ content: text });

	    google.maps.event.addListener(marker, 'click', function() {
      		infowindow.open(map,marker);
	    });
  	}	

	$.initialize = function() {
		var myOptions = {
			zoom: 8,
	        center: new google.maps.LatLng(-34.397, 150.644),
			mapTypeId: google.maps.MapTypeId.ROADMAP
	    };
		map = new google.maps.Map(document.getElementById('map_canvas'),
	    	myOptions);
	
		//HTML5 geolocation
		if(navigator.geolocation) {
    		navigator.geolocation.getCurrentPosition(function(position) {
	    	    var pos = new google.maps.LatLng(position.coords.latitude,
    	    		position.coords.longitude);
		        map.setCenter(pos);
       		}, function() {
        		handleNoGeolocation(true);
	    	});
		} else {
    		// Browser doesn't support Geolocation
	        handleNoGeolocation(false);
    	}
	
		geocoder = new google.maps.Geocoder();

		var input = document.getElementById('address');
		var infowindow = new google.maps.InfoWindow();
		var marker = new google.maps.Marker({
          map: map
        });
		var autocomplete = new google.maps.places.Autocomplete(input);
		autocomplete.bindTo('bounds', map);

		google.maps.event.addListener(autocomplete, 'place_changed', function() {
			var place = autocomplete.getPlace();
			if(place.geometry.viewport) {
				map.fitBounds(place.geometry.viewport);
			} else {
				map.setCenter(place.geometry.location);
				map.setZoom(17);
			}

			var image = new google.maps.MarkerImage(
				place.icon,
				new google.maps.Size(71, 71),
				new google.maps.Point(0, 0),
				new google.maps.Point(17, 34),
				new google.maps.Size(35, 35));
			marker.setIcon(image);
			marker.setPosition(place.geometry.location);

			var address = '';
	        if (place.address_components) {
    	        address = [(place.address_components[0] &&
                        place.address_components[0].short_name || ''),
                       (place.address_components[1] &&
                        place.address_components[1].short_name || ''),
                       (place.address_components[2] &&
                        place.address_components[2].short_name || '')
                      ].join(' ');
        	}

	        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
     	   infowindow.open(map, marker);
		});

		function setupClickListener(id, types) {
    	    var radioButton = document.getElementById(id);
        	google.maps.event.addDomListener(radioButton, 'click', function() {
            	autocomplete.setTypes(types);
	        });
        }

        setupClickListener('changetype-all', []);
        setupClickListener('changetype-establishment', ['establishment']);
        setupClickListener('changetype-geocode', ['geocode']);

		setupEvents();
		centerChanged();
	}


	//google.maps.event.addDomListener(window, 'load', initialize());
})(jQuery);
