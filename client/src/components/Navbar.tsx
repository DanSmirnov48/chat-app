import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { UserNav } from "./UserNav";
import { useUserContext } from "@/context/AuthContext";
import { UserNotification } from "./UserNotifications";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import SignInDialog from "./signin-dialog";
import SignUpDialog from "./signup-dialog";
import { useDialogStore } from "@/hooks/useChat";

const Navbar = () => {
  const { isAuthenticated } = useUserContext();

  const { signInOpen, signUpOpen, dialogContent, setSignInOpen, setSignUpOpen, setDialogContent } = useDialogStore();

  const handleSignInClick = () => {
    setDialogContent(<SignInDialog />);
    setSignInOpen(true);
  };

  const handleSignUpClick = () => {
    setDialogContent(<SignUpDialog />);
    setSignUpOpen(true);
  };

  return (
    <header className="sticky h-20 inset-x-0 top-0 z-30 w-full bg-light-1 dark:bg-dark-2 transform duration-700 ease-in-out border-b border-gray-200 bg-background backdrop-blur-lg transition-all">
      <div className="mx-auto w-full max-w-screen-2xl px-2.5 md:px-10 flex h-20 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-4 md:gap-6">
          <Link to="/" className="flex z-40 items-center justify-evenly select-none font-semibold font-jost text-lg text-dark-4 dark:text-light-2 duration-700 ease-in-out">
            <img src="/logo.ico" alt="" className="w-10 mr-2" /><span>ChatApp</span>
          </Link>

          <Link
            to="/my-chats"
            className="flex items-center text-sm font-medium text-muted-foreground"
          >
            <span>My Chats</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-6">
            <>
              {isAuthenticated ? (
                <>
                  <UserNotification />
                  <UserNav />
                </>
              ) : (
                <>
                  <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
                    <DialogTrigger asChild onClick={handleSignInClick}>
                      <Button>
                        Log In <LogIn className="ml-1.5 h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    {dialogContent && <DialogContent className="max-w-screen-sm p-14">{dialogContent}</DialogContent>}
                  </Dialog>

                  <Dialog open={signUpOpen} onOpenChange={setSignUpOpen}>
                    <DialogTrigger asChild onClick={handleSignUpClick}>
                      <Button>
                        Sign Up <LogIn className="ml-1.5 h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    {dialogContent && <DialogContent className="max-w-screen-sm p-14">{dialogContent}</DialogContent>}
                  </Dialog>
                </>
              )}
            </>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;