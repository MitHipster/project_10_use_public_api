/*jslint esversion: 6, browser: true*/
/*global window, console, $, jQuery, alert*/

const $cardContainer =  $('.card-container');
const $searchField = $('#search');
const $searchBtn = $('#btn-search');
let lgDynamicEl = []; // Dynamic LightGallery dataset

// Click function to submit search term to Spotify API via AJAX request
$searchBtn.on('click', function () {
  let searchValue = $searchField.val();
  $cardContainer.empty();
  // AJAX request to retrieve data from Spotify
  $.ajax({
    url: 'https://api.spotify.com/v1/search',
    data: {
      q: `artist:"${searchValue}"`,
      type: 'album',
      market: 'US'
    },
    success: (results) => {
      let albumList = '';
      console.log(results);
      // If no albums are returned, show no results found message
      if (results.albums.items.length !== 0) {
        // Call function to create album cards
        albumResults(results.albums.items);
        // Call function to generate album list for subsequent AJAX request
        albumList = albumIdList(results.albums.items);
        // Clear search field
        $searchField.val('');
        
        $.ajax({
          url: 'https://api.spotify.com/v1/albums/',
          data: {
            ids: albumList
          },
          success: (results) => {
            console.log(results);
            albumObjArray(results.albums);
          } // end success callback function
        }); // end AJAX request
      // else diplay a message that no match was found
      } else {
        $cardContainer.append('<p id="no-match">No match found. Please revise your search term.</p>');
      }
    } // end success callback
  }); // end AJAX request
});

// Iterate over search results to create a card that holds the album information for each object item
let albumResults = (albums) => {
  let artistName = '';
  
  $.each(albums, (i, album) => {
    // Get medium-sized image with height and width ~300px
    let coverUrl = album.images[1].url;
    let albumName = album.name;
    artistName = artistList(album.artists);

    // Call function to generate HTML for the cards and append to the card container ul
    $cardContainer.append(cardHtml(i, coverUrl, albumName, artistName));
  }); // end each album iterator
}; // end albumResults function

// Combine multiple artist names into a string 
let artistList = (artists) => {
  let artistNames = '';

  $.each(artists, (i, artist) => {
    artistNames += artist.name + ' / ';
  }); // end each artist iterator
  // Remove last set of " / " and return list
  return artistNames.slice(0, -3);
}; // end artistList function

// Build a comma-separated list of the album IDs for subsequent AJAX request
let albumIdList = (albums) => {
  let albumList = '';
  
  $.each(albums, (i, album) => {
    albumList += (album.id + ',');
  }); // end each album iterator
  // Remove last comma and return list
  return albumList.slice(0, -1);
}; // end albumIdList function

// Function to generate the card HTML with album image and name, plus insert album ID as a data attribute in the More Info link
let cardHtml = (i, coverUrl, albumName, artistName) => {
  // Create the HTML using a template literal
  let html =
      `<li class="card">
        <figure>
          <div class="image-overlay">
            <img class="card-image"
            src="${coverUrl}"
            alt="${albumName} album cover">
            <div class="btn-overlay">
              <a href="#0" class="btn-info" data-index="${i}">More Info</a>
            </div>
          </div>
          <figcaption class="card-name">${albumName}</figcaption>
          <p class="card-artist">${artistName}</p>
        </figure>
      </li>`;
  
  return html;
}; // end cardHtml function

// Click function on More Info button collection to call LightGallery lightbox plugin
$cardContainer.on('click', '.btn-info', function (e) {
  e.preventDefault();
  // Get index data from button to set starting point for lightbox
  let i = $(this).data('index');
  console.log(i);
  // LightGallery plugin
  $(this).lightGallery({
    dynamic: true,
    // Dynamic dataset base on search results
    dynamicEl: lgDynamicEl,
    index: i,
    mode: 'lg-fade',
    speed: 0,
    width: '640px',
    height: '960px',
    addClass: 'lg-custom',
    hideBarsDelay: 400000,
    getCaptionFromTitleOrAlt: false,
    download: false
  }); // end LightGallery constructor
}); // .btn-info click function

// Function to create an array of album objects for use as dynamic LightGallery dataset
let albumObjArray = (albums) => {
  let obj = {};
  let artistName = '';
  $.each(albums, (i, album) => {
    let coverUrl = album.images[1].url;
    let albumName = album.name;
    artistName = artistList(album.artists);
    obj = {
      'src': coverUrl,
      'subHtml': 
        `<div class="lg-details-container">
          <p><span>Album Title: </span>${albumName}</p>
          <p><span>Artist: </span>${artistName}</p>
        </div>`
    };
    lgDynamicEl.push(obj);
  }); // end each album iterator
  console.log(lgDynamicEl);
}; // end albumObjArray function