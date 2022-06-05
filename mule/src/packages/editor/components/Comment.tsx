import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const Comment = (props: any) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const open = Boolean(anchorEl);

  function handleEdit(){
    setEditMode(true);
  }

  function handleEditClose(event: React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    setEditMode(false);
  }

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const style: React.CSSProperties = {
    borderRadius: '5px',
    background: 'white',
    padding: '15px',
    boxShadow: '0px 10px 15px rgba(27, 28, 32, 0.1)',
    margin: '10px',
    marginTop: '0px',
    position: 'relative',
    top: props.distanceFromTop + 'px'
  }

  const ITEM_HEIGHT = 24;
  return(
    <div style={style} onClick={() => props.handleCommentClick(props.index)}>
      { editMode ?
        <form style={{display: "inline-block"}} onSubmit={handleEditClose}>
          <input type="text" value={props.content} onChange={props.handleCommentEditChange(props.index)}/>
          <input type="submit" value="Submit"/>
        </form>
        : props.content
      }
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: 200,
          },
        }}
      >
        <MenuItem onClick={handleEdit}>
          Edit
        </MenuItem>
        <MenuItem onClick={() => props.handleCommentDelete(props.index)}>
          Delete
        </MenuItem>
      </Menu>
    </div>
  )
}

export default Comment;
