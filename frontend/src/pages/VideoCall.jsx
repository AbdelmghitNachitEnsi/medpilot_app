// src/pages/VideoCall.jsx
import React, { useEffect, useRef } from "react";

const VideoCall = ({ roomName, displayName }) => {
  const jitsiRef = useRef(null);

  useEffect(() => {
    // Charger le script Jitsi si pas encore chargé
    const loadJitsiScript = () => {
      return new Promise((resolve) => {
        if (document.getElementById("jitsi-script")) return resolve();
        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.id = "jitsi-script";
        script.onload = resolve;
        document.body.appendChild(script);
      });
    };

    loadJitsiScript().then(() => {
      const domain = "meet.jit.si";
      const options = {
        roomName: roomName || "MEDPILOT_ROOM",
        parentNode: jitsiRef.current,
        width: "100%",
        height: 500,
        userInfo: { displayName: displayName || "Utilisateur" },
        interfaceConfigOverwrite: {
          DEFAULT_REMOTE_DISPLAY_NAME: "Patient",
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
        },
      };
      const api = new window.JitsiMeetExternalAPI(domain, options);

      // Optional: écouter les événements
      api.addEventListener("participantJoined", (event) => {
        console.log("Participant joined:", event);
      });

      api.addEventListener("readyToClose", () => {
        api.dispose();
      });

      return () => api.dispose();
    });
  }, [roomName, displayName]);

  return (
    <div
      ref={jitsiRef}
      style={{ width: "100%", height: "500px", borderRadius: "8px", overflow: "hidden" }}
    />
  );
};

export default VideoCall;