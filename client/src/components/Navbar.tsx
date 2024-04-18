import { LogIn } from "lucide-react";
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
    <header className="sticky h-20 inset-x-0 top-0 z-30 w-full transform duration-700 ease-in-out backdrop-blur-lg transition-all">
      <div className="mx-auto w-full max-w-screen-lg px-2.5 md:px-10 flex h-20 items-center space-x-4 sm:justify-between sm:space-x-0">
        <nav className="flex flex-1 items-center justify-end space-x-8">
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
    </header>
  );
};

export default Navbar;