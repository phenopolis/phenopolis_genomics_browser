import React from 'react';
import LearnReact from './page/LearnReact';

import HomeAppBar from './page/HomeAppBar';
import Login from './page/Login';
import Home from './page/Home';
import Publication from './page/Publication';
import Search from './page/Search';
import Gene from './page/Gene';
import AuthCheck from './page/AuthCheck';

import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';

// ***********************************************
// Router for each page, now I need to learn how to create various js vendor for each page.
// ***********************************************

function App() {
	return (
		<CookiesProvider>
			<Router>
				<AuthCheck />
				<div>
					<HomeAppBar />
					<Route exact path='/' component={Home} />
					<Route path='/login' component={Login} />
					<Route path='/publications' component={Publication} />
					<Route path='/search' component={Search} />
					<Route path='/gene/:geneId' component={Gene} />

					<Route path='/topics' component={Topics} />
					<Route path='/LearnReact' component={LearnReact} />
				</div>
			</Router>
		</CookiesProvider>
	);
}

// function Home() {
//   return <h2>Home</h2>;
// }

function Topic({ match }) {
	return <h3>Requested Param: {match.params.id}</h3>;
}

function Topics({ match }) {
	return (
		<div>
			<h2>Topics</h2>

			<ul>
				<li>
					<Link to={`${match.url}/components`}>Components</Link>
				</li>
				<li>
					<Link to={`${match.url}/props-v-state`}>Props v. State</Link>
				</li>
			</ul>

			<Route path={`${match.path}/:id`} component={Topic} />
			<Route exact path={match.path} render={() => <h3>Please select a topic.</h3>} />
		</div>
	);
}

// function Header() {
//   return (
//     <ul>
//       <li>
//         <Link to="/">Home</Link>
//       </li>
//       <li>
//         <Link to="/about">About</Link>
//       </li>
//       <li>
//         <Link to="/topics">Topics</Link>
//       </li>
//       <li>
//         <Link to="/LearnReact">LearnReact</Link>
//       </li>
//     </ul>
//   );
// }

export default App;
