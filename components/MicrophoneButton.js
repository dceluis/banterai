import React, { useState, useEffect } from 'react';
import { getLanguageCode } from '../utils/lang';
import LanguageSelector from '../components/LanguageSelector'

function MicrophoneButton() {
  const [language, setLanguage] = useState('English');
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(undefined);
  const [error, setError] = useState(null);
  const [transcriber, setTranscriber] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [conversation, setConversation] = useState([]);

  const getMicPermission = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      setHasPermission(true);
    }).catch(err => {
      setError("You must allow access to your microphone to use this app.");
      setHasPermission(false);
    });
  }

  const speak = (text) => {
    const synth = window.speechSynthesis;

    if (synth.speaking) {
      synth.cancel();
    }

    if (text !== '') {
      const speakText = new SpeechSynthesisUtterance(text);
      speakText.lang = getLanguageCode(language);

      speakText.onstart = e => {
        setIsRecording(false);
      }
      speakText.onend = e => {
        setIsRecording(true);
      }
      synth.speak(speakText);
    }
  }

  const buildTranscribeAudio = () => {
    // Check if the browser supports the Web Speech API
    if (!('webkitSpeechRecognition' in window)) {
      setError("Sorry, your browser doesn't support the Web Speech API");
      return null;
    }

    const transcriber = new webkitSpeechRecognition();
    // transcriber.interimResults = true;
    transcriber.continuous = true;

    transcriber.onstart = () => {
      console.log('Transcription started');
    };

    transcriber.onresult = (event) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const transcript = lastResult[0].transcript;

      console.log("Detected transcript:" + transcript);
      setTranscript(transcript);
    }

    transcriber.onerror = (event) => {
      console.log("Error occurred in transcription: " + event.error);
    }

    transcriber.onend = () => {
      console.log("Transcription ended");
      setIsRecording(false);
    }

    return transcriber;
  }

  const handleClick = () => {
    if (!hasPermission) {
      getMicPermission();
    }

    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
    }
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
    const transcriber = buildTranscribeAudio();

    setTranscriber(transcriber);
  }, []);

  useEffect(() => {
    if (transcriber) {
      if (hasPermission) {
        if (isRecording) {
          transcriber.start();
        } else {
          transcriber.stop();
        }
      }
    }
  }, [transcriber, hasPermission, isRecording]);

  useEffect(() => {
    async function fetchConversation() {
      if (transcript) {
        const newEntry = "Human: " + transcript;
        // Only keep the last 5 interactions
        const pastEntries = conversation.slice(-10);
        const newConversation = [...pastEntries, newEntry];

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation: newConversation.join("\n"),
            language: language
          }),
        });

        let responseJson = await res.json();
        if (res.status !== 200) {
          setError(responseJson.message);
        } else {
          setConversation([...newConversation, "AI: " + responseJson.reply]);
          speak(responseJson.reply);
        }
      }
    }
    fetchConversation();
  }, [transcript]);

  useEffect(() => {
    setConversation([]);
    if (transcriber) {
      transcriber.lang = getLanguageCode(language);
    }
  }, [language]);

  return (
    <div>
      <LanguageSelector updateLanguage={setLanguage}/>
      <button onClick={handleClick}>
        {isRecording ? 'Stop chatting' : 'Start chatting'}
      </button>
      <div>{conversation.map((entry, index) => <p key={index}>{entry}</p>)}</div>
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default MicrophoneButton;
