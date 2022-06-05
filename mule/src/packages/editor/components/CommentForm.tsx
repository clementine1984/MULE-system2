import * as React from 'react';

const CommentForm = (props: any) => {
  return(
    <form onSubmit={props.onSubmit}>
      <input type="text" value={props.value} onChange={props.onChange} onSubmit={props.onSubmit}/>
      <input type="submit" value="submit"/>
    </form>
  )
}

export default CommentForm;
