const google = require ('googleapis');
const config = require('./config.js');

google.options ({ auth: config.youtubeKey() });
var youtube = google.youtube ('v3');

// Search Youtube -- callback is called on each found item (or error)
function search_youtube (query, callback) {
  var searchParams = {
    part:             'snippet',
    type:             'video',
    q:                query,
    maxResults:       50,
    order:            'date',
    safeSearch:       'moderate',
    videoEmbeddable:  true
  };

  youtube.search.list (searchParams, function (err, res) {
    if (err) {
      callback (err);
      return;
    }

    res.items.forEach (function (result) {
      var video = {
        id:            result.id.videoId,
        urlShort:      'https://youtu.be/' + result.id.videoId,
        urlLong:       'https://www.youtube.com/watch?v=' + result.id.videoId,
        published:     result.snippet.publishedAt,
        title:         result.snippet.title || '',
        description:   result.snippet.description || '',
        images:        result.snippet.thumbnails,
        channelTitle:  result.snippet.channelTitle,
        channelId:     result.snippet.channelId,
        live:          result.snippet.liveBroadcastContent || ''
      };

      // When you don't need `duration` and `definition` you can skip the section
      // below to save API credits, but don't forget the `callback (null, video);`
      var listParams = {
        part: 'contentDetails',
        id: video.id
      };

      youtube.videos.list (listParams, function (err2, data) {
        if (err2) {
          callback (err2);
          return;
        }

        if (data.items.length) {
          data.items[0].contentDetails.duration.replace (/PT(\d+)M(\d+)S/, function (t, m, s) {
            video.duration = (parseInt (m, 10) * 60) + parseInt (s, 10);
          });

          video.definition = data.items[0].contentDetails.definition;
          callback (null, video);
        }
      });
    });
  });
}

module.exports = {
  search_youtube
}
