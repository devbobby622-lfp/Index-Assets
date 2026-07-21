import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/context/AuthContext';
import { MusicProvider } from '@/context/MusicContext';
import { PostsProvider } from '@/context/PostsContext';
import { PrefsProvider } from '@/context/PrefsContext';
import { RealtimeProvider } from '@/context/RealtimeContext';
import Nav from '@/components/Nav';
import RecBuildAssistant from '@/components/RecBuildAssistant';
import SplashScreen from '@/components/SplashScreen';
import Home from '@/pages/Home';
import HaveFun from '@/pages/HaveFun';
import Support from '@/pages/Support';
import Settings from '@/pages/Settings';
import Instructions from '@/pages/Instructions';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import TwoFAVerify from '@/pages/TwoFAVerify';
import Players from '@/pages/Players';
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
        <Route path="/sign-in" component={SignIn} />
        <Route path="/sign-up" component={SignUp} />
        <Route path="/verify-2fa" component={TwoFAVerify} />
        <Route path="/players" component={Players} />
        <Route component={NotFound} />
      </Switch>
      <RecBuildAssistant />
    </>
  );
}

export default function App() {
  return (
    <PrefsProvider>
      <AuthProvider>
        <RealtimeProvider>
          <PostsProvider>
            <MusicProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
                <Router />
              </WouterRouter>
            </MusicProvider>
          </PostsProvider>
        </RealtimeProvider>
      </AuthProvider>
      <SplashScreen />
    </PrefsProvider>
  );
}
