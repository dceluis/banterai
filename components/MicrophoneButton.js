import React, { useState, useEffect } from 'react';

function MicrophoneButton() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(undefined);
  const [error, setError] = useState(null);
  const [transcribe, setTranscribe] = useState(null);

  const getMicPermission = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      setHasPermission(true);
    }).catch(err => {
      setError("You must allow access to your microphone to use this app.");
      setHasPermission(false);
    });
  }

  const buildTranscribeAudio = () => {
    // Check if the browser supports the Web Speech API
    if (!('webkitSpeechRecognition' in window)) {
      setError("Sorry, your browser doesn't support the Web Speech API");
      return null;
    }

    const transcribe = new webkitSpeechRecognition();
    // transcribe.interimResults = true;
    transcribe.continuous = true;

    transcribe.onstart = () => {
      console.log('Transcription started');
    };

    transcribe.onresult = (event) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const transcript = lastResult[0].transcript;

      console.log(transcript);
    }

    transcribe.onerror = (event) => {
      console.log("Error occurred in transcription: " + event.error);
    }

    transcribe.onend = () => {
      console.log("Transcription ended");
    }

    return transcribe;
  }

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
    }
  }

  const handleClick = () => {
    if (!hasPermission) {
      getMicPermission();
    }

    toggleRecording();
  };

  useEffect(() => {
    navigator.permissions.query({ name: 'microphone' }).then((result) => {
      if (result.state === 'granted') {
        setHasPermission(true);
      } else if (result.state === 'prompt') {
        setHasPermission(undefined);
      } else if (result.state === 'denied') {
        setHasPermission(false);
      }
    });
  }, []);

  useEffect(() => {
    const transcribe = buildTranscribeAudio();

    setTranscribe(transcribe);
  }, []);

  useEffect(() => {
    if (hasPermission) {
      if (transcribe) {
        if (isRecording) {
          transcribe.start();
        } else {
          transcribe.stop();
        }
      }
    }
  }, [isRecording, transcribe, hasPermission]);

  return (
    <div>
      <button onClick={handleClick}>
        {isRecording ? 'Stop chatting' : 'Start chatting'}
      </button>

      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default MicrophoneButton;