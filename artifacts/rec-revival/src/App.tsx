import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/context/AuthContext';
import { MusicProvider } from '@/context/MusicContext';
import { PostsProvider } from '@/context/PostsContext';
import { PrefsProvider } from '@/context/PrefsContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { Toaster } from '@/components/ui/sonner';
import Nav from '@/components/Nav';
import MusicPlayer from '@/components/MusicPlayer';
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
        <Route component={NotFound} />
      </Switch>
      <MusicPlayer />
      <RecBuildAssistant />
    </>
  );
}

export default function App() {
  return (
    <PrefsProvider>
      <AuthProvider>
        <PostsProvider>
          <MusicProvider>
            <NotificationProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
                <Router />
              </WouterRouter>
              <Toaster />
            </NotificationProvider>
          </MusicProvider>
        </PostsProvider>
      </AuthProvider>
      <SplashScreen />
    </PrefsProvider>
  );
}
