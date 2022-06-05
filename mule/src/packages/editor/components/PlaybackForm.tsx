import * as React from 'react';

const PlaybackForm = (props: any) => {
  return(
    <div>
      <button onClick={props.recordSession}>Record Session</button>
      <button onClick={props.replaySession}>Replay Session</button>
      <label>
        Playback Speed:
        <select value={props.playbackSpeed} onChange={props.handlePlaybackChange}>
          <option value="0.25">0.25</option>
          <option value="0.5">0.5</option>
          <option value="0.75">0.75</option>
          <option value="1">Normal</option>
          <option value="1.25">1.25</option>
          <option value="1.5">1.5</option>
          <option value="1.75">1.75</option>
          <option value="2">2</option>
        </select>
      </label>
    </div>
  )
}

export default PlaybackForm;
