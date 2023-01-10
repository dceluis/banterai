import React, { useState, useEffect } from 'react';
import { getLanguageCode } from '../utils/lang';
import LanguageSelector from '../components/LanguageSelector'

function MicrophoneButton() {
  const [language, setLanguage] = useState('English');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [transcriber, setTranscriber] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [conversation, setConversation] = useState([]);

  const getMicPermission = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => {
      setError("You must allow access to your microphone to use this app.");
    });
  }

  const speak = (text) => {
    const synth = window.speechSynthesis;

    const promise = new Promise((resolve, reject) => {
      if (synth.speaking) {
        synth.cancel();
      }

      if (text !== '') {
        const speakText = new SpeechSynthesisUtterance(text);
        speakText.lang = getLanguageCode(language);
        speakText.onend = e => {
          resolve();
        }
        synth.speak(speakText);
      } else {
        resolve();
      }
    });

    return promise;
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
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
    }
  };

  useEffect(() => {
    getMicPermission();
    const transcriber = buildTranscribeAudio();

    setTranscriber(transcriber);
  }, []);

  useEffect(() => {
    if (transcriber) {
      if (isRecording) {
        transcriber.start();
      } else {
        transcriber.stop();
      }
    }
  }, [isRecording]);

  useEffect(() => {
    const newEntry = "Human: " + transcript;
    // Only keep the last 5 interactions
    const pastEntries = conversation.slice(-10);
    const newConversation = [...pastEntries, newEntry];

    setConversation(newConversation);
  }, [transcript]);

  useEffect(() => {
    setConversation([]);
    if (transcriber) {
      transcriber.lang = getLanguageCode(language);
    }
  }, [language]);

  useEffect(() => {
    const lastEntry = conversation[conversation.length - 1];
    if (lastEntry) {
      if (lastEntry.startsWith("AI: ")) {
        setIsRecording(false);
        speak(lastEntry.substring(4)).then(() => {
          setIsRecording(true);
        });
      } else {
        speak("");

        async function fetchConversation(lastEntry) {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversation: conversation.join("\n"),
              language: language
            }),
          });

          let responseJson = await res.json();
          if (res.status !== 200) {
            setError(responseJson.message);
          } else {
            setConversation([...conversation, "AI: " + responseJson.reply]);
          }
        }

        fetchConversation(lastEntry.substring(7));
      }
    }
  }, [conversation]);

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
