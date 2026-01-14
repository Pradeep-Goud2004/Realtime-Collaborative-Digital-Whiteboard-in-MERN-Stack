import React, { useState, useRef, useEffect } from 'react';
import './CameraButton.css';

const CameraButton = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
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

  const toggleCamera = async () => {
    try {
      if (!isCameraOn) {
        // Turn on camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }, 
          audio: false 
        });
        
        setLocalStream(stream);
        setIsCameraOn(true);
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
      } else {
        // Turn off camera
        if (localStream) {
          localStream.getVideoTracks().forEach(track => {
            track.stop();
          });
          setLocalStream(null);
        }
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        setIsCameraOn(false);
        setShowVideo(false);
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
      alert('Could not access camera. Please check permissions.');
      setIsCameraOn(false);
      setShowVideo(false);
    }
  };

  return (
    <>
      <button
        className={`camera-toggle-btn ${isCameraOn ? 'active' : ''}`}
        onClick={toggleCamera}
        title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
      >
        {isCameraOn ? '📹' : '📷'}
      </button>
      
      {showVideo && (
        <div className="camera-preview">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="camera-video"
            style={{ display: 'block' }}
          />
          <button
            className="camera-close-btn"
            onClick={() => {
              if (localStream) {
                localStream.getVideoTracks().forEach(track => track.stop());
                setLocalStream(null);
              }
              if (videoRef.current) {
                videoRef.current.srcObject = null;
              }
              setIsCameraOn(false);
              setShowVideo(false);
            }}
            title="Close camera preview"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default CameraButton;

