import React, { useState, useRef, useEffect } from 'react';
import './MicrophoneButton.css';

const MicrophoneButton = ({ socket, roomId, user }) => {
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    return () => {
      // Cleanup stream on unmount
      if (localStream) {
        localStream.getAudioTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (error) {
          console.warn('Error closing AudioContext:', error);
        }
      }
    };
  }, [localStream]);

  useEffect(() => {
    // Monitor audio levels when microphone is on
    if (isMicrophoneOn && analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } else {
      setAudioLevel(0);
    }
  }, [isMicrophoneOn]);

  const toggleMicrophone = async () => {
    try {
      if (!isMicrophoneOn) {
        // Turn on microphone
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        setLocalStream(stream);
        setIsMicrophoneOn(true);

        // Notify server
        if (socket && roomId && user) {
          socket.emit('audio-toggle', {
            roomId,
            userId: user.userId,
            username: user.username,
            enabled: true
          });
        }

        // Create audio context for visualization
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          // Close existing context if any
          if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            try {
              audioContextRef.current.close();
            } catch (err) {
              // Ignore if already closed
            }
          }
          audioContextRef.current = new AudioContext();
          const source = audioContextRef.current.createMediaStreamSource(stream);
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          source.connect(analyserRef.current);
        } catch (err) {
          console.warn('Audio visualization not supported:', err);
        }
      } else {
        // Turn off microphone
        // Stop audio level monitoring first
        setAudioLevel(0);
        
        if (localStream) {
          localStream.getAudioTracks().forEach(track => {
            track.stop();
          });
          setLocalStream(null);
        }
        
        // Close AudioContext safely
        if (audioContextRef.current) {
          try {
            if (audioContextRef.current.state !== 'closed' && audioContextRef.current.state !== 'suspended') {
              audioContextRef.current.close().catch(err => {
                console.warn('Error closing AudioContext:', err);
              });
            }
          } catch (error) {
            console.warn('Error closing AudioContext:', error);
          }
          audioContextRef.current = null;
        }
        
        analyserRef.current = null;
        setIsMicrophoneOn(false);

        // Notify server
        if (socket && roomId && user) {
          socket.emit('audio-toggle', {
            roomId,
            userId: user.userId,
            username: user.username,
            enabled: false
          });
        }
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
      alert('Could not access microphone. Please check permissions.');
      setIsMicrophoneOn(false);
      setAudioLevel(0);
    }
  };

  return (
    <button
      className={`microphone-toggle-btn ${isMicrophoneOn ? 'active' : ''}`}
      onClick={toggleMicrophone}
      title={isMicrophoneOn ? 'Turn off microphone' : 'Turn on microphone'}
    >
      {isMicrophoneOn ? '🎤' : '🔇'}
      {isMicrophoneOn && audioLevel > 0 && (
        <span 
          className="audio-indicator" 
          style={{ 
            width: `${Math.min(100, (audioLevel / 255) * 100)}%` 
          }}
        />
      )}
    </button>
  );
};

export default MicrophoneButton;

