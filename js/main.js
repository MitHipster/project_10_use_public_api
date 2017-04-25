/*jslint esversion: 6, browser: true*/
/*global window, console, $, jQuery, alert*/

const $cardContainer =  $('.card-container');
let searchForArtist = 'the who';
// AJAX request to download data from Spotify
$.ajax({
  url: 'https://api.spotify.com/v1/search',
  data: {
    q: `artist:"${searchForArtist}"`,
    type: 'album',
    market: 'US',
    limit: 24
  },
  beforeSend: function(jqXHR, settings) {
    console.log(settings.url);
  },
  success: (results) => {
    console.log(results);
    // Iterate over JSON search results to create a card that holds the album cover and title for each array item
    $.each(results.albums.items, (i, album) => {
      let coverUrl = '';
      let albumName = album.name;
      // Target image with a height of less than or equal to 300px
      $.each(album.images, (i, image) => {
        if (image.height <= 300) {
          coverUrl = image.url;
          console.log(image.height+ ': ' + coverUrl);
          return false;
        }
      });// end each image iterator
      // Call function to generate HTML for cards containing album cover and name
      $cardContainer.append(cardHtml(coverUrl, albumName));
    }); // end each album iterator
  } // end success callback
});


let albumId = '5MqyhhHbT13zsloD3uHhlQ';
$.ajax({
  url: `https://api.spotify.com/v1/albums/${albumId}`,
//  data: {
//    q: `artist:"${searchForArtist}"`,
//    type: 'album',
//    market: 'US'
//  },
  beforeSend: function(jqXHR, settings) {
    console.log(settings.url);
  },
  success: (results) => {
    console.log(results);
    
  } // end success callback function
});

let cardHtml = (coverUrl, albumName) => {
  let html =
      `<li class="card">
        <figure>
          <img class="card-image" 
          src="${coverUrl}"
          alt="${albumName} album cover">	
          <figcaption class="card-name">
            ${albumName}
          </figcaption>
        </figure>
        <div class="card-overlay"></div>
      </li>`;
  console.log(html);
  return html;
};