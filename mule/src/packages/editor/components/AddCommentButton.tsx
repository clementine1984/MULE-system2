import * as React from 'react';

const AddCommentButton = (props: any) => {
  return(
    <form>
      <button onClick={props.addComment}>Add Comment!</button>
    </form>
  )
}

export default AddCommentButton;
