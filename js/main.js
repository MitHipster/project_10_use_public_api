/*jslint esversion: 6, browser: true*/
/*global window, console, $, jQuery, Lorem, alert*/

const $cardContainer =  $('.card-container');
const $searchField = $('#search');
const $searchBtn = $('#btn-search');
const $searchTerm = $('#search-term');
const $sortContainer = $('.sort-container');
const $sortInput = $('.sort-selection');
let searchResults = [];
let randomUsers = [];
const randomUserCnt = 250;
const commentsMin = 2;
const commentsMax = 10;
const wordsMin = 10;
const wordsMax = 25;
let lgDynamicEl = []; // Dynamic LightGallery dataset

// Click function to submit search term to Spotify API via AJAX request
$searchBtn.on('click', function () {
  let searchValue = $searchField.val();
  // Clear any previous results
  $cardContainer.empty();
  // AJAX request to retrieve search results from Spotify
  $.ajax({
    url: 'https://api.spotify.com/v1/search',
    data: {
      q: `artist:"${searchValue}"`,
      type: 'album',
      market: 'US'
    },
    success: (results) => {
      let albumList = '';
      // If albums are returned continue else show no results found message
      if (results.albums.items.length !== 0) {
        // Call function to generate album list for subsequent AJAX request
        albumList = albumIdList(results.albums.items);
        // Add search term to message
        $searchTerm.text($searchField.val());
        // Remove active class if applicable
        $sortInput.removeClass('active');
        // Clear search field
        $searchField.val('');
        
        // AJAX request to retrieve detailed album information based on earlier search results
        $.ajax({
          url: 'https://api.spotify.com/v1/albums/',
          data: {
            ids: albumList
          },
          success: (results) => {
            // Populate global array with returned albums
            searchResults = results.albums;
            // AJAX request to retrieve random user information
            $.ajax({
              url: 'https://randomuser.me/api/',
              data: {
                results: randomUserCnt,
                inc: 'picture,login',
                nat: 'us'
              },
              success: function(users) {
                // Populate global array with returned users
                randomUsers = users.results;
                //Call function to add random users and comments into the Spotify search results
                addCommentBlock(searchResults, randomUsers);
                // Call function to create album cards
                albumResults(searchResults);
                // Call function to create album detail for LightGallery
                albumObjArray(searchResults);
                // Show sort options and used search term
                $sortContainer.show();
              } // end random user success callback function
            }); // end random user AJAX request
          } // end second Spotify success callback function
        }); // end second Spotify AJAX request
      // else diplay a message that no match was found
      } else {
        $sortContainer.hide(0);
        $cardContainer.append('<p id="no-match">No match found. Please revise your search term.</p>');
      }
    } // end first Spotify success callback
  }); // end first Spotify AJAX request
});

// Click function to capture sort request
$sortInput.on('click', function () {
  let sortOrder = $(this).data('sort');
  // Remove active class if applicable and add back class on clicked link
  $sortInput.removeClass('active');
  $(this).addClass('active');
  // Clear any previous results
  $cardContainer.empty();
  lgDynamicEl = [];
  // Call search function and pass sort order option
  searchResults.sort(sortYearReleased(sortOrder));
  // Call function to create album cards
  albumResults(searchResults);
  // Call function to create album detail for LightGallery
  albumObjArray(searchResults);
});

// Click function for More Info button collection to call LightGallery lightbox plugin
$cardContainer.on('click', '.btn-info', function (e) {
  e.preventDefault();
  // Get index data from button to set starting point for lightbox
  let i = $(this).data('index');

  // LightGallery plugin
  $(this).lightGallery({
    dynamic: true,
    // Dynamic dataset base on search results
    dynamicEl: lgDynamicEl,
    index: i,
    mode: 'lg-fade',
    speed: 200,
    width: '560px',
    hideBarsDelay: 600000,
    addClass: 'lg-custom',
    getCaptionFromTitleOrAlt: false,
    download: false
  }).on('onAfterAppendSubHtml.lg', function () {
    // Call MediaElement constructor after appending album detail to style player for song samples
    $('audio').mediaelementplayer({
      enableAutosize: false,
      alwaysShowControls: true,
      features: ['playpause'],
      success: function (mediaElement, originalNode) {
        mediaElement.load();
      }
    });
  }); // end LightGallery constructor
}); // .btn-info click function

// Build a comma-separated list of the album IDs for subsequent AJAX request
let albumIdList = (albums) => {
  let albumList = '';
  
  $.each(albums, (i, album) => {
    albumList += (album.id + ',');
  }); // end each album iterator
  // Remove last comma and return list
  return albumList.slice(0, -1);
}; // end albumIdList function

// Function to add random users and comments to the returned Spotify object
let addCommentBlock = (albums, users) => {
  // Iterate over search results and add a random number of users and comments to each album object
  $.each(albums, (i, album) => {
    // Get a random number of comments to create
    let comments = randomItemRange(commentsMin, commentsMax);
    album.users = [];
    // Loop through comment count and randomly select users from the random users object
    for (let c = 0; c < comments; c++) {
      // Get a random number for user
      let user = randomItemRange(0, randomUserCnt - 1);
      // Get a random number of words to combine
      let words = randomItemRange(wordsMin, wordsMax);
      // Call Lorem plugin to generate a random comment
      let commentText = Lorem.prototype.createText(words, 3);
      // Create user object
      let obj = {
        image: users[user].picture.thumbnail,
        name: users[user].login.username,
        comment: sentence(commentText)
      };
      // Add user object to new users array
      album.users[c] = obj;
    } // for comments loop
  });// end each album iterator
}; // end albumIdList function

