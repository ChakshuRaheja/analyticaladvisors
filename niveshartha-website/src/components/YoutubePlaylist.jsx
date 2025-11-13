import react from 'react'

const YouTubePlaylist = ({ playlistId }) => {
  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;

  return (
    <div className="flex justify-center p-4">
      <iframe
        width="100%"
        height="500"
        src={embedUrl}
        title="YouTube Playlist"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full max-w-4xl rounded-xl shadow-lg"
      ></iframe>
    </div>
  );
};

export default YouTubePlaylist;