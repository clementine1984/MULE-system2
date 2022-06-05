import * as React from 'react';
import Comment from './Comment';

const CommentSidebar = (props: any) => {
  const comments = props.comments.map( (comment, i) => {
    if(comment.lineNumber > props.visibleRange.startLine && comment.lineNumber < props.visibleRange.endLine){
      return(
        <Comment
          content={comment.content}
          handleCommentDelete={props.handleCommentDelete}
          handleCommentEdit={props.handleCommentEdit}
          handleCommentEditChange={props.handleCommentEditChange}
          key={i}
          index={i}
        />
      )
    }
  })

  const style: React.CSSProperties = {
    float: 'right'
  }
  return(
    <div style={style}>
      {comments}
    </div>
  )
}

export default CommentSidebar;
