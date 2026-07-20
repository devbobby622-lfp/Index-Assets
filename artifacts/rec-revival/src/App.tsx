import { Route, Switch, Router as WouterRouter } from 'wouter';
import Nav from '@/components/Nav';
import Home from '@/pages/Home';
import HaveFun from '@/pages/HaveFun';
import Support from '@/pages/Support';
import Settings from '@/pages/Settings';
import Instructions from '@/pages/Instructions';
import NotFound from '@/pages/not-found';

function Router() {
  return (
    <>
      <Nav />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/have-fun" component={HaveFun} />
        <Route path="/support" component={Support} />
        <Route path="/settings" component={Settings} />
        <Route path="/instructions" component={Instructions} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Router />
    </WouterRouter>
  );
}

export default App;