// Iterate over search results to create a card that holds the album information for each object
let albumResults = (albums) => {
  let artistName = '';
  
  $.each(albums, (i, album) => {
    // Get medium-sized image with height and width ~300px
    let coverUrl = album.images[1].url;
    let albumName = album.name;
    let releaseDate = album.release_date.slice(0, 4);
    // Call function to create artist name(s)
    artistName = artistList(album.artists);

    // Call function to generate HTML for the cards and append to the card container ul
    $cardContainer.append(cardHtml(i, coverUrl, albumName, artistName, releaseDate));
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

// Function to generate the card HTML with album image and name, plus insert album ID as a data attribute in the More Info link
let cardHtml = (i, coverUrl, albumName, artistName, releaseDate) => {
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
          <p class="card-artist">${artistName} (${releaseDate})</p>
        </figure>
      </li>`;
  
  return html;
}; // end cardHtml function

// Iterate over album tracks to create a list for the More Info area
let albumTracks = (tracks) => {
  let html = '';
  $.each(tracks, (i, track) => {
    let trackPreview = track.preview_url;
    let trackNum = track.track_number;
    let trackName = track.name;
    let trackDuration = msConvert(track.duration_ms);

    // Call function to generate HTML for album tracks
    html += trackHtml(trackPreview, trackNum , trackName, trackDuration);
  }); // end each track iterator
  return html;
}; // end albumTracks function

// Function to generate the track HTML with preview link, name, number and duration
let trackHtml = (trackPreview, trackNum , trackName, trackDuration) => {
  // Create the HTML for album track using a template literal
  let html =
      `<li class="lg-track">
        <audio controls class="lg-track-sample mejs__custom"
          src="${trackPreview}">
        </audio>
        <p class="lg-track-num">${trackNum}</p>
        <p class="lg-track-name">${trackName}</p>
        <p class="lg-track-duration">${trackDuration}</p>
      </li>`;
  
  return html;
}; // end trackHtml function

// Iterate over user comments to create a list for the More Info area
let albumComments = (users) => {
  let html = '';
  $.each(users, (i, user) => {
    let userImage = user.image;
    let userName = user.name;
    let userComment = user.comment;

    // Call function to generate HTML for user comments
    html += commentHtml(userImage, userName , userComment);
  }); // end each user iterator
  return html;
}; // end albumComments function


// Function to generate the comment HTML with user image, user name and random lorem ipsum text
let commentHtml = (userImage, userName, userComment) => {
  // Create the HTML for user comment using a template literal
  let html =
      `<li class="lg-comment">
        <img class="lg-user-image" src="${userImage}" alt="${userName}'s profile image">
        <div>
          <div class="lg-comment-header">
            <p class="lg-user-name">${userName}</p>
            <p class="lg-posted"><img src="icons/icon-clock.svg" alt=""> hrs ago</p>
          </div>
          <p class="lg-user-comment">${userComment}</p>
        </div>
      </li>`;
  
  return html;
}; // end commentHtml function

// Function to create an array of album objects for use as dynamic LightGallery dataset
let albumObjArray = (albums) => {
  let obj = {};
  let artistName = '';
  let trackList = '';
  let commentList = '';
  // Clear array of earlier search results
  lgDynamicEl = [];
  $.each(albums, (i, album) => {
    let coverUrl = album.images[0].url;
    let albumRelease = album.release_date.slice(0, 4);
    // Call function to create artist name(s)
    artistName = artistList(album.artists);
    // Call function to create album tracks
    trackList = albumTracks(album.tracks.items);
    // Call function to create user comments
    commentList = albumComments(album.users);
    obj = {
      'src': coverUrl,
      'subHtml': 
        `<div class="lg-album-details">
          <div class="lg-album-info">
            <p class="lg-album"><span>Album Title: </span>${album.name}</p>
            <p class="lg-artist"><span>Artist: </span>${artistName}</p>
            <p class="lg-label"><span>Label: </span>${album.label}</p>
            <p class="lg-release-date"><span>Released: </span>${albumRelease} (${album.album_type})</p>
            <p><span>Tracks: </span></p>
          </div>
          <ul class="lg-track-container">
            ${trackList}
          </ul>
          <p><span>Comments: </span></p>
          <ul class="lg-comment-container">
            ${commentList}
          </ul>
        </div>`
    };
    lgDynamicEl.push(obj);
  }); // end each album iterator
}; // end albumObjArray function

//============================================================
// Helper Functions
//============================================================

// Function to sort albums by year released
let sortYearReleased = (sort) => {
  return function (a, b) {
    let aYear = a.release_date;
    let bYear = b.release_date;
    // Include month in sort if provided else default month to 12
    aYear = (aYear.length === 4) ? aYear + "12" : aYear.slice(0, 7).replace('-', '');
    bYear = (bYear.length === 4) ? bYear + "12" : bYear.slice(0, 7).replace('-', '');
    // If sort option is 'asc' sort ascending else default to descending
    if (sort === 'asc') {
      return ((aYear < bYear) ? -1 : ((aYear > bYear) ? 1 : 0));
    } else {
      return ((aYear < bYear) ? 1 : ((aYear > bYear) ? -1 : 0));
    }
  };
};

// Function to convert track duration from ms to minutes:seconds
let msConvert = (duration) => {
  let seconds = parseInt((duration / 1000) % 60);
  let minutes = parseInt((duration / (1000 * 60)) % 60);

  seconds = (seconds < 10) ? "0" + seconds : seconds;
  
  return minutes + ":" + seconds;
}; // end msConvert function

// Function to return a random number for creating simulated user comments
let randomItemRange = (minItems, maxItems) => {
  return Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
}; // end randomItemRange function

// Function to capitalize first letter of string and add ending punctuation
let sentence = (comment) => {
  return comment.charAt(0).toUpperCase() + comment.slice(1) + '.';
}; // end sentence function
