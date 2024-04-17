import { Button } from "@/components/ui/button"
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SignupValidation } from "@/lib/validation";
import { useDialogStore } from "@/hooks/useChat";
import SignInDialog from "./signin-dialog";

export default function SignUpDialog() {

    const navigate = useNavigate();
    const [type, setType] = useState<'password' | 'text'>('password');

    const { setSignInOpen, setSignUpOpen, setDialogContent } = useDialogStore();

    const handleToggle = () => {
        if (type === 'password') {
            setType('text');
        } else {
            setType('password');
        }
    };

    const form = useForm<z.infer<typeof SignupValidation>>({
        resolver: zodResolver(SignupValidation),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            passwordConfirm: "",
        },
    });

    const handleSignup = async (user: z.infer<typeof SignupValidation>) => { };

    const switchDialog = () => {
        setSignInOpen(true);
        setSignUpOpen(false)
        setDialogContent(<SignInDialog />);
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle className="text-center text-gray-600 dark:text-gray-200">Create a new account</DialogTitle>
                <DialogDescription className="text-center text-gray-600 dark:text-gray-200">To use our shop, Please enter your details</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <div className="sm:w-420 flex-center flex-col">
                    <form
                        onSubmit={form.handleSubmit(handleSignup)}
                        className="flex flex-col gap-5 w-full mt-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Name </FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="John Doe" className="block w-full px-4 py-2 h-12"{...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="johndoe@email.com" className="block w-full px-4 py-2 h-12"{...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Password</FormLabel>
                                    <div className="relative">
                                        <FormControl className="flex-grow pr-10">
                                            <Input type={type} maxLength={50} placeholder="Password" className="block w-full px-4 py-2 h-12" {...field} />
                                        </FormControl>
                                        <span className="absolute right-3 top-3 cursor-pointer" onClick={handleToggle}>
                                            {type === 'password' ? <Eye /> : <EyeOff />}
                                        </span>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="passwordConfirm"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Confirm Password</FormLabel>
                                    <div className="relative">
                                        <FormControl className="flex-grow pr-10">
                                            <Input type={type} maxLength={50} placeholder="Confirm Password" className="block w-full px-4 py-2 h-12" {...field} />
                                        </FormControl>
                                        <span className="absolute right-3 top-3 cursor-pointer" onClick={handleToggle}>
                                            {type === 'password' ? <Eye /> : <EyeOff />}
                                        </span>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="mt-6">
                            <Button type="submit" disabled={false} className="w-full px-6 py-3 text-lg font-medium tracking-wide text-white dark:text-dark-4 capitalize transition-colors duration-300 transform rounded-lg focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50">
                                {false ? <><Loader2 className="animate-spin h-5 w-5 mr-3" />Processing...</> : <>Sign Up</>}
                            </Button>
                        </div>
                    </form>
                </div>
            </Form>
            <DialogFooter className="flex sm:justify-center items-center my-5">
                <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
                <Button variant={"link"} onClick={switchDialog} className="text-xs text-gray-500 uppercase dark:text-gray-400 hover:underline">or sign up</Button>
                <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
            </DialogFooter>
        </>
    )
}
