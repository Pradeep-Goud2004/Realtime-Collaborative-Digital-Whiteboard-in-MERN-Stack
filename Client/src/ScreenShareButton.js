import React, { useState, useRef, useEffect } from 'react';
import './ScreenShareButton.css';

const ScreenShareButton = ({ socket, roomId, user }) => {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const videoRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Update video element when stream changes
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
    
    return () => {
      // Cleanup stream on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: {
            cursor: 'always',
            displaySurface: 'monitor'
          },
          audio: true 
        });
        
        setLocalStream(stream);
        setIsScreenSharing(true);
        setShowVideo(true);
        
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => {
              console.error('Error playing video:', err);
            });
          }
        }, 100);

        // Notify server
        if (socket && roomId && user) {
          socket.emit('screen-share-start', {
            roomId,
            userId: user.userId,
            username: user.username
          });
        }
        
        // Stop screen share when user clicks stop sharing in browser
        stream.getVideoTracks()[0].onended = () => {
          handleStopScreenShare();
        };
      } else {
        handleStopScreenShare();
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
        alert('Could not share screen. Please check permissions.');
      }
      setIsScreenSharing(false);
      setShowVideo(false);
    }
  };

  const handleStopScreenShare = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
      setLocalStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScreenSharing(false);
    setShowVideo(false);

    // Notify server
    if (socket && roomId && user) {
      socket.emit('screen-share-stop', {
        roomId,
        userId: user.userId,
        username: user.username
      });
    }
  };

  return (
    <>
      <button
        className={`screen-share-toggle-btn ${isScreenSharing ? 'active' : ''}`}
        onClick={toggleScreenShare}
        title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
      >
        {isScreenSharing ? '🛑' : '🖥️'}
      </button>
      
      {showVideo && (
        <div className="screen-share-preview">
          <div className="screen-share-header">
            <span>Screen Sharing</span>
            <button
              className="screen-share-close-btn"
              onClick={handleStopScreenShare}
              title="Stop sharing screen"
            >
              ×
            </button>
          </div>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="screen-share-video"
            style={{ display: 'block' }}
          />
        </div>
      )}
    </>
  );
};

export default ScreenShareButton;




