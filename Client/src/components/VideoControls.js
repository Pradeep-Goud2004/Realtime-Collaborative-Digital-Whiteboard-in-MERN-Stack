import React, { useState, useRef, useEffect } from 'react';
import './VideoControls.css';

const VideoControls = ({ roomId, user, socket }) => {
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for remote streams
    socket.on('user-video-stream', (data) => {
      handleRemoteStream(data);
    });

    socket.on('user-audio-stream', (data) => {
      handleRemoteAudio(data);
    });

    socket.on('user-screen-share', (data) => {
      handleRemoteScreenShare(data);
    });

    socket.on('user-stopped-sharing', (data) => {
      removeRemoteStream(data.userId);
    });

    return () => {
      socket.off('user-video-stream');
      socket.off('user-audio-stream');
      socket.off('user-screen-share');
      socket.off('user-stopped-sharing');
    };
  }, [socket]);

  useEffect(() => {
    return () => {
      // Cleanup streams on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  const handleRemoteStream = (data) => {
    const { userId, streamId } = data;
    // In a real implementation, you'd use WebRTC to receive the stream
    // For now, we'll just track the remote users
    setRemoteStreams(prev => {
      if (!prev.find(s => s.userId === userId)) {
        return [...prev, { userId, streamId, type: 'video' }];
      }
      return prev;
    });
  };

  const handleRemoteAudio = (data) => {
    const { userId, streamId } = data;
    setRemoteStreams(prev => {
      if (!prev.find(s => s.userId === userId)) {
        return [...prev, { userId, streamId, type: 'audio' }];
      }
      return prev;
    });
  };

  const handleRemoteScreenShare = (data) => {
    const { userId, streamId } = data;
    setRemoteStreams(prev => {
      const filtered = prev.filter(s => s.userId !== userId && s.type !== 'screen');
      return [...filtered, { userId, streamId, type: 'screen' }];
    });
  };

  const removeRemoteStream = (userId) => {
    setRemoteStreams(prev => prev.filter(s => s.userId !== userId));
  };

  const toggleVideo = async () => {
    try {
      if (!isVideoOn) {
        // Request ONLY video, never request audio
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 }, 
          audio: false  // Explicitly false - never request audio
        });
        
        // If audio is already on, combine streams
        if (isAudioOn && localStream) {
          const audioTracks = localStream.getAudioTracks();
          const combinedStream = new MediaStream();
          
          // Add video tracks from new video stream
          videoStream.getVideoTracks().forEach(track => {
            combinedStream.addTrack(track);
          });
          
          // Add existing audio tracks (if any)
          if (audioTracks.length > 0) {
            audioTracks.forEach(track => {
              combinedStream.addTrack(track);
            });
          }
          
          setLocalStream(combinedStream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = combinedStream;
          }
        } else {
          // Just video, no audio
          setLocalStream(videoStream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = videoStream;
          }
        }
        
        setIsVideoOn(true);

        // Notify server
        if (socket) {
          socket.emit('video-toggle', {
            roomId,
            userId: user.userId,
            username: user.username,
            enabled: true
          });
        }
      } else {
        // Turn off video only
        if (localStream) {
          // Stop all video tracks
          localStream.getVideoTracks().forEach(track => {
            track.stop();
            localStream.removeTrack(track);
          });
          
          const audioTracks = localStream.getAudioTracks();
          
          if (audioTracks.length > 0) {
            // Keep audio running - create new stream with only audio
            const audioOnlyStream = new MediaStream(audioTracks);
            setLocalStream(audioOnlyStream);
            // Hide video element since there's no video
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = null;
            }
          } else {
            // No audio, stop everything
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = null;
            }
            setLocalStream(null);
          }
        }
        setIsVideoOn(false);

        // Notify server
        if (socket) {
          socket.emit('video-toggle', {
            roomId,
            userId: user.userId,
            username: user.username,
            enabled: false
          });
        }
      }
    } catch (error) {
      console.error('Error toggling video:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const toggleAudio = async () => {
    try {
      if (!isAudioOn) {
        // Request ONLY audio, never request video
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          video: false,  // Explicitly false - never request video
          audio: true 
        });
        
        // If video is already on, combine streams
        if (isVideoOn && localStream) {
          const videoTracks = localStream.getVideoTracks();
          const combinedStream = new MediaStream();
          
          // Add existing video tracks (if any)
          if (videoTracks.length > 0) {
            videoTracks.forEach(track => {
              combinedStream.addTrack(track);
            });
          }
          
          // Add audio tracks from new audio stream
          audioStream.getAudioTracks().forEach(track => {
            combinedStream.addTrack(track);
          });
          
          setLocalStream(combinedStream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = combinedStream;
          }
        } else {
          // Just audio, no video
          setLocalStream(audioStream);
          // Audio-only doesn't need video element
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = null; // No video to show
          }
        }
        
        setIsAudioOn(true);

        // Notify server
        if (socket) {
          socket.emit('audio-toggle', {
            roomId,
            userId: user.userId,
            username: user.username,
            enabled: true
          });
        }
      } else {
        // Turn off audio only
        if (localStream) {
          // Stop all audio tracks
          localStream.getAudioTracks().forEach(track => {
            track.stop();
            localStream.removeTrack(track);
          });
          
          const videoTracks = localStream.getVideoTracks();
          
          if (videoTracks.length > 0) {
            // Keep video running - create new stream with only video
            const videoOnlyStream = new MediaStream(videoTracks);
            setLocalStream(videoOnlyStream);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = videoOnlyStream;
            }
          } else {
            // No video, stop everything
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = null;
            }
            setLocalStream(null);
          }
        }
        setIsAudioOn(false);

        // Notify server
        if (socket) {
          socket.emit('audio-toggle', {
            roomId,
            userId: user.userId,
            username: user.username,
            enabled: false
          });
        }
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: true 
        });
        
        // Stop current video if sharing
        if (localStream) {
          localStream.getVideoTracks().forEach(track => track.stop());
        }

        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);
        setIsVideoOn(true);

        // Notify server
        if (socket) {
          socket.emit('screen-share-start', {
            roomId,
            userId: user.userId,
            username: user.username
          });
        }
        
        // Stop screen share when user clicks stop sharing in browser
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setIsVideoOn(false);
          if (socket) {
            socket.emit('screen-share-stop', {
              roomId,
              userId: user.userId,
              username: user.username
            });
          }
          // Restore camera if it was on before
          if (isAudioOn) {
            toggleVideo();
          }
        };
      } else {
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
          }
        }
        setIsScreenSharing(false);
        setIsVideoOn(false);

        // Notify server
        if (socket) {
          socket.emit('screen-share-stop', {
            roomId,
            userId: user.userId,
            username: user.username
          });
        }
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      if (error.name !== 'NotAllowedError') {
        alert('Could not share screen. Please check permissions.');
      }
    }
  };

  return (
    <div className="video-controls">
      <h3>Video & Audio</h3>
      
      {localStream && (
        <div className="local-video-container">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="local-video"
          />
          <div className="video-label">{user.username} (You)</div>
        </div>
      )}

      <div className="control-buttons">
        <button
          className={`control-btn ${isVideoOn ? 'active' : ''}`}
          onClick={toggleVideo}
          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn ? '📹' : '📷'}
        </button>
        <button
          className={`control-btn ${isAudioOn ? 'active' : ''}`}
          onClick={toggleAudio}
          title={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioOn ? '🎤' : '🔇'}
        </button>
        <button
          className={`control-btn ${isScreenSharing ? 'active' : ''}`}
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          {isScreenSharing ? '🖥️' : '📺'}
        </button>
      </div>

      {remoteStreams.length > 0 && (
        <div className="remote-streams">
          <h4>Participants</h4>
          {remoteStreams.map((stream, index) => (
            <div key={index} className="remote-stream-item">
              <div className="stream-indicator">
                {stream.type === 'video' && '📹'}
                {stream.type === 'audio' && '🎤'}
                {stream.type === 'screen' && '🖥️'}
              </div>
              <span className="stream-user">{stream.userId}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoControls;

