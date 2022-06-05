import * as React from 'react';

const PeerConnectForm = (props: any) => {
  return(
    <form onSubmit={props.handleSubmit}>
      <label>
        Target ID:
        <input type="text" onChange={props.handleIdChange} value={props.targetID}/>
      </label>
      <input type="submit" value="Submit" />
    </form>
  )
}

export default PeerConnectForm;
