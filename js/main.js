/*jslint esversion: 6, browser: true*/
/*global window, console, $, jQuery, alert*/

$.ajax({
  url: 'https://api.spotify.com/v1/search',
  data: {
    q: 'roadhouse blues',
    type: 'album',
    market: 'US'
  },
  success: (music) => {
    console.log(music);
  }
});