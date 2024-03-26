import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { SignupValidation } from "@/lib/validation";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const SignupForm = () => {

  const navigate = useNavigate();
  const [type, setType] = useState<'password' | 'text'>('password');

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
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });


  const handleSignup = async (user: z.infer<typeof SignupValidation>) => { };

  return (
    <Card className="w-full px-6 py-8 md:px-8 lg:w-1/2 rounded-xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-gray-600 dark:text-gray-200">Create a new account</CardTitle>
        <CardDescription className="text-center text-gray-600 dark:text-gray-200">To use our shop, Please enter your details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="sm:w-420 flex-center flex-col">
            <form
              onSubmit={form.handleSubmit(handleSignup)}
              className="flex flex-col gap-5 w-full mt-4"
            >
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label">First Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="John" className="block w-full px-4 py-2 h-12"   {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label">Last Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Doe" className="block w-full px-4 py-2 h-12"{...field} />
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
      </CardContent>
      <CardFooter className="flex items-center justify-between mt-5 mb-10">
        <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
        <Link
          to={"/sign-in"}
          className="text-xs text-gray-500 uppercase dark:text-gray-400 hover:underline"
        >
          or sign in
        </Link>
        <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
      </CardFooter>
    </Card>
  );
};

export default SignupForm;