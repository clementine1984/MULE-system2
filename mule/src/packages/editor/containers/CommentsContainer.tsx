import * as React from 'react';
import { connect } from 'react-redux';
import { AppState } from '../store';
import Comment from '../components/Comment';
import CommentForm from '../components/CommentForm';
import AddCommentButton from '../components/AddCommentButton';
import { parseComments, addToComments, toggleCommentModal,
  setCommentContent, deleteComment, updateComment } from '../store/comments/actions';
import { CommentsState } from '../store/comments/types';
import { visibleRange, selectionRange } from '../store/editor/types';
import { EditorBroadcast } from '../editorBroadcast';
import { OperationType } from '../operation';

interface CommentProps {
  broadcast: any,
  parseComments: typeof parseComments,
  addToComments: typeof addToComments,
  toggleCommentModal: typeof toggleCommentModal,
  setCommentContent: typeof setCommentContent,
  deleteComment: typeof deleteComment,
  updateComment: typeof updateComment,
  currentCommentContent: string,
  comments: CommentsState["comments"],
  commentModalOpen: boolean,
  selectionMade: boolean,
  code: string,
  visibleRange: visibleRange,
  selectionRange: selectionRange
}

class CommentsContainer extends React.Component<CommentProps>{
  constructor(props: any){
    super(props);

    this.addComment = this.addComment.bind(this);
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    this.handleCommentDelete = this.handleCommentDelete.bind(this);
    this.handleCommentEdit = this.handleCommentEdit.bind(this);
    this.handleCommentEditChange = this.handleCommentEditChange.bind(this);
    this.handleCommentEditSubmit = this.handleCommentEditSubmit.bind(this);
    this.handleCommentClick = this.handleCommentClick.bind(this);
  }

  componentDidMount(){
    this.props.parseComments(this.props.code);
  }

  addComment(event){
    event.preventDefault();
    this.props.toggleCommentModal();
  }

  handleCommentChange(event){
    this.props.setCommentContent(event.target.value);
  }

  // link comment to editor position
  handleCommentSubmit(event){
    event.preventDefault();
    const comment = {
      content: this.props.currentCommentContent,
      ...this.props.selectionRange
    }
    this.props.broadcast({ type: OperationType.ADD_TO_COMMENTS, comment });
    this.props.addToComments(comment);
  }

  handleCommentDelete(index: number){
    // need to trigger broadcast when local comment is deleted
    this.props.broadcast({ type: OperationType.DELETE_COMMENT, index});
    console.log('index', index);
    this.props.deleteComment(index);
  }

  handleCommentEdit(index: number){
    console.log('index', index);
    console.log('edit');
  }

  handleCommentEditChange = index => event =>{
    event.preventDefault();
    const content = event.target.value;
    this.props.broadcast({ type: OperationType.EDIT_COMMENT, index, content });
    this.props.updateComment(index, content);
  }

  handleCommentEditSubmit(event: React.FormEvent<HTMLInputElement>){
    event.preventDefault();
  }

  handleCommentClick(index: number){
    const comment = this.props.comments[index];
    EditorBroadcast.setSelection(comment.startLine, comment.startColumn, comment.endLine, comment.endColumn);
  }

  render(){
    const comments = this.props.comments.map( (comment, i) => {
      // if(comment.startLine > this.props.visibleRange.startLine && comment.startLine < this.props.visibleRange.endLine){
        return(
          <Comment
            content={comment.content}
            distanceFromTop={EditorBroadcast.getTopForLineNumber(comment.startLine)}
            handleCommentDelete={this.handleCommentDelete}
            handleCommentEdit={this.handleCommentEdit}
            handleCommentEditChange={this.handleCommentEditChange}
            handleCommentEditSubmit={this.handleCommentEditSubmit}
            handleCommentClick={this.handleCommentClick}
            key={i}
            index={i}
          />
        )
      // }
    });
    const style: React.CSSProperties = {
      float: 'right'
    }
    return(
      <>
        { this.props.commentModalOpen ?
          <CommentForm
            value={this.props.currentCommentContent}
            onChange={this.handleCommentChange}
            onSubmit={this.handleCommentSubmit}
          /> : null
        }
        { this.props.selectionMade ? <AddCommentButton addComment={this.addComment}/> : null }
        <div style={style}>
          {comments}
        </div>
      </>
    )
  }
}

const mapStateToProps = (store: AppState) => {
  return{
    comments: store.commentsReducer.comments,
    commentModalOpen: store.commentsReducer.commentModalOpen,
    currentCommentContent: store.commentsReducer.currentCommentContent,
    selectionMade: store.editorReducer.selectionMade,
    code: store.editorReducer.code,
    visibleRange: store.editorReducer.visibleRange,
    selectionRange: store.editorReducer.selectionRange
  }
}

export default connect(
  mapStateToProps,
  {
    parseComments,
    addToComments,
    toggleCommentModal,
    setCommentContent,
    deleteComment,
    updateComment
  }
)(CommentsContainer);
