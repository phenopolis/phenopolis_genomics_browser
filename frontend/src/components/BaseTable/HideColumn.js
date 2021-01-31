import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Chip,
  Avatar,
  Grid,
  Tooltip,
  Button,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/pro-regular-svg-icons';
import { faThumbtack, faSigma, faText, faEllipsisH } from '@fortawesome/pro-solid-svg-icons';

import { indexOf } from 'underscore';

import { Column } from 'react-base-table';

var timer;

const SortableItem = SortableElement(({ item, index, ItemIndex, onChipClick }) => {
  const classes = useStylesSortableItem();

  const handleChipClick = (item, ItemIndex, action) => {
    onChipClick(item, ItemIndex, action);
  };

  const onClickHandler = (event, item, ItemIndex) => {
    clearTimeout(timer);

    if (event.detail === 1) {
      timer = setTimeout(() => {
        handleChipClick(item, ItemIndex, 'single');
      }, 200);
    } else if (event.detail === 2) {
      handleChipClick(item, ItemIndex, 'double');
    }
  };

  const handleDelete = () => {};

  return (
    <li className={classes.li}>
      <Tooltip title={item.des} placement="top">
        <Chip
          variant="outlined"
          color="default"
          onClick={(event) => onClickHandler(event, item, ItemIndex)}
          label={item.name}
          avatar={
            item.type === 'string' ? (
              <Avatar style={{ backgroundColor: '#26a69a', color: 'white' }}>
                <FontAwesomeIcon icon={faText} />
              </Avatar>
            ) : item.type === 'number' ? (
              <Avatar style={{ backgroundColor: '#ef5350', color: 'white' }}>
                <FontAwesomeIcon icon={faSigma} />
              </Avatar>
            ) : item.type === 'object' ? (
              <Avatar style={{ backgroundColor: '#42a5f5', color: 'white' }}>
                <FontAwesomeIcon icon={faEllipsisH} />
              </Avatar>
            ) : (
              <Avatar style={{ backgroundColor: 'black', color: 'white' }}>?</Avatar>
            )
          }
          deleteIcon={
            item.frozen ? (
              <Avatar style={{ backgroundColor: 'rgba(254,217,10,.7)', color: 'black' }}>
                <FontAwesomeIcon icon={faThumbtack} style={{ fontSize: '14' }} />
              </Avatar>
            ) : null
          }
          onDelete={item.frozen ? (event) => onClickHandler(event, item, ItemIndex) : null}
          className={'hideColumn-chip'}
          style={
            item.show
              ? { color: 'black', fontWeight: '400', backgroundColor: '#e8e8e8' }
              : { color: 'darkgrey', opacity: '0.5' }
          }
        />
      </Tooltip>
    </li>
  );
});

const useStylesSortableItem = makeStyles((theme) => ({
  li: {
    // 'border': '1px solid black',
    height: '40px',
    // 'width': '200px',
    margin: '0',
    'list-style-type': 'none',
    display: 'inline-block',
  },
}));

const SortableList = SortableContainer(({ items, onChipClick }) => {
  useEffect(() => {
    console.log(items);
  }, []);
  return (
    <ul>
      {items.map((item, index) => (
        <SortableItem
          key={`item-${index}`}
          index={index}
          item={item}
          ItemIndex={index}
          onChipClick={onChipClick}
        />
      ))}
    </ul>
  );
});

const HideColumn = (props) => {
  const onSortEnd = ({ oldIndex, newIndex }) => {
    let newTableColumn = arrayMove(props.tableColumn, oldIndex, newIndex);
    props.onHideColumn(newTableColumn, 'set');
  };

  const onSelectAll = (action) => {
    if (action === 'all') {
      const newTableColumn = [...props.tableColumn];
      for (let i = 0; i < newTableColumn.length; i++) {
        newTableColumn[i].show = 1;
      }
      console.log(newTableColumn);
      props.onHideColumn(newTableColumn, 'set');
    } else if (action === 'none') {
      const newTableColumn = [...props.tableColumn];
      for (let i = 0; i < newTableColumn.length; i++) {
        newTableColumn[i].show = 0;
      }
      console.log(newTableColumn);
      props.onHideColumn(newTableColumn, 'set');
    }
  };

  const handleChipClick = (item, index, action) => {
    if (action === 'single') {
      const newTableColumn = [...props.tableColumn];
      newTableColumn[index].show = 1 - newTableColumn[index].show;
      props.onHideColumn(newTableColumn, 'set');
    } else {
      const newTableColumn = [...props.tableColumn];
      if (newTableColumn[index].frozen) {
        newTableColumn[index].frozen = null;
      } else {
        newTableColumn[index].frozen = Column.FrozenDirection.LEFT;
      }
      props.onHideColumn(newTableColumn, 'rerender');
    }
  };

  return (
    <Card elevation={0} className={'hideColumn-root'}>
      <CardContent style={{ marginBottom: 0, paddingLeft: '4em', paddingBottom: 0 }}>
        <Chip
          color="primary"
          variant="outlined"
          disabled={props.tableColumn.every((x) => x.show === 1) ? true : false}
          avatar={
            <Avatar>
              <FontAwesomeIcon icon={faCheck} />
            </Avatar>
          }
          label={'Select All'}
          // className={'hideColumn-allSelectChip'}
          onClick={() => onSelectAll('all')}
          style={{ color: '#2196f3', fontWeight: 700 }}
        />

        <Chip
          color="default"
          variant="outlined"
          disabled={props.tableColumn.every((x) => x.show === 0) ? true : false}
          avatar={
            <Avatar style={{ backgroundColor: 'black', color: 'white' }}>
              <FontAwesomeIcon icon={faTimes} />
            </Avatar>
          }
          label={'Unselect All'}
          // className={'hideColumn-allSelectChip'}
          onClick={() => onSelectAll('none')}
          style={{ color: 'black', fontWeight: 700, marginLeft: '10px' }}
        />
      </CardContent>

      <CardContent style={{ marginBottom: '0em', paddingBottom: '0em' }}>
        <span style={{ margin: '0em 3em 0em 3em', color: 'darkgrey' }}>
          <strong style={{ color: 'black' }}> Drag </strong> below chips to reorder the column.
          <strong style={{ color: 'black' }}> Single Click </strong> to show/hide certain column.
          <strong style={{ color: 'black' }}> Double Click </strong> to freeze column on the left
          side.
        </span>
        <SortableList
          distance={1}
          axis="xy"
          items={props.tableColumn}
          onSortEnd={onSortEnd}
          onChipClick={handleChipClick}
        />
      </CardContent>

      <CardContent style={{ marginTop: '0em', paddingTop: '0px' }}>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          className="m-0"
          style={{ paddingTop: '1em', color: 'darkgrey' }}>
          <Avatar
            className={'hideColumn-smallAvatar'}
            style={{ backgroundColor: '#26a69a', color: 'white' }}>
            <FontAwesomeIcon icon={faText} />
          </Avatar>{' '}
          means this column is text;
          <Avatar
            className={'hideColumn-smallAvatar'}
            style={{ backgroundColor: '#ef5350', color: 'white' }}>
            <FontAwesomeIcon icon={faSigma} />
          </Avatar>
          means this column is numeric;
          <Avatar
            className={'hideColumn-smallAvatar'}
            style={{ backgroundColor: '#42a5f5', color: 'white' }}>
            <FontAwesomeIcon icon={faEllipsisH} />
          </Avatar>
          means this column contains a list;
        </Grid>
      </CardContent>
    </Card>
  );
};

export default HideColumn;
