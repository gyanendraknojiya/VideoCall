import {
  faCopy,
  faMicrophone,
  faMicrophoneSlash,
  faPhoneAlt,
  faPhoneSlash,
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import './style.css';
import './style.scss';
import { setUserName } from '../Redux/Reducer';

import { useSelector, useDispatch } from 'react-redux';

import { CopyToClipboard } from 'react-copy-to-clipboard';

const Video = ({
  callUser,
  myUserId,
  calling,
  cancelCall,
  stream,
  userVideoRef,
  isCallAccepted,
  videoRef,
  LeaveCall,
  shareScreen,
}) => {
  const [userToCallId, setUserToCallId] = useState('');
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const userName = useSelector((state) => state.user.userName);

  const dispatch = useDispatch();

  const ToggleVideo = () => {
    stream.getVideoTracks()[0].enabled = isVideoMuted;
    setIsVideoMuted(!isVideoMuted);
  };

  const ToggleAudio = () => {
    stream.getAudioTracks()[0].enabled = isAudioMuted;
    setIsAudioMuted(!isAudioMuted);
  };

  return (
    <div className="vh-100 d-flex overflow-auto justify-content-center align-items-center vw-100 flex-column">
      <div
        className=" display-4  text-center  text-white position-absolute rounded border  p-2 w-50"
        style={{
          top: '15px',
        }}
      >
        <FontAwesomeIcon icon={faVideo} />
        Video Chat
      </div>
      <div className="row w-100">
        <div className="col-md-6 mx-auto py-5 text-center ">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="border rounded-lg bg-light"
            style={{
              height: 'auto',
              width: '100%',
              maxWidth: '350px',
              maxHeight: '200px',
              objectFit: 'cover',
            }}
          />
        </div>
        {isCallAccepted && (
          <div className="col-md-6 mx-auto  py-5 text-center ">
            <video
              ref={userVideoRef}
              autoPlay
              className="border rounded-lg bg-light"
              style={{
                height: 'auto',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '300px',
                objectFit: 'cover',
              }}
            />
          </div>
        )}
        {!isCallAccepted ? (
          <div className="row w-100">
            <div className="col-md-4 my-2 mx-auto ">
              <div className="bg-white p-5 rounded-lg shadow border">
                <h5 className="text-center mb-4">User details</h5>
                <div>
                  <div className="form-group">
                    <input
                      className="form-control rounded-0  "
                      placeholder="Enter your name"
                      onChange={(e) => dispatch(setUserName(e.target.value))}
                    />
                  </div>
                  <CopyToClipboard text={myUserId}>
                    <button className="btn btn-primary btn-sm border btn-block" disabled={!userName}>
                      <FontAwesomeIcon icon={faCopy} /> Copy your call ID
                    </button>
                  </CopyToClipboard>
                </div>
              </div>
            </div>
            <div className="col-md-4 my-2 mx-auto ">
              <div className="bg-white p-5 rounded-lg shadow border">
                <h5 className="text-center mb-4">Call a user</h5>
                <div>
                  <div className="form-group">
                    <input
                      className="form-control rounded-0  "
                      placeholder="Enter call ID"
                      onChange={(e) => setUserToCallId(e.target.value)}
                    />
                  </div>
                  {calling ? (
                    <button className="btn btn-danger btn-sm border btn-block" onClick={cancelCall}>
                      <FontAwesomeIcon icon={faPhoneSlash} /> Cancel
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-sm border btn-block" onClick={() => callUser(userToCallId)}>
                      <FontAwesomeIcon icon={faPhoneAlt} /> Make a call
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center w-100">
            <button className="btn btn-danger mx-1" onClick={LeaveCall}>
              Leave call
            </button>
            <button className="btn btn-primary mx-1" onClick={ToggleAudio}>
              {!isAudioMuted ? <FontAwesomeIcon icon={faMicrophone} /> : <FontAwesomeIcon icon={faMicrophoneSlash} />}
            </button>
            <button className="btn btn-primary mx-1" onClick={ToggleVideo}>
              {!isVideoMuted ? <FontAwesomeIcon icon={faVideo} /> : <FontAwesomeIcon icon={faVideoSlash} />}
            </button>
            <button className="btn btn-primary mx-1" onClick={shareScreen}>
              Share screen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Video;
