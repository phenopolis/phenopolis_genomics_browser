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
  Divider,
} from '@material-ui/core';

import grey from '@material-ui/core/colors/grey';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faSearch,
  faScroll,
  faUsersMedical,
  faUsers,
  faUserPlus,
  faLanguage,
  faUserCircle,
  faSignOut,
  faKey,
  faAngleDown,
  faAngleUp,
} from '@fortawesome/pro-light-svg-icons';

import { faTh } from '@fortawesome/pro-duotone-svg-icons';

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
    fontSize: 15,
    padding: '0.5em',
  },
}))(Tooltip);

class ActionBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      languageOpen: false,
      accountOpen: false,
      patientOpen: false,
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
          <ListItem className={classes.listItem} button component={Link} to="/dashboard">
            <LightTooltip
              disableHoverListener={this.props.expended}
              title="Dashboard"
              placement="right">
              <ListItemIcon>
                <FontAwesomeIcon icon={faTh} className={classes.icon} style={{ fontSize: '22' }} />
              </ListItemIcon>
            </LightTooltip>
            <ListItemText primary="Dashboard" classes={{ primary: classes.listItemText }} />
          </ListItem>

          <ListItem className={classes.listItem} button onClick={this.props.ActionbarSearch}>
            <LightTooltip
              disableHoverListener={this.props.expended}
              title={t('AppBar.SideBar.Label_Search')}
              placement="right">
              <ListItemIcon>
                <FontAwesomeIcon
                  icon={faSearch}
                  className={classes.icon}
                  style={{ fontSize: '22' }}
                />
              </ListItemIcon>
            </LightTooltip>
            <ListItemText
              primary={t('AppBar.SideBar.Label_Search')}
              classes={{ primary: classes.listItemText }}
            />
          </ListItem>

          <ListItem
            className={classes.listItem}
            button
            onClick={() => this.setState({ patientOpen: !this.state.patientOpen })}>
            <LightTooltip
              disableHoverListener={this.props.expended}
              title={t('AppBar.SideBar.Label_Patients')}
              placement="right">
              <ListItemIcon>
                <FontAwesomeIcon
                  icon={faUsersMedical}
                  className={classes.icon}
                  style={{ fontSize: '22' }}
                />
              </ListItemIcon>
            </LightTooltip>
            <ListItemText
              primary={t('AppBar.SideBar.Label_Patients')}
              classes={{ primary: classes.listItemText }}
            />
            {this.state.patientOpen ? (
              <FontAwesomeIcon icon={faAngleUp} />
            ) : (
              <FontAwesomeIcon icon={faAngleDown} />
            )}
          </ListItem>

          <Collapse in={this.state.patientOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem className={classes.nested} button component={Link} to="/my_patients">
                <LightTooltip
                  disableHoverListener={this.props.expended}
                  title={t('AppBar.SideBar.Label_Patients')}
                  placement="right">
                  <ListItemIcon>
                    <FontAwesomeIcon
                      icon={faUsers}
                      className={classes.icon}
                      style={{ fontSize: '15' }}
                    />
                  </ListItemIcon>
                </LightTooltip>
                <ListItemText
                  primary={t('AppBar.SideBar.Label_Patients')}
                  classes={{ primary: classes.listItemText }}
                />
              </ListItem>

              <ListItem className={classes.nested} button component={Link} to="/create_patient">
                <LightTooltip
                  disableHoverListener={this.props.expended}
                  title="Add Patient"
                  placement="right">
                  <ListItemIcon>
                    <FontAwesomeIcon
                      icon={faUserPlus}
                      className={classes.icon}
                      style={{ fontSize: '15' }}
                    />
                  </ListItemIcon>
                </LightTooltip>
                <ListItemText primary="Add Patient" classes={{ primary: classes.listItemText }} />
              </ListItem>
            </List>
          </Collapse>

          <ListItem className={classes.listItem} button component={Link} to="/publications">
            <LightTooltip
              disableHoverListener={this.props.expended}
              title={t('AppBar.SideBar.Label_Publication')}
              placement="right">
              <ListItemIcon>
                <FontAwesomeIcon
                  icon={faScroll}
                  className={classes.icon}
                  style={{ fontSize: '22' }}
                />
              </ListItemIcon>
            </LightTooltip>
            <ListItemText
              primary={t('AppBar.SideBar.Label_Publication')}
              classes={{ primary: classes.listItemText }}
            />
          </ListItem>

          <Divider />

          <ListItem className={classes.listItem} button onClick={this.handleLanguageClick}>
            <LightTooltip
              disableHoverListener={this.props.expended}
              title={t('AppBar.SideBar.Label_Language')}
              placement="right">
              <ListItemIcon>
                <FontAwesomeIcon
                  icon={faLanguage}
                  className={classes.icon}
                  style={{ fontSize: '25' }}
                />
              </ListItemIcon>
            </LightTooltip>
            <ListItemText
              primary={t('AppBar.SideBar.Label_Language')}
              classes={{ primary: classes.listItemText }}
            />
            {this.state.languageOpen ? (
              <FontAwesomeIcon icon={faAngleUp} />
            ) : (
              <FontAwesomeIcon icon={faAngleDown} />
            )}
          </ListItem>

          <Collapse in={this.state.languageOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {this.state.languages.map((lan, lanIndex) => {
                return (
                  <ListItem
                    key={lanIndex}
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

          <ListItem
            className={classes.listItem}
            button
            onClick={() => this.setState({ accountOpen: !this.state.accountOpen })}>
            <LightTooltip
              disableHoverListener={this.props.expended}
              title={this.props.username}
              placement="right">
              <ListItemIcon>
                <FontAwesomeIcon
                  icon={faUserCircle}
                  className={classes.icon}
                  style={{ fontSize: '22' }}
                />
              </ListItemIcon>
            </LightTooltip>
            <ListItemText
              primary={this.props.username}
              classes={{ primary: classes.listItemText }}
            />
            {this.state.accountOpen ? (
              <FontAwesomeIcon icon={faAngleUp} />
            ) : (
              <FontAwesomeIcon icon={faAngleDown} />
            )}
          </ListItem>

          <Collapse in={this.state.accountOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button className={classes.nested}>
                <LightTooltip
                  disableHoverListener={this.props.expended}
                  title={t('AppBar.SideBar.Label_Change_Password')}
                  placement="right">
                  <ListItemIcon>
                    <FontAwesomeIcon
                      icon={faKey}
                      className={classes.icon}
                      style={{ fontSize: '15' }}
                    />
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
                    <FontAwesomeIcon
                      icon={faSignOut}
                      className={classes.icon}
                      style={{ fontSize: '15' }}
                    />
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
    backgroundColor: 'smokewhite',
  },
  listItem: {
    color: 'black',
    '&:hover': {
      color: '#2E84CF',
      backgroundColor: grey[100],
      '& $icon': {
        color: '#2E84CF',
      },
      '& $listItemText': {
        color: '#2E84CF',
      },
    },
  },
  icon: {
    fontSize: '20',
    marginLeft: '9px',
  },
  listItemText: {
    fontSize: '1em',
  },
  nested: {
    marginLeft: '3.5px',
    fontSize: '0.8em',
    backgroundColor: '#f5f5f5',
    '&:hover': {
      color: '#2E84CF',
      backgroundColor: grey[100],
      '& $icon': {
        color: '#2E84CF',
      },
      '& $listItemText': {
        color: '#2E84CF',
      },
    },
  },
  avatar: {
    width: 23,
    height: 23,
  },
  imageIcon: {
    marginLeft: '9px',
    height: '1.2em',
    width: '1.2em',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
  },
});

export default compose(withStyles(styles), withWidth(), withTranslation())(ActionBar);
