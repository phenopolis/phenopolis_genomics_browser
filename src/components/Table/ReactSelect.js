import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Select, { components } from 'react-select';

import { Avatar, Icon } from '@material-ui/core';
import clsx from 'clsx';

const ValueComponent = (props) => {
  const classes = OptionStyles();
  const option = props.option;

  useEffect(() => {
    console.log(props);
  });

  return (
    <div className={classes.selectOption}>
      {option.type === 'string' ? (
        <Avatar
          className={classes.smallAvatar}
          style={{ color: 'white', backgroundColor: '#26a69a' }}>
          T
        </Avatar>
      ) : option.type === 'number' ? (
        <Avatar
          className={classes.smallAvatar}
          style={{ color: 'white', backgroundColor: '#ef5350' }}>
          9
        </Avatar>
      ) : option.type === 'object' ? (
        <Avatar
          className={classes.smallAvatar}
          style={{ color: 'white', backgroundColor: '#42a5f5' }}>
          <Icon className={clsx(classes.smallFilter, 'fad fa-ellipsis-h')} />
        </Avatar>
      ) : (
        <Avatar
          className={classes.smallAvatar}
          style={{ color: 'white', backgroundColor: 'black' }}>
          ?
        </Avatar>
      )}
      <span>{option.name}</span>
    </div>
  );
};

const Option = (props) => {
  const classes = OptionStyles();
  const option = props.data;

  return (
    <components.Option {...props}>
      <div className={classes.selectOption}>
        {option.type === 'string' ? (
          <Avatar
            className={classes.smallAvatar}
            style={{ color: 'white', backgroundColor: '#26a69a' }}>
            T
          </Avatar>
        ) : option.type === 'number' ? (
          <Avatar
            className={classes.smallAvatar}
            style={{ color: 'white', backgroundColor: '#ef5350' }}>
            9
          </Avatar>
        ) : option.type === 'object' ? (
          <Avatar
            className={classes.smallAvatar}
            style={{ color: 'white', backgroundColor: '#42a5f5' }}>
            <Icon className={clsx(classes.smallFilter, 'fad fa-ellipsis-h')} />
          </Avatar>
        ) : (
          <Avatar
            className={classes.smallAvatar}
            style={{ color: 'white', backgroundColor: 'black' }}>
            ?
          </Avatar>
        )}
        <span>{option.name}</span>
      </div>
    </components.Option>
  );
};

const OptionStyles = makeStyles((theme) => ({
  selectOption: {
    height: `100%`,
    display: `flex`,
    alignItems: `center`,
    flexDirection: `row`,
  },
  smallAvatar: {
    fontSize: 12,
    margin: theme.spacing(0),
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
  smallFilter: {
    fontSize: 12,
    margin: theme.spacing(0),
  },
}));

const ReactSelect = (props) => {
  const currentValue = props.currentValue;
  const optionList = props.optionList;
  const placeholder = props.placeholder;

  return (
    <Select
      value={currentValue}
      isClearable={true}
      isSearchable={true}
      placeholder={placeholder}
      getOptionValue={(option) => option.name}
      getOptionLabel={(option) => <ValueComponent option={option} />}
      options={optionList}
      components={{ Option }}
      onChange={props.onSelectChange}
      menuPortalTarget={document.querySelector('body')}
    />
  );
};

export default ReactSelect;
