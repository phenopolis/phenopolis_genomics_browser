import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';
import { Link } from 'react-router-dom';

import { withWidth, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import LockIcon from '@material-ui/icons/Lock';
import DescriptionIcon from '@material-ui/icons/Description';
import PeopleIcon from '@material-ui/icons/People';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import TranslateIcon from '@material-ui/icons/Translate';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

import { withTranslation } from 'react-i18next';

import GB from '../../assets/svg/gb.svg';
import CN from '../../assets/svg/cn.svg';
import JP from '../../assets/svg/jp.svg';
import DE from '../../assets/svg/de.svg';
import GR from '../../assets/svg/gr.svg';
import ES from '../../assets/svg/es.svg';

class SideBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exploreOpen: false,
      languageOpen: false,
    };
  }

  toggleDrawer = () => {
    this.props.SidebarClicked();
  };

  toggleLogout = () => {
    this.props.SidebarLogout();
    this.toggleDrawer();
  };

  handleExploreClick = () => {
    this.setState({ exploreOpen: !this.state.exploreOpen });
  };

  handleLanguageClick = () => {
    this.setState({ languageOpen: !this.state.languageOpen });
  };

  render() {
    const { classes } = this.props;
    const { t, i18n } = this.props;

    const changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
      this.toggleDrawer();
    };

    return (
      <div className={classes.list} role="presentation">
        <List>
          <ListItem button component={Link} to="/search" onClick={this.toggleDrawer}>
            <ListItemIcon>
              <SearchIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('AppBar.SideBar.Label_Search')}
              classes={{ primary: classes.listItemText }}
            />
          </ListItem>

          <ListItem button component={Link} to="/my_patients" onClick={this.toggleDrawer}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('AppBar.SideBar.Label_Patients')}
              classes={{ primary: classes.listItemText }}
            />
          </ListItem>

          <ListItem button component={Link} to="/publications">
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('AppBar.SideBar.Label_Publication')}
              classes={{ primary: classes.listItemText }}
            />
          </ListItem>

          {/* <ListItem button onClick={this.handleExploreClick}>
						<ListItemIcon>
							<Avatar src={require('../../assets/image/phenopolis_logo_grey.png')} className={classes.avatar} />
						</ListItemIcon>
						<ListItemText primary={t('AppBar.SideBar.Label_Explore')} classes={{ primary: classes.listItemText }} />
						{this.state.exploreOpen ? <ExpandLess /> : <ExpandMore />}
					</ListItem> */}

          <Collapse in={this.state.exploreOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                button
                component={Link}
                to="/publications"
                onClick={this.toggleDrawer}
                className={classes.nested}>
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('AppBar.SideBar.Label_Publication')}
                  classes={{ primary: classes.listItemText }}
                />
              </ListItem>

              <ListItem
                button
                component={Link}
                to="/product"
                onClick={this.toggleDrawer}
                className={classes.nested}>
                <ListItemIcon>
                  <ShoppingCartIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('AppBar.SideBar.Label_Product')}
                  classes={{ primary: classes.listItemText }}
                />
              </ListItem>
            </List>
          </Collapse>

          <ListItem button onClick={this.handleLanguageClick}>
            <ListItemIcon>
              <TranslateIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('AppBar.SideBar.Label_Language')}
              classes={{ primary: classes.listItemText }}
            />
            {this.state.languageOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse in={this.state.languageOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button onClick={() => changeLanguage('en')} className={classes.nested}>
                <ListItemIcon>
                  <img className={classes.imageIcon} src={GB} alt="" />
                </ListItemIcon>
                <ListItemText primary="English" classes={{ primary: classes.listItemText }} />
              </ListItem>

              <ListItem button onClick={() => changeLanguage('cn')} className={classes.nested}>
                <ListItemIcon>
                  <img className={classes.imageIcon} src={CN} alt="" />
                </ListItemIcon>
                <ListItemText primary="中文" classes={{ primary: classes.listItemText }} />
              </ListItem>

              <ListItem button onClick={() => changeLanguage('ja')} className={classes.nested}>
                <ListItemIcon>
                  <img className={classes.imageIcon} src={JP} alt="" />
                </ListItemIcon>
                <ListItemText primary="日本語" classes={{ primary: classes.listItemText }} />
              </ListItem>

              <ListItem button onClick={() => changeLanguage('de')} className={classes.nested}>
                <ListItemIcon>
                  <img className={classes.imageIcon} src={DE} alt="" />
                </ListItemIcon>
                <ListItemText primary="Deutsch" classes={{ primary: classes.listItemText }} />
              </ListItem>

              <ListItem button onClick={() => changeLanguage('gr')} className={classes.nested}>
                <ListItemIcon>
                  <img className={classes.imageIcon} src={GR} alt="" />
                </ListItemIcon>
                <ListItemText primary="Ελληνικά" classes={{ primary: classes.listItemText }} />
              </ListItem>

              <ListItem button onClick={() => changeLanguage('es')} className={classes.nested}>
                <ListItemIcon>
                  <img className={classes.imageIcon} src={ES} alt="" />
                </ListItemIcon>
                <ListItemText primary="Español" classes={{ primary: classes.listItemText }} />
              </ListItem>
            </List>
          </Collapse>

          <ListItem button>
            <ListItemIcon>
              <LockIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('AppBar.SideBar.Label_Change_Password')}
              classes={{ primary: classes.listItemText }}
            />
          </ListItem>

          <ListItem button onClick={this.toggleLogout}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('AppBar.SideBar.Label_Logout')}
              classes={{ primary: classes.listItemText }}
            />
          </ListItem>
        </List>
      </div>
    );
  }
}

SideBar.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired,
};

const styles = (theme) => ({
  list: {
    width: 250,
  },
  listItemText: {
    fontSize: '0.97em',
  },
  nested: {
    paddingLeft: theme.spacing(4),
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
});

export default compose(withStyles(styles), withWidth(), withTranslation())(SideBar);
