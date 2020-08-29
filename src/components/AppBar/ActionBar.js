import React, { useState } from 'react';
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
  faSignOut,
  faKey,
  faAngleDown,
  faAngleUp,
} from '@fortawesome/pro-light-svg-icons';
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
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguageOpen(!languageOpen);
  };

  return (
    <div className={'actionbar-list'} role="presentation">
      <List>
        <ListItem className={'actionbar-listItem'} button component={Link} to="/dashboard">
          <Tooltip disableHoverListener={props.expended} title="Dashboard" placement="right">
            <ListItemIcon>
              <FontAwesomeIcon
                icon={faTh}
                className={'actionbar-icon'}
                style={{ fontSize: '22' }}
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Dashboard" classes={{ primary: 'actionbar-listItemText' }} />
        </ListItem>
        <ListItem className={'actionbar-listItem'} button onClick={props.ActionbarSearch}>
          <Tooltip
            disableHoverListener={props.expended}
            title={t('AppBar.SideBar.Label_Search')}
            placement="right">
            <ListItemIcon>
              <FontAwesomeIcon
                icon={faSearch}
                className={'actionbar-icon'}
                style={{ fontSize: '22' }}
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText
            primary={t('AppBar.SideBar.Label_Search')}
            classes={{ primary: 'actionbar-listItemText' }}
          />
        </ListItem>
        <ListItem
          className={'actionbar-listItem'}
          button
          onClick={() => setPatientOpen(!patientOpen)}>
          <Tooltip
            disableHoverListener={props.expended}
            title={t('AppBar.SideBar.Label_Patients')}
            placement="right">
            <ListItemIcon>
              <FontAwesomeIcon
                icon={faUsersMedical}
                className={'actionbar-icon'}
                style={{ fontSize: '22' }}
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText
            primary={t('AppBar.SideBar.Label_Patients')}
            classes={{ primary: 'actionbar-listItemText' }}
          />
          {patientOpen ? (
            <FontAwesomeIcon icon={faAngleUp} />
          ) : (
            <FontAwesomeIcon icon={faAngleDown} />
          )}
        </ListItem>
        <Collapse in={patientOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem className={'actionbar-nested'} button component={Link} to="/my_patients">
              <Tooltip
                disableHoverListener={props.expended}
                title={t('AppBar.SideBar.Label_Patients')}
                placement="right">
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={faUsers}
                    className={'actionbar-icon'}
                    style={{ fontSize: '15' }}
                  />
                </ListItemIcon>
              </Tooltip>
              <ListItemText
                primary={t('AppBar.SideBar.Label_Patients')}
                classes={{ primary: 'actionbar-listItemText' }}
              />
            </ListItem>
            <ListItem className={'actionbar-nested'} button component={Link} to="/create_patient">
              <Tooltip disableHoverListener={props.expended} title="Add Patient" placement="right">
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={faUserPlus}
                    className={'actionbar-icon'}
                    style={{ fontSize: '15' }}
                  />
                </ListItemIcon>
              </Tooltip>
              <ListItemText primary="Add Patient" classes={{ primary: 'actionbar-listItemText' }} />
            </ListItem>
          </List>
        </Collapse>
        <ListItem className={'actionbar-listItem'} button component={Link} to="/publications">
          <Tooltip
            disableHoverListener={props.expended}
            title={t('AppBar.SideBar.Label_Publication')}
            placement="right">
            <ListItemIcon>
              <FontAwesomeIcon
                icon={faScroll}
                className={'actionbar-icon'}
                style={{ fontSize: '22' }}
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText
            primary={t('AppBar.SideBar.Label_Publication')}
            classes={{ primary: 'actionbar-listItemText' }}
          />
        </ListItem>
        <Divider />
        <ListItem
          className={'actionbar-listItem'}
          button
          onClick={() => setLanguageOpen(!languageOpen)}>
          <Tooltip
            disableHoverListener={props.expended}
            title={t('AppBar.SideBar.Label_Language')}
            placement="right">
            <ListItemIcon>
              <FontAwesomeIcon
                icon={faLanguage}
                className={'actionbar-icon'}
                style={{ fontSize: '25' }}
              />
            </ListItemIcon>
          </Tooltip>
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
        <Collapse in={languageOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {languages.map((lan, lanIndex) => {
              return (
                <ListItem
                  key={lanIndex}
                  button
                  onClick={() => changeLanguage(lan.code)}
                  className={'actionbar-nested'}>
                  <Tooltip
                    disableHoverListener={props.expended}
                    title={lan.label}
                    placement="right">
                    <ListItemIcon>
                      <img className={'actionbar-imageIcon'} src={lan.svg} alt={lan.label} />
                    </ListItemIcon>
                  </Tooltip>
                  <ListItemText
                    primary={lan.label}
                    classes={{ primary: 'actionbar-listItemText' }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Collapse>
        <ListItem
          className={'actionbar-listItem'}
          button
          onClick={() => setAccountOpen(!accountOpen)}>
          <Tooltip disableHoverListener={props.expended} title={props.username} placement="right">
            <ListItemIcon>
              <FontAwesomeIcon
                icon={faUserCircle}
                className={'actionbar-icon'}
                style={{ fontSize: '22' }}
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary={props.username} classes={{ primary: 'actionbar-listItemText' }} />
          {accountOpen ? (
            <FontAwesomeIcon icon={faAngleUp} />
          ) : (
            <FontAwesomeIcon icon={faAngleDown} />
          )}
        </ListItem>
        <Collapse in={accountOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button className={'actionbar-nested'}>
              <Tooltip
                disableHoverListener={props.expended}
                title={t('AppBar.SideBar.Label_Change_Password')}
                placement="right">
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={faKey}
                    className={'actionbar-icon'}
                    style={{ fontSize: '15' }}
                  />
                </ListItemIcon>
              </Tooltip>
              <ListItemText
                primary={t('AppBar.SideBar.Label_Change_Password')}
                classes={{ primary: 'actionbar-listItemText' }}
              />
            </ListItem>
            <ListItem button className={'actionbar-nested'} onClick={props.ActionbarLogout}>
              <Tooltip
                disableHoverListener={props.expended}
                title={t('AppBar.SideBar.Label_Logout')}
                placement="right">
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={faSignOut}
                    className={'actionbar-icon'}
                    style={{ fontSize: '15' }}
                  />
                </ListItemIcon>
              </Tooltip>
              <ListItemText
                primary={t('AppBar.SideBar.Label_Logout')}
                classes={{ primary: 'actionbar-listItemText' }}
              />
            </ListItem>
          </List>
        </Collapse>
      </List>
    </div>
  );
};

ActionBar.propTypes = {
  width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired,
};

export default ActionBar;
