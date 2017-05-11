import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducer from '~/reducers';
import Page1 from '~/pages/page1';
import Page2 from '~/pages/page2';

import './css/common.less';

const {
  Router,
  Route,
  hashHistory,
  IndexRoute,
  browserHistory,
  Link
} = ReactRouter;

console.log('----', ReactRouter);

class Application extends React.Component {
  render() {
    return (
      <div>
        <header>
          <Link to="page1">page1</Link>
          <Link to="page2">page2</Link>
        </header>
        <section>
          {this.props.children}
        </section>
        <footer>footer</footer>
      </div>
    );
  }
}

const store = createStore(reducer, applyMiddleware(thunkMiddleware));

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path="/" component={Application}>
        <IndexRoute component={Page1}/>
        <Route path="page1" component={Page1}></Route>
        <Route path="page2" component={Page2}></Route>
      </Route>
    </Router>
  </Provider>, document.getElementById('app'));
