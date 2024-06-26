import { Button } from "@/components/ui/button"
import {
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SigninValidation } from "@/lib/validation";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useSignInAccount } from "@/lib/react-query/queries/auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { IMessage, INotification, IUser } from "@/types";
import { useUserContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNotificationStore } from "@/hooks/useNotifications";
import { useChatStore } from "@/hooks/useChat";
import { io } from "socket.io-client";
import { useDialogStore } from "@/hooks/useChat";
import SignUpDialog from "./signup-dialog";

interface AuthResponse {
    status?: any;
    error?: any;
    statusText?: string;
    data?: {
        accessToke: string;
        status: string
        data: {
            userWithoutPassword: IUser;
            incomingMessages?: IMessage[] | null;
            notifications?: INotification[] | null;
        }
    };
}

export default function SignInDialog() {

    const { addNotification } = useNotificationStore();
    const { setOnlineUsers, setSocket, onlineUsers } = useChatStore();
    const { setUser, setIsAuthenticated } = useUserContext();

    const { setSignInOpen, setSignUpOpen, setDialogContent } = useDialogStore();

    const [type, setType] = useState<'password' | 'text'>('password');
    const [error, setError] = useState<string | undefined>();

    const handleToggle = () => {
        if (type === 'password') {
            setType('text');
        } else {
            setType('password');
        }
    };

    const { mutateAsync: signInAccount, isPending: loadingUser } = useSignInAccount();

    const form = useForm<z.infer<typeof SigninValidation>>({
        resolver: zodResolver(SigninValidation),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleSignin = async (user: z.infer<typeof SigninValidation>) => {
        try {
            const session: AuthResponse = await signInAccount(user);
            console.log(session)
            if (session.error && session.error.error === "Incorrect email or password") {
                setError(session.error.error)
            }
            if (session.data && session.data.status === "success") {
                const user = session.data.data.userWithoutPassword as IUser
                setUser(user)
                setIsAuthenticated(true)

                const newSocket = io("http://localhost:3000")
                setSocket(newSocket)

                // Set add Notifications
                if (session.data.data.notifications) {
                    for (const notification of session.data.data.notifications) {
                        addNotification(notification);

                        if (onlineUsers.some(u => u.userId === notification.senderId)) {
                            let newStatus = notification.status;
                            let messageId = notification.messageId;
                            let recipientId = notification.senderId;
                            console.log("Sending 'sendMessageStatusUpdate' Socket Event", messageId, recipientId);
                            newSocket.emit("sendMessageStatusUpdate", { messageId, recipientId, newStatus });
                        }
                    }
                }

                toast.success(`Nice to see you back ${user.name}`)
                // setSignInOpen(false);
            }
        } catch (error) {
            toast.error('Unknown Error', {
                description: `Unknown Error at Sign In: ${error}`,
            })
        }
    };

    const switchDialog = () => {
        setSignInOpen(false);
        setSignUpOpen(true)
        setDialogContent(<SignUpDialog />);
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle className="mt-3 text-2xl text-center text-gray-600 dark:text-gray-200">Welcome back!</DialogTitle>
                <DialogDescription className="flex items-center justify-between my-6">
                    <span className="w-1/5 border-b dark:border-gray-600 lg:w-1/4"></span>
                    <div className="text-xs text-center text-gray-500 uppercase dark:text-gray-400">Sign In with email & password</div>
                    <span className="w-1/5 border-b dark:border-gray-400 lg:w-1/4"></span>
                </DialogDescription>
            </DialogHeader>
            {error &&
                <div className="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800" role="alert">
                    <AlertCircle className="w-6 h-6 mr-2" />
                    <span className="sr-only">Info</span>
                    <div className="text-base">
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
            }
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSignin)} className="flex flex-col gap-5 w-full mt-4">

                    <div className="mt-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200">Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Email" className="block w-full px-4 py-2 h-12" {...field} onFocus={() => setError(undefined)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="relative">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex justify-between mt-2">
                                        <FormLabel className="shad-form_label">Password</FormLabel>
                                        <Link to="/forgot-password" className="text-xs text-gray-500 dark:text-gray-300 hover:underline">Forget Password?</Link>
                                    </div>
                                    <div className="relative">
                                        <FormControl className="flex-grow pr-10">
                                            <Input type={type} maxLength={35} placeholder="Password" className="block w-full px-4 py-2 h-12" {...field} onFocus={() => setError(undefined)} />
                                        </FormControl>
                                        <span className="absolute right-3 top-3 cursor-pointer" onClick={handleToggle}>
                                            {type === 'password' ? <Eye /> : <EyeOff />}
                                        </span>
                                    </div>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="mt-6">
                        <Button type="submit" disabled={loadingUser} className="w-full px-6 py-3 text-lg font-medium tracking-wide text-white dark:text-dark-4 capitalize transition-colors duration-300 transform rounded-lg focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50">
                            {loadingUser ? <><Loader2 className="animate-spin h-5 w-5 mr-3" />Processing...</> : <>log in</>}
                        </Button>
                    </div>
                </form>
            </Form>
            <DialogFooter className="flex sm:justify-center items-center my-5">
                <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
                <Button variant={"link"} onClick={switchDialog} className="text-xs text-gray-500 uppercase dark:text-gray-400 hover:underline">or sign up</Button>
                <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
            </DialogFooter>
        </>
    )
}
