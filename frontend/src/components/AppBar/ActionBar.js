import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  Divider,
  Typography,
} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faScroll,
  faUsersMedical,
  faUsers,
  faUserPlus,
  faLanguage,
  faUserCircle,
  faAngleDown,
  faAngleUp,
} from '@fortawesome/pro-regular-svg-icons';

import { faSignOut, faKey } from '@fortawesome/pro-solid-svg-icons';

import { faTh } from '@fortawesome/pro-duotone-svg-icons';
import { useTranslation } from 'react-i18next';
import GB from '../../assets/svg/gb.svg';
import CN from '../../assets/svg/cn.svg';
import JP from '../../assets/svg/jp.svg';
import DE from '../../assets/svg/de.svg';
import GR from '../../assets/svg/gr.svg';
import ES from '../../assets/svg/es.svg';

const ActionBar = (props) => {
  const languages = [
    { code: 'en', label: 'English', svg: GB },
    { code: 'cn', label: '中文', svg: CN },
    { code: 'ja', label: '日本語', svg: JP },
    { code: 'de', label: 'Deutsch', svg: DE },
    { code: 'gr', label: 'Ελληνικά', svg: GR },
    { code: 'es', label: 'Español', svg: ES },
  ];

  const [languageOpen, setLanguageOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [patientOpen, setPatientOpen] = useState(false);
  const { t, i18n, ready } = useTranslation();

  useEffect(() => {
    console.log(ready);
  }, [ready]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguageOpen(!languageOpen);
  };
  if (ready === true) {
    return (
      <div className={'actionbar-list'} role="presentation">
        <List style={{ padding: '0px' }}>
          <Tooltip
            disableHoverListener={props.expended}
            title={<Typography variant="body2">Dashboard</Typography>}
            placement="right">
            <ListItem
              className={'actionbar-listItem'}
              button
              component={Link}
              to="/dashboard"
              style={{ width: props.expended ? '239px' : '70px' }}>
              <ListItemIcon>
                <FontAwesomeIcon
                  icon={faTh}
                  className={'actionbar-icon'}
                  style={{ fontSize: '22' }}
                />
              </ListItemIcon>
              <ListItemText primary="Dashboard" classes={{ primary: 'actionbar-listItemText' }} />
            </ListItem>
          </Tooltip>

          <Tooltip
            disableHoverListener={props.expended}
            title={<Typography variant="body2">{t('AppBar.SideBar.Label_Search')}</Typography>}
            placement="right">
            <ListItem
              className={'actionbar-listItem'}
              button
              onClick={props.ActionbarSearch}
              style={{ width: props.expended ? '239px' : '70px' }}>
              <ListItemIcon>
                <FontAwesomeIcon
                  icon={faSearch}
                  className={'actionbar-icon'}
                  style={{ fontSize: '22' }}
                />
              </ListItemIcon>
              <ListItemText
                primary={t('AppBar.SideBar.Label_Search')}
                classes={{ primary: 'actionbar-listItemText' }}
              />
            </ListItem>
          </Tooltip>

          <Tooltip
            disableHoverListener={props.expended}
            title={<Typography variant="body2">{t('AppBar.SideBar.Label_Patients')}</Typography>}
            placement="right">
            <ListItem
              className={'actionbar-listItem'}
              button
              component={Link}
              to="/my_patients"
              style={{ width: props.expended ? '239px' : '70px' }}>
              <ListItemIcon>
                <FontAwesomeIcon
                  icon={faUsersMedical}
                  className={'actionbar-icon'}
                  style={{ fontSize: '22' }}
                />
              </ListItemIcon>
              <ListItemText
                primary={t('AppBar.SideBar.Label_Patients')}
                classes={{ primary: 'actionbar-listItemText' }}
              />
            </ListItem>
          </Tooltip>

          <Tooltip
            disableHoverListener={props.expended}
            title={<Typography variant="body2">{t('AppBar.SideBar.Label_Publication')}</Typography>}
            placement="right">
            <ListItem
              className={'actionbar-listItem'}
              button
              component={Link}
              to="/publications"
              style={{ width: props.expended ? '239px' : '70px' }}>
              <ListItemIcon>
                <FontAwesomeIcon
                  icon={faScroll}
                  className={'actionbar-icon'}
                  style={{ fontSize: '22' }}
                />
              </ListItemIcon>
              <ListItemText
                primary={t('AppBar.SideBar.Label_Publication')}
                classes={{ primary: 'actionbar-listItemText' }}
              />
            </ListItem>
          </Tooltip>

          <Divider />

          <Tooltip
            disableHoverListener={props.expended}
            title={<Typography variant="body2">{t('AppBar.SideBar.Label_Language')}</Typography>}
            placement="right">
            <ListItem
              className={'actionbar-listItem'}
              button
              onClick={() => setLanguageOpen(!languageOpen)}
              style={{ width: props.expended ? '239px' : '70px' }}>
              <ListItemIcon>
                <FontAwesomeIcon
                  icon={faLanguage}
                  className={'actionbar-icon'}
                  style={{ fontSize: '25' }}
                />
              </ListItemIcon>

              <ListItemText
                primary={t('AppBar.SideBar.Label_Language')}
                classes={{ primary: 'actionbar-listItemText' }}
              />
              {languageOpen ? (
                <FontAwesomeIcon icon={faAngleUp} />
              ) : (
                <FontAwesomeIcon icon={faAngleDown} />
              )}
            </ListItem>
          </Tooltip>

          <Collapse in={languageOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {languages.map((lan, lanIndex) => {
                return (
                  <Tooltip
                    disableHoverListener={props.expended}
                    title={<Typography variant="body2">{lan.label}</Typography>}
                    placement="right">
                    <ListItem
                      key={lanIndex}
                      button
                      onClick={() => changeLanguage(lan.code)}
                      style={{ width: props.expended ? '239px' : '70px', height: '40px' }}
                      className={'actionbar-nested'}>
                      <ListItemIcon>
                        <img className={'actionbar-imageIcon'} src={lan.svg} alt={lan.label} />
                      </ListItemIcon>
                      <ListItemText
                        primary={lan.label}
                        classes={{ primary: 'actionbar-listItemText' }}
                      />
                    </ListItem>
                  </Tooltip>
                );
              })}
            </List>
          </Collapse>

          <Tooltip
            disableHoverListener={props.expended}
            title={<Typography variant="body2">{props.username}</Typography>}
            placement="right">
            <ListItem
              className={'actionbar-listItem'}
              button
              onClick={() => setAccountOpen(!accountOpen)}
              style={{ width: props.expended ? '239px' : '70px' }}>
              <ListItemIcon>
                <FontAwesomeIcon
                  icon={faUserCircle}
                  className={'actionbar-icon'}
                  style={{ fontSize: '22' }}
                />
              </ListItemIcon>
              <ListItemText
                primary={props.username}
                classes={{ primary: 'actionbar-listItemText' }}
              />
              {accountOpen ? (
                <FontAwesomeIcon icon={faAngleUp} />
              ) : (
                <FontAwesomeIcon icon={faAngleDown} />
              )}
            </ListItem>
          </Tooltip>

          <Collapse in={accountOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <Tooltip
                disableHoverListener={props.expended}
                title={
                  <Typography variant="body2">
                    {t('AppBar.SideBar.Label_Change_Password')}
                  </Typography>
                }
                placement="right">
                <ListItem
                  button
                  className={'actionbar-nested'}
                  style={{ width: props.expended ? '239px' : '70px', height: '40px' }}>
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faKey} className={'actionbar-nesticon'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('AppBar.SideBar.Label_Change_Password')}
                    classes={{ primary: 'actionbar-listItemText' }}
                  />
                </ListItem>
              </Tooltip>
              <Tooltip
                disableHoverListener={props.expended}
                title={<Typography variant="body2">{t('AppBar.SideBar.Label_Logout')}</Typography>}
                placement="right">
                <ListItem
                  button
                  className={'actionbar-nested'}
                  onClick={props.ActionbarLogout}
                  style={{ width: props.expended ? '239px' : '70px', height: '40px' }}>
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faSignOut} className={'actionbar-nesticon'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('AppBar.SideBar.Label_Logout')}
                    classes={{ primary: 'actionbar-listItemText' }}
                  />
                </ListItem>
              </Tooltip>
            </List>
          </Collapse>
        </List>
      </div>
    );
  } else {
    return (
      <div>
        <h1> Loading Translation </h1>
      </div>
    );
  }
};

ActionBar.propTypes = {
  // width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired,
};

export default ActionBar;
