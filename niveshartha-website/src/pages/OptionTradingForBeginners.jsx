import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import YouTubePlaylist from '../components/YoutubePlaylist.jsx';

const OptionTradingForBeginners = () => {

    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) {
        navigate('/login');
        return;
        }
    }, [currentUser])
  return (
    <div className="min-h-screen bg-white py-20 text-center">
        <div className="text-center">
            <h1 className="text-4xl font-bold mt-12 py-6">
                Option Trading For Beginners
            </h1>
            <YouTubePlaylist playlistId="PLknJcvpLgDpeuE4WopIk6v4Fxf0zG_5L2" />
        </div>
    </div>
  );
};

export default OptionTradingForBeginners;
