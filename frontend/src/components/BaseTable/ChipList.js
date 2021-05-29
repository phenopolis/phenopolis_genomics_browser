import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import TypeChip from '../Chip/TypeChip';
import { Chip } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({}));

const ChipList = (props) => {
  const classes = useStyles();

  const { compact } = useSelector((state) => ({
    compact: state.TableStatus.compact,
  }));

  // useEffect(() => {
  //   console.log(compact)
  // }, [compact]);

  if (compact) {
    return (
      <span>
        {typeof props.chips === 'object' && props.chips.length >= 1 ? (
          <>
            {typeof props.chips[0] === 'object' ? (
              <TypeChip
                label={props.chips[0].display}
                type={props.colName.base_href.replace(/[^a-zA-Z0-9_-]/g, '')}
                size="small"
                action="forward"
                popover={true}
                to={
                  props.chips[0].end_href
                    ? (props.colName.base_href + '/' + props.chips[0].end_href).replace(
                        /\/\//g,
                        '/'
                      )
                    : (props.colName.base_href + '/' + props.chips[0].display).replace(/\/\//g, '/')
                }
              />
            ) : (
              <Chip
                variant="outlined"
                size="small"
                label={props.chips[0]}
                style={{ margin: '3px' }}
              />
            )}
            {props.chips.length >= 2 && (
              <Chip
                label={props.chips.length - 1 + '+'}
                // variant="outlined"
                size="small"
                color="primary"
              />
            )}
          </>
        ) : (
          <>{props.chips}</>
        )}
      </span>
    );
  } else {
    return (
      <span>
        {typeof props.chips === 'object' ? (
          props.chips.map((chip, index) => {
            return (
              <>
                {typeof chip === 'object' ? (
                  <TypeChip
                    key={index}
                    label={chip.display}
                    type={props.colName.base_href.replace(/[^a-zA-Z0-9_-]/g, '')}
                    size="small"
                    action="forward"
                    popover={true}
                    to={
                      chip.end_href
                        ? (props.colName.base_href + '/' + chip.end_href).replace(/\/\//g, '/')
                        : (props.colName.base_href + '/' + chip.display).replace(/\/\//g, '/')
                    }
                  />
                ) : (
                  <Chip
                    key={index}
                    variant="outlined"
                    size="small"
                    label={chip}
                    style={{ margin: '3px' }}
                  />
                )}
              </>
            );
          })
        ) : (
          <>{props.chips}</>
        )}
      </span>
    );
  }
};

export default ChipList;
