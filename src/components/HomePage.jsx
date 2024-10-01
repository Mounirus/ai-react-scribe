import { useEffect, useRef, useState } from "react";

const HomePage = ({ setFile, setAudioStream }) => {
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [duration, setDuration] = useState(0);
  const [audioChunks, setAudioChunks] = useState([]);

  const mediaRecorder = useRef(null);
  const mimeType = "audio/webm";

  async function startRecording() {
    let tempStream;

    console.log("Start recording");

    try {
      const streamData = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      tempStream = streamData;
    } catch (err) {
      console.log(err.message);
      alert(err.message);
      return;
    }
    setRecordingStatus("recording");

    // Create a new Media recorder instance using the stream
    const media = new MediaRecorder(tempStream, { type: mimeType });
    mediaRecorder.current = media;

    mediaRecorder.current.start();
    let localAudioChunks = [];
    mediaRecorder.current.ondtaavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;

      if (event.data.size > 0) {
        localAudioChunks.push(event.data);
      }
    };
    setAudioChunks(localAudioChunks);
  }

  function stopRecording() {
    console.log("Stop recording");
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      setAudioStream(audioBlob);
      setAudioChunks([]);
      //setRecordingStatus("inactive");
      setDuration(0);
    };
  }

  useEffect(() => {
    if (recordingStatus === "inactive") return;
    const interval = setInterval(() => {
      setDuration((curr) => curr + 1);
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <main className="flex-1 p-4 flex flex-col justify-center gap-3 sm:gap-4 md:gap-5 text-center pb-20">
      <h1 className="font-semibold text-5xl sm:text-6xl md:text-7xl">
        Free<span className="text-blue-400 bold">Scribe</span>
      </h1>
      <h3 className="font-medium md:text-lg">
        Record <span className="text-blue-400">&rarr;</span> Transcribe
        <span className="text-blue-400">&rarr;</span> Translate
      </h3>
      <button
        onClick={
          recordingStatus === "recording" ? stopRecording : startRecording
        }
        className="flex justify-between gap-4 mx-auto items-center text-base w-72  max-w-full my-4 specialBtn px-4 py-2 rounded-lg"
      >
        <p className="text-blue-400">
          {recordingStatus === "inactive" ? "Record" : `Stop recording`}
        </p>
        <div className="flex items-center gap-2 ">
          {duration!==0 && <p className="text-sm ">{duration}s</p>}
          <i
            className={
              "fa-solid fa-microphone duration-200" +
              (recordingStatus === "recording" ? "text-rose-300" : "")
            }
          ></i>
        </div>
      </button>
      <p className="text-base">
        Or{" "}
        <label className="text-blue-400 cursor-pointer hover:text-blue-600 duration-200">
          upload{" "}
          <input
            onChange={(e) => {
              const tempFile = e.target.files[0];
              setFile(tempFile);
            }}
            className="hidden"
            type="file"
            accept=".mp3,.wave"
          />
        </label>{" "}
        an mp3 file
      </p>
      <p className="italic text-slate-400">Free now free forever</p>
    </main>
  );
};

export default HomePage;
