/*jslint esversion: 6, browser: true*/
/*global window, console, $, jQuery, alert*/

const $cardContainer =  $('.card-container');
let $moreInfo = $();
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
      let albumId = album.id;
      // Target image with a height of less than or equal to 300px
      $.each(album.images, (i, image) => {
        if (image.height <= 300) {
          coverUrl = image.url;
          return false;
        }
      });// end each image iterator
      // Call function to generate HTML for the cards and append to the card container ul
      $cardContainer.append(cardHtml(coverUrl, albumName, albumId));
    }); // end each album iterator
    $moreInfo = $('.btn-info');
  } // end success callback
});

// Function to generate the card HTML with album image and name. Plus insert album ID as a data attribute for the More Info link
let cardHtml = (coverUrl, albumName, albumId) => {
  let html =
      `<li class="card">
        <figure>
          <div class="image-overlay-container">
            <img class="card-image"
            src="${coverUrl}"
            alt="${albumName} album cover">
            <div class="btn-overlay">
              <a href="#0" class="btn-info" data-id="${albumId}">More Info</a>
            </div>
          </div>
          <figcaption class="card-name">${albumName}</figcaption>
        </figure>
      </li>`;
  
  return html;
}; // end cardHtml function

// Click function to get album ID from More Info link data attribute and pass it as a parameter in an AJAX request
$moreInfo.click( function (e) {
  e.preventDefault();
  console.log('Clicked');
  let albumId = $(this).data('id');
  
  // AJAX request to download detailed album information from Spotify
  $.ajax({
    url: `https://api.spotify.com/v1/albums/${albumId}`,

    beforeSend: function(jqXHR, settings) {
      console.log(settings.url);
    },
    success: (results) => {
      console.log(results);

    } // end success callback function
  });
});
