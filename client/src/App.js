import React, { useState, useEffect, useRef } from "react";

import "./App.css";
import Video from "./components/Video";

import { io } from "socket.io-client";

import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneAlt } from "@fortawesome/free-solid-svg-icons";
import IncomingCallAudio from "./sounds/incomingCall.mp3";

import Peer from "simple-peer";

// const socket = io("http://localhost:5000");
const socket = io("https://gyanendra9.herokuapp.com/");


function App() {
  let userName = useSelector((state) => state.user.userName);

  const [myUserId, setMyUserId] = useState("");
  const [userCalling, setUserCalling] = useState({});
  const [calling, setCalling] = useState(false);
  const [stream, setStream] = useState("");
  const userVideoRef = useRef(null);
  const peerRef = useRef();
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const videoRef = useRef(null);
  const [isCallAccepted, setIsCallAccepted] = useState(false);

  const [userToCallId, setUserToCallId] = useState("");
  const [screenStream, setScreenStream] = useState("")

  const callUser = (userID) => {
    setUserToCallId(userID);
    setCalling(true);

    var peer = new Peer({ initiator: true, trickle: false, stream: stream });
    peer.on("signal", (data) => {
      console.log(data);
      socket.emit("callUser", {
        from: myUserId,
        to: userID,
        userName,
        isUserCalling: true,
        signal: data,
        isCallAccepted: false,
      });
    });

    peer.on("stream", (currentStream) => {
      console.log(currentStream);
      userVideoRef.current.srcObject = currentStream;
    });

    socket.on("callAccepted", (data) => {
      console.log("callAccepted");
      setIsCallAccepted(true);
      peer.signal(data.signalData);
    });

    peerRef.current = peer;
  };

  const RejectCall = () => {
    socket.emit("rejectCall", {
      to: userToCallId,
      from: myUserId,
      isUserCalling: false,
      isCallAccepted: false,
    });

    setUserCalling({});
  };

  const cancelCall = (userID) => {
    socket.emit("rejectCall", {
      to: userToCallId,
      from: myUserId,
      isUserCalling: false,
      isCallAccepted: false,
    });
    setCalling(false);
    setUserCalling({});

    setIsCallAccepted(false);
  };

  const AnswerCall = () => {
    console.log(userCalling);
    setIsCallAccepted(true);
    var peer = new Peer({ initiator: false, trickle: false, stream: stream });

    peer.on("signal", (data) => {
      console.log(data);
      socket.emit("answerCall", {
        from: myUserId,
        to: userCalling.from,
        isUserCalling: false,
        isCallAccepted: true,
        signalData: data,
      });
    });

    peer.on("stream", (currentStream) => {
      console.log(currentStream);
      userVideoRef.current.srcObject = currentStream;
    });

    peer.signal(userCalling.signal);

    peerRef.current = peer;
  };

  let incomingCall = new Audio(IncomingCallAudio);

  useEffect(() => {
    if (userCalling.isUserCalling && !isCallAccepted) {
      incomingCall.play();
    }
  }, [userCalling, isCallAccepted]);

  const LeaveCall = () => {
    peerRef.current.destroy();
    window.location.reload();
  };

  const shareScreen = () => {
    if (!isScreenSharing) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((screenStream) => {
          peerRef.current.replaceTrack(
            stream.getVideoTracks()[0],
            screenStream.getVideoTracks()[0],
            stream
          );
          videoRef.current.srcObject = screenStream;
          setScreenStream(screenStream)
          screenStream.getTracks()[0].onended = () => {
            peerRef.current.replaceTrack(
              screenStream.getVideoTracks()[0],
              stream.getVideoTracks()[0],
              stream
            );
            videoRef.current.srcObject = stream;
          };
        })
        .then(() => setIsScreenSharing(true))
        .catch((err) => {
          console.log(err);
          alert("Unable to share screen");
        });
    } else {
      peerRef.current.replaceTrack(
        screenStream.getVideoTracks()[0],
        stream.getVideoTracks()[0],
        stream
      );
      videoRef.current.srcObject = stream;
      setIsScreenSharing(false)
    }
  };

  useEffect(() => {
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
    
        // First get ahold of the legacy getUserMedia, if present
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    
        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }
    
        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setStream(stream);
      })
      .catch((err) => {
        console.error("error:", err);
      });

    socket.on("userID", function (data) {
      console.log(data);
      setMyUserId(data);
    });

    socket.on("userCalling", (data) => {
      console.log(data);
      setUserCalling({ ...data });
    });
    socket.on("callRejected", (data) => {
      console.log(data);
      setCalling(false);
      setIsCallAccepted(false);
    });
  }, []);

  return (
    <div>
      {userCalling.isUserCalling && !isCallAccepted && (
        <div
          className="modal fade show d-block"
          id="exampleModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
          data-backdrop="static"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  <FontAwesomeIcon icon={faPhoneAlt} /> {userCalling.userName}{" "}
                  is calling...
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  data-dismiss="modal"
                  onClick={() => RejectCall(userCalling.id)}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={AnswerCall}
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Video
        callUser={callUser}
        myUserId={myUserId}
        calling={calling}
        cancelCall={cancelCall}
        stream={stream}
        userVideoRef={userVideoRef}
        isCallAccepted={isCallAccepted}
        videoRef={videoRef}
        LeaveCall={LeaveCall}
        shareScreen={shareScreen}
      />
    </div>
  );
}

export default App;
