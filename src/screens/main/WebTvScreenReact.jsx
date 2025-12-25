import React, { useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3030");

export default function App() {
	const videoRef = useRef(null);
	const mediaRecorderRef = useRef(null);
	const [localStream, setLocalStream] = useState(null);

	const startBroadcast = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { width: 1280, height: 720, frameRate: 30 },
				audio: true,
			});

			setLocalStream(stream);
			if (videoRef.current) videoRef.current.srcObject = stream;

			socket.emit("start-stream");

			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: "video/webm; codecs=vp8,opus",
			});

			mediaRecorder.ondataavailable = (event) => {
				if (event.data && event.data.size > 0) {
					event.data.arrayBuffer().then((buf) => {
						socket.emit("video-chunk", buf);
					});
				}
			};

			mediaRecorder.start(500);
			mediaRecorderRef.current = mediaRecorder;
		} catch (err) {
			console.error("Error:", err);
		}
	};

	const stopBroadcast = () => {
		if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
			mediaRecorderRef.current.stop();
		}

		if (localStream) {
			localStream.getTracks().forEach((track) => track.stop());
		}

		socket.emit("stop-stream");
		setLocalStream(null);
	};

	return (
		<div style={{ padding: "20px" }}>
			<h1>Browser Broadcaster</h1>

			<button onClick={startBroadcast}>Start Broadcast</button>
			<button onClick={stopBroadcast} style={{ marginLeft: "10px" }}>
				Stop Broadcast
			</button>

			<br />
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted
				style={{ width: "480px", height: "360px", border: "1px solid black", marginTop: "20px" }}
			></video>
		</div>
	);
}
