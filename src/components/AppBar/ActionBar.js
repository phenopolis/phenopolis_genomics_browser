import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';
import { Link } from 'react-router-dom';

import {
  withWidth,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
} from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import LockIcon from '@material-ui/icons/Lock';
import DescriptionIcon from '@material-ui/icons/Description';
import PeopleIcon from '@material-ui/icons/People';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import TranslateIcon from '@material-ui/icons/Translate';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import { withTranslation } from 'react-i18next';

import GB from '../../assets/svg/gb.svg';
import CN from '../../assets/svg/cn.svg';
import JP from '../../assets/svg/jp.svg';
import DE from '../../assets/svg/de.svg';
import GR from '../../assets/svg/gr.svg';
import ES from '../../assets/svg/es.svg';

const LightTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 13,
  },
}))(Tooltip);

class ActionBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      languageOpen: false,
      accountOpen: false,
      languages: [
        { code: 'en', label: 'English', svg: GB },
        { code: 'cn', label: '中文', svg: CN },
        { code: 'ja', label: '日本語', svg: JP },
        { code: 'de', label: 'Deutsch', svg: DE },
        { code: 'gr', label: 'Ελληνικά', svg: GR },
        { code: 'es', label: 'Español', svg: ES },
      ],
    };
  }

  toggleDrawer = () => {
    this.props.ActionSidebarClicked();
  };

  handleLanguageClick = () => {
    this.setState({ languageOpen: !this.state.languageOpen });
  };

  render() {
    const { classes } = this.props;
    const { t, i18n } = this.props;

    const changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
      this.handleLanguageClick();
    };

    return (
      <div className={classes.list} role="presentation">
        <List>
          <ListItem button onClick={this.props.ActionbarSearch}>
            <LightTooltip
              disableHoverListener={this.props.expended}
              title={t('AppBar.SideBar.Label_Search')}
              placement="right">
              <ListItemIcon>
                <SearchIcon />
              </ListItemIcon>
            </LightTooltip>
            <ListItemText
              primary={t('AppBar.SideBar.Label_Search')}
              classes={{ primary: classes.listItemText }}
            />
          </ListItem>

          <ListItem button component={Link} to="/my_patients">
            <LightTooltip
              disableHoverListener={this.props.expended}
              title={t('AppBar.SideBar.Label_Patients')}
              placement="right">
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
            </LightTooltip>
            <ListItemText
              primary={t('AppBar.SideBar.Label_Patients')}
              classes={{ primary: classes.listItemText }}
            />
          </ListItem>

          <ListItem button component={Link} to="/publications">
            <LightTooltip
              disableHoverListener={this.props.expended}
              title={t('AppBar.SideBar.Label_Publication')}
              placement="right">
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
            </LightTooltip>
            <ListItemText
              primary={t('AppBar.SideBar.Label_Publication')}
              classes={{ primary: classes.listItemText }}
            />
          </ListItem>

          <ListItem button onClick={this.handleLanguageClick}>
            <LightTooltip
              disableHoverListener={this.props.expended}
              title={t('AppBar.SideBar.Label_Language')}
              placement="right">
              <ListItemIcon>
                <TranslateIcon />
              </ListItemIcon>
            </LightTooltip>
            <ListItemText
              primary={t('AppBar.SideBar.Label_Language')}
              classes={{ primary: classes.listItemText }}
            />
            {this.state.languageOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse in={this.state.languageOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {this.state.languages.map((lan, lanIndex) => {
                return (
                  <ListItem
                    button
                    onClick={() => changeLanguage(lan.code)}
                    className={classes.nested}>
                    <LightTooltip
                      disableHoverListener={this.props.expended}
                      title={lan.label}
                      placement="right">
                      <ListItemIcon>
                        <img className={classes.imageIcon} src={lan.svg} alt={lan.label} />
                      </ListItemIcon>
                    </LightTooltip>
                    <ListItemText primary={lan.label} classes={{ primary: classes.listItemText }} />
                  </ListItem>
                );
              })}
            </List>
          </Collapse>

          <ListItem button onClick={() => this.setState({ accountOpen: !this.state.accountOpen })}>
            <LightTooltip
              disableHoverListener={this.props.expended}
              title={this.props.username}
              placement="right">
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
            </LightTooltip>
            <ListItemText
              primary={this.props.username}
              classes={{ primary: classes.listItemText }}
            />
            {this.state.accountOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse in={this.state.accountOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button className={classes.nested}>
                <LightTooltip
                  disableHoverListener={this.props.expended}
                  title={t('AppBar.SideBar.Label_Change_Password')}
                  placement="right">
                  <ListItemIcon>
                    <LockIcon />
                  </ListItemIcon>
                </LightTooltip>
                <ListItemText
                  primary={t('AppBar.SideBar.Label_Change_Password')}
                  classes={{ primary: classes.listItemText }}
                />
              </ListItem>

              <ListItem button className={classes.nested} onClick={this.props.ActionbarLogout}>
                <LightTooltip
                  disableHoverListener={this.props.expended}
                  title={t('AppBar.SideBar.Label_Logout')}
                  placement="right">
                  <ListItemIcon>
                    <ExitToAppIcon />
                  </ListItemIcon>
                </LightTooltip>
                <ListItemText
                  primary={t('AppBar.SideBar.Label_Logout')}
                  classes={{ primary: classes.listItemText }}
                />
              </ListItem>
            </List>
          </Collapse>
        </List>
      </div>
    );
  }
}

ActionBar.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired,
};

const styles = (theme) => ({
  list: {
    width: 239,
    // border: '1px solid red'
  },
  listItemText: {
    fontSize: '1em',
  },
  nested: {
    paddingLeft: theme.spacing(4),
    fontSize: '0.85em',
  },
  avatar: {
    width: 23,
    height: 23,
  },
  imageIcon: {
    height: '1.2em',
    width: '1.2em',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
  },
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
});

export default compose(withStyles(styles), withWidth(), withTranslation())(ActionBar);
