import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { List, ListItem, ListItemIcon, ListItemText, Collapse } from '@material-ui/core';

import DescriptionIcon from '@material-ui/icons/Description';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import TranslateIcon from '@material-ui/icons/Translate';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

import { useTranslation } from 'react-i18next';

import GB from '../../assets/svg/gb.svg';
import CN from '../../assets/svg/cn.svg';
import JP from '../../assets/svg/jp.svg';
import DE from '../../assets/svg/de.svg';
import GR from '../../assets/svg/gr.svg';
import ES from '../../assets/svg/es.svg';
import { getPatients } from '../../redux/actions/patients';

const NoSideBar = (props) => {
  const [exploreOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleLogin = () => {
    props.SidebarLogin();
    props.SidebarClicked();
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    props.SidebarClicked();
  };

  return (
    <div className={'noSideBar-list'} role="presentation">
      <List>
        <ListItem button component={Link} to="/publications">
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText
            primary={t('AppBar.NoSideBar.Label_Publication')}
            classes={{ primary: 'noSideBar-listItemText' }}
          />
        </ListItem>
        <Collapse in={exploreOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={Link}
              to="/publications"
              onClick={props.SidebarClicked}
              className={'noSideBar-nested'}>
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText
                primary={t('AppBar.NoSideBar.Label_Publication')}
                classes={{ primary: 'noSideBar-listItemText' }}
              />
            </ListItem>

            <ListItem
              button
              component={Link}
              to="/product"
              onClick={props.SidebarClicked}
              className={'noSideBar-nested'}>
              <ListItemIcon>
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText
                primary={t('AppBar.NoSideBar.Label_Product')}
                classes={{ primary: 'noSideBar-listItemText' }}
              />
            </ListItem>
          </List>
        </Collapse>

        <ListItem button onClick={() => setLanguageOpen(!languageOpen)}>
          <ListItemIcon>
            <TranslateIcon />
          </ListItemIcon>
          <ListItemText
            primary={t('AppBar.NoSideBar.Label_Language')}
            classes={{ primary: 'noSideBar-listItemText' }}
          />
          {languageOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>

        <Collapse in={languageOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button onClick={() => changeLanguage('en')} className={'noSideBar-nested'}>
              <ListItemIcon>
                <img className={'appBar-imageIcon'} src={GB} alt="" />
              </ListItemIcon>
              <ListItemText primary="English" classes={{ primary: 'noSideBar-listItemText' }} />
            </ListItem>

            <ListItem button onClick={() => changeLanguage('cn')} className={'noSideBar-nested'}>
              <ListItemIcon>
                <img className={'appBar-imageIcon'} src={CN} alt="" />
              </ListItemIcon>
              <ListItemText primary="中文" classes={{ primary: 'noSideBar-listItemText' }} />
            </ListItem>

            <ListItem button onClick={() => changeLanguage('ja')} className={'noSideBar-nested'}>
              <ListItemIcon>
                <img className={'appBar-imageIcon'} src={JP} alt="" />
              </ListItemIcon>
              <ListItemText primary="日本語" classes={{ primary: 'noSideBar-listItemText' }} />
            </ListItem>

            <ListItem button onClick={() => changeLanguage('de')} className={'noSideBar-nested'}>
              <ListItemIcon>
                <img className={'appBar-imageIcon'} src={DE} alt="" />
              </ListItemIcon>
              <ListItemText primary="Deutsch" classes={{ primary: 'noSideBar-listItemText' }} />
            </ListItem>

            <ListItem button onClick={() => changeLanguage('gr')} className={'noSideBar-nested'}>
              <ListItemIcon>
                <img className={'appBar-imageIcon'} src={GR} alt="" />
              </ListItemIcon>
              <ListItemText primary="Ελληνικά" classes={{ primary: 'noSideBar-listItemText' }} />
            </ListItem>

            <ListItem button onClick={() => changeLanguage('es')} className={'noSideBar-nested'}>
              <ListItemIcon>
                <img className={'appBar-imageIcon'} src={ES} alt="" />
              </ListItemIcon>
              <ListItemText primary="Español" classes={{ primary: 'noSideBar-listItemText' }} />
            </ListItem>
          </List>
        </Collapse>

        <ListItem button onClick={toggleLogin}>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText
            primary={t('AppBar.NoSideBar.Label_Login')}
            classes={{ primary: 'noSideBar-listItemText' }}
          />
        </ListItem>
      </List>
    </div>
  );
};

NoSideBar.propTypes = {
  width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired,
};

export default NoSideBar;
