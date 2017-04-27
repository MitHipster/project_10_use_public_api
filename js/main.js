/*jslint esversion: 6, browser: true*/
/*global window, console, $, jQuery, alert*/

const $cardContainer =  $('.card-container');
const $searchField = $('#search');
const $searchBtn = $('#btn-search');

// Click function to submit search term to Spotify API via AJAX request
$searchBtn.on('click', function () {
  let searchValue = $searchField.val();
  $cardContainer.empty();
  $searchField.val('');
  // AJAX request to retrieve data from Spotify
  $.ajax({
    url: 'https://api.spotify.com/v1/search',
    data: {
      q: `artist:"${searchValue}"`,
      type: 'album',
      market: 'US',
      limit: 24
    },
//    beforeSend: function(jqXHR, settings) {
//      console.log(settings.url);
//    },
    success: (results) => {
      console.log(results);
      // Iterate over JSON search results to create a card that holds the album cover and title for each array item
      $.each(results.albums.items, (i, album) => {
        let coverUrl = '';
        let albumName = album.name;
        let artistName = '';
        let albumId = album.id;
        // Target image with a height of less than or equal to 300px
        $.each(album.images, (i, image) => {
          if (image.height <= 300) {
            coverUrl = image.url;
            return false;
          }
        });// end each image iterator
        $.each(album.artists, (i, artist) => {
          if (i <= 2) {
            artistName += artist.name + ' / ';
          } else {
            return false;
          }
        });// end each image iterator
        artistName = artistName.slice(0, -3);
        // Call function to generate HTML for the cards and append to the card container ul
        $cardContainer.append(cardHtml(coverUrl, albumName, artistName, albumId));
      }); // end each album iterator
    } // end success callback
  }); // end AJAX request
});

// Function to generate the card HTML with album image and name, plus insert album ID as a data attribute in the More Info link
let cardHtml = (coverUrl, albumName, artistName, albumId) => {
  // Create the HTML using a template literal
  let html =
      `<li class="card">
        <figure>
          <div class="image-overlay">
            <img class="card-image"
            src="${coverUrl}"
            alt="${albumName} album cover">
            <div class="btn-overlay">
              <a href="#0" class="btn-info" data-id="${albumId}">More Info</a>
            </div>
          </div>
          <figcaption class="card-name">${albumName}</figcaption>
          <p class="card-artist">${artistName}</p>
        </figure>
      </li>`;
  
  return html;
}; // end cardHtml function

// Click function to get album ID from More Info link data attribute and pass it as a parameter in an AJAX request
$cardContainer.on('click', '.btn-info', function (e) {
  e.preventDefault();

  let albumId = $(this).data('id');
  
  // AJAX request to retrieve detailed album information from Spotify
  $.ajax({
    url: `https://api.spotify.com/v1/albums/${albumId}`,

    success: (results) => {
      console.log(results);

    } // end success callback function
  }); // end AJAX request
}); // .btn-info click function
