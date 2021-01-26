import React from 'react';
import { Card, CardContent, Chip, Avatar, Grid, Tooltip } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faCheck, faTimes } from '@fortawesome/pro-regular-svg-icons';

const HideColumn = (props) => {
  return (
    <Card elevation={0} className={'hideColumn-root'}>
      <CardContent style={{ marginBottom: 0, paddingBottom: 0 }}>
        {props.columnHide.every((x) => x.show === true) ? (
          <Chip
            color="default"
            variant="outlined"
            avatar={
              <Avatar style={{ backgroundColor: 'black', color: 'white' }}>
                <FontAwesomeIcon icon={faTimes} />
              </Avatar>
            }
            label={'Unselect All'}
            className={'hideColumn-allSelectChip'}
            onClick={() => props.onHideColumn(-2)}
          />
        ) : (
          <Chip
            color="secondary"
            variant="outlined"
            avatar={
              <Avatar>
                <FontAwesomeIcon icon={faCheck} />
              </Avatar>
            }
            label={'Select All'}
            className={'hideColumn-allSelectChip'}
            onClick={() => props.onHideColumn(-1)}
          />
        )}
      </CardContent>
      <CardContent>
        {props.columnHide.map((item, index) => {
          return (
            <Tooltip key={index} title={item.des} placement="top">
              <Chip
                key={index}
                variant="outlined"
                color="default"
                onClick={() => props.onHideColumn(index)}
                label={item.name}
                avatar={
                  item.type === 'string' ? (
                    <Avatar style={{ backgroundColor: '#26a69a', color: 'white' }}>T</Avatar>
                  ) : item.type === 'number' ? (
                    <Avatar style={{ backgroundColor: '#ef5350', color: 'white' }}>9</Avatar>
                  ) : item.type === 'object' ? (
                    <Avatar style={{ backgroundColor: '#42a5f5', color: 'white' }}>
                      <FontAwesomeIcon icon={faEllipsisH} />
                    </Avatar>
                  ) : (
                    <Avatar style={{ backgroundColor: 'black', color: 'white' }}>?</Avatar>
                  )
                }
                className={'hideColumn-chip'}
                style={
                  item.show
                    ? { color: 'black', fontWeight: '400', backgroundColor: '#d8d8d8' }
                    : { color: 'darkgrey' }
                }
              />
            </Tooltip>
          );
        })}
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          className="m-4"
          style={{ paddingTop: '1em', color: 'darkgrey' }}>
          <Avatar
            className={'hideColumn-smallAvatar'}
            style={{ backgroundColor: '#26a69a', color: 'white' }}>
            T
          </Avatar>{' '}
          means this column is text;
          <Avatar
            className={'hideColumn-smallAvatar'}
            style={{ backgroundColor: '#ef5350', color: 'white' }}>
            9
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
